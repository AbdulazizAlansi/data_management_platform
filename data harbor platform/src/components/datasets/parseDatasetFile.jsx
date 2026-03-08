/**
 * Real data quality engine.
 * Supported checks: Empty Cells, Empty Columns.
 * Row numbers refer to DATA rows only (header excluded). Data Row 1 = first row after header.
 */
import * as XLSX from "xlsx";

function isBlank(v) {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

function detectType(values) {
  const nonNull = values.filter(v => !isBlank(v));
  if (nonNull.length === 0) return "string";
  if (nonNull.every(v => !isNaN(Number(v)))) return "number";
  if (nonNull.every(v => !isNaN(Date.parse(v)) && isNaN(Number(v)))) return "date";
  return "string";
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const splitLine = (line) => {
    const result = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; continue; }
      if (line[i] === ',' && !inQ) { result.push(cur.trim()); cur = ""; continue; }
      cur += line[i];
    }
    result.push(cur.trim());
    return result;
  };
  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const vals = splitLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (data.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(data[0]);
  const rows = data.map(item => {
    const obj = {};
    headers.forEach(h => { obj[h] = item[h] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

export async function parseDatasetFile(file) {
  const name = file.name.toLowerCase();
  let headers = [], rows = [];

  if (name.endsWith(".csv")) {
    const text = await file.text();
    ({ headers, rows } = parseCSV(text));
  } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    ({ headers, rows } = await parseExcel(file));
  } else {
    return null; // unsupported
  }

  const row_count = rows.length;
  const column_count = headers.length;

  // ── Column info / profiling ─────────────────────────────────────────
  const columns_info = headers.map(h => {
    const values = rows.map(r => r[h]);
    const type = detectType(values);
    const nonEmpty = values.filter(v => !isBlank(v));
    const sample_values = [...new Set(nonEmpty.slice(0, 5).map(String))];
    const missingCount = values.length - nonEmpty.length;
    const missingPct = values.length > 0 ? Math.round((missingCount / values.length) * 100) : 0;
    let stats = { missing_count: missingCount, missing_pct: missingPct };

    if (type === "number") {
      const nums = nonEmpty.map(Number).filter(n => !isNaN(n));
      if (nums.length > 0) {
        const sorted = [...nums].sort((a, b) => a - b);
        stats.min = sorted[0];
        stats.max = sorted[sorted.length - 1];
        stats.avg = Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 100) / 100;
        const range = stats.max - stats.min;
        const binCount = Math.min(10, new Set(nums).size);
        if (range > 0 && binCount > 1) {
          const binSize = range / binCount;
          const bins = Array.from({ length: binCount }, (_, i) => ({
            label: `${Math.round((stats.min + i * binSize) * 100) / 100}`,
            count: 0,
          }));
          nums.forEach(n => {
            const idx = Math.min(Math.floor((n - stats.min) / binSize), binCount - 1);
            bins[idx].count++;
          });
          stats.histogram = bins;
        } else {
          stats.histogram = [...new Set(nums)].slice(0, 10).map(v => ({ label: String(v), count: nums.filter(n => n === v).length }));
        }
      }
    } else {
      const freq = {};
      nonEmpty.forEach(v => { const k = String(v); freq[k] = (freq[k] || 0) + 1; });
      stats.top_values = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, count]) => ({ label, count }));
    }

    return { name: h, type, sample_values, ...stats };
  });

  const sample_rows = rows.slice(0, 50);

  // ── Empty columns ───────────────────────────────────────────────────
  const emptyColNames = headers.filter(h => rows.every(r => isBlank(r[h])));

  // ── Column type detection per column ────────────────────────────────
  const colTypes = {};
  headers.forEach(h => {
    const values = rows.map(r => r[h]);
    colTypes[h] = detectType(values);
  });

  // ── Duplicate rows ───────────────────────────────────────────────────
  const rowSignatures = rows.map(r => JSON.stringify(headers.map(h => String(r[h] ?? "").trim())));
  const seenSignatures = new Map();
  const duplicateRowIndices = new Set();
  rowSignatures.forEach((sig, idx) => {
    if (seenSignatures.has(sig)) {
      duplicateRowIndices.add(idx);
      duplicateRowIndices.add(seenSignatures.get(sig));
    } else {
      seenSignatures.set(sig, idx);
    }
  });

  // ── Build issue list (row-level) ────────────────────────────────────
  const quality_issues = [];

  function isValidDate(v) {
    const s = String(v).trim();
    if (!s) return false;
    const d = new Date(s);
    return !isNaN(d.getTime());
  }

  rows.forEach((row, idx) => {
    const dataRow = idx + 1;

    // Empty cells
    headers.forEach(h => {
      if (emptyColNames.includes(h)) return;
      const v = row[h];
      if (isBlank(v)) {
        quality_issues.push({
          row: dataRow, column: h, value: "",
          issue_type: "Empty Cell",
          suggested_fix: `Fill in the missing value for column "${h}" at Data Row ${dataRow}`,
        });
      }
    });

    // Duplicate rows
    if (duplicateRowIndices.has(idx)) {
      quality_issues.push({
        row: dataRow, column: null, value: rowSignatures[idx],
        issue_type: "Duplicate Row",
        suggested_fix: `Data Row ${dataRow} appears to be a duplicate — consider removing it`,
      });
    }

    // Invalid dates & invalid numerics
    headers.forEach(h => {
      if (emptyColNames.includes(h)) return;
      const v = row[h];
      if (isBlank(v)) return;
      const colType = colTypes[h];

      if (colType === "date" && !isValidDate(v)) {
        quality_issues.push({
          row: dataRow, column: h, value: String(v),
          issue_type: "Invalid Date",
          suggested_fix: `Value "${v}" in column "${h}" at Data Row ${dataRow} is not a valid date`,
        });
      }

      if (colType === "number" && isNaN(Number(v))) {
        quality_issues.push({
          row: dataRow, column: h, value: String(v),
          issue_type: "Invalid Numeric",
          suggested_fix: `Value "${v}" in column "${h}" at Data Row ${dataRow} is not a valid number`,
        });
      }
    });
  });

  // Consistency issues: columns with mixed types (e.g. mostly numbers but some text)
  let consistency_issues_count = 0;
  headers.forEach(h => {
    if (emptyColNames.includes(h)) return;
    const values = rows.map(r => r[h]).filter(v => !isBlank(v));
    if (values.length === 0) return;
    const numericCount = values.filter(v => !isNaN(Number(v))).length;
    const textCount = values.length - numericCount;
    // Mixed: more than 5% are of a different type and not all the same type
    if (numericCount > 0 && textCount > 0) {
      const minorCount = Math.min(numericCount, textCount);
      if (minorCount / values.length > 0.05) {
        consistency_issues_count++;
        const exampleRows = rows.reduce((acc, row, idx) => {
          if (acc.length >= 3) return acc;
          const v = row[h];
          if (!isBlank(v) && (colTypes[h] === "number" ? isNaN(Number(v)) : !isNaN(Number(v)))) {
            acc.push({ row: idx + 1, v });
          }
          return acc;
        }, []);
        exampleRows.forEach(({ row: dataRow, v }) => {
          quality_issues.push({
            row: dataRow, column: h, value: String(v),
            issue_type: "Consistency Issue",
            suggested_fix: `Column "${h}" has mixed data types. Value "${v}" at Data Row ${dataRow} is inconsistent`,
          });
        });
      }
    }
  });

  // Empty column issues
  emptyColNames.forEach(h => {
    quality_issues.push({
      row: null, column: h, value: "(entire column is empty)",
      issue_type: "Empty Column",
      suggested_fix: `Remove or populate the empty column "${h}"`,
    });
  });

  // ── Aggregate summary counts ────────────────────────────────────────
  const empty_cells      = quality_issues.filter(i => i.issue_type === "Empty Cell").length;
  const empty_columns    = quality_issues.filter(i => i.issue_type === "Empty Column").length;
  const duplicate_rows   = duplicateRowIndices.size;
  const invalid_dates    = quality_issues.filter(i => i.issue_type === "Invalid Date").length;
  const invalid_numerics = quality_issues.filter(i => i.issue_type === "Invalid Numeric").length;
  const consistency_issues = quality_issues.filter(i => i.issue_type === "Consistency Issue").length;

  const affected_rows = new Set(quality_issues.filter(i => i.row != null).map(i => i.row)).size;

  // ── Score ───────────────────────────────────────────────────────────
  const totalCells = (row_count * column_count) || 1;
  const issueWeight = empty_cells + empty_columns * row_count + duplicate_rows + invalid_dates + invalid_numerics + consistency_issues;
  const quality_score = Math.round(Math.min(100, Math.max(0, 100 - (issueWeight / totalCells) * 100)));
  const quality_status = quality_score >= 85 ? "Good" : quality_score >= 70 ? "Needs Review" : "Poor Quality";

  const warnings = [];
  const recommendations = [];
  const affectedColsCount = new Set(quality_issues.filter(i => i.issue_type === "Empty Cell").map(i => i.column)).size;
  if (empty_cells > 0)         { warnings.push(`${empty_cells} empty cell(s) across ${affectedColsCount} column(s), affecting ${affected_rows} data row(s)`); recommendations.push("Fill or impute empty cells before analysis"); }
  if (empty_columns > 0)       { warnings.push(`${empty_columns} completely empty column(s) detected`); recommendations.push("Remove or populate empty columns"); }
  if (duplicate_rows > 0)      { warnings.push(`${duplicate_rows} duplicate row(s) detected`); recommendations.push("Remove duplicate rows to ensure data integrity"); }
  if (invalid_dates > 0)       { warnings.push(`${invalid_dates} invalid date value(s) detected`); recommendations.push("Standardize date formats across date columns"); }
  if (invalid_numerics > 0)    { warnings.push(`${invalid_numerics} invalid numeric value(s) detected`); recommendations.push("Clean non-numeric values from numeric columns"); }
  if (consistency_issues > 0)  { warnings.push(`${consistency_issues} consistency issue(s) detected (mixed types in columns)`); recommendations.push("Ensure columns contain consistent data types"); }
  if (warnings.length === 0)   recommendations.push("Dataset looks clean — no issues detected");

  return {
    row_count,
    column_count,
    columns_info,
    sample_rows,
    quality: {
      quality_score,
      quality_status,
      missing_values: empty_cells,
      empty_columns,
      duplicate_rows,
      invalid_dates,
      invalid_numerics,
      consistency_issues,
      affected_rows,
      warnings,
      recommendations,
      quality_issues,
      column_quality: columns_info.map(c => ({
        column_name: c.name,
        completeness: row_count > 0
          ? Math.round((rows.filter(r => !isBlank(r[c.name])).length / row_count) * 100)
          : 100,
        validity: 100,
        issues: quality_issues.filter(i => i.column === c.name).map(i =>
          i.row != null ? `Data Row ${i.row}: ${i.issue_type}` : i.issue_type
        ),
      })),
    },
  };
}