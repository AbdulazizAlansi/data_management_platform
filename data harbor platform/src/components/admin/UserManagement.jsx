import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const ROLE_STYLES = {
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  user:  "bg-slate-50 text-slate-600 border-slate-200",
};

export default function UserManagement({ users, loading, currentUserId }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success(t["Role updated"]); },
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder={t["Search users…"]} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">{t["Name"]}</TableHead>
                <TableHead className="text-xs font-semibold">{t["Email"]}</TableHead>
                <TableHead className="text-xs font-semibold">{t["Role"]}</TableHead>
                <TableHead className="text-xs font-semibold">{t["Joined"]}</TableHead>
                <TableHead className="text-xs font-semibold">{t["Change Role"]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-sm">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-sm text-slate-600">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${ROLE_STYLES[u.role] || ROLE_STYLES.user}`}>
                      {u.role || "user"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{moment(u.created_date).format("MMM D, YYYY")}</TableCell>
                  <TableCell>
                    {u.id !== currentUserId ? (
                      <Select
                        value={u.role || "user"}
                        onValueChange={role => roleMutation.mutate({ id: u.id, role })}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-slate-400 italic">{t["You"]}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-400 py-8">{t["No users found"]}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}