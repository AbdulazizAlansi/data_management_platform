import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { User, Mail, Shield, Calendar, LogOut, Trash2, Pencil, Check, X } from "lucide-react";
import moment from "moment";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      await base44.auth.updateMe({ full_name: nameInput.trim() });
      // Optimistically update local state since me() may return stale cache
      setUser(prev => ({ ...prev, full_name: nameInput.trim() }));
      setEditingName(false);
    } catch (e) {
      console.error("Failed to update name:", e);
    }
    setIsSavingName(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Delete all user datasets
      const datasets = await base44.entities.Dataset.list("-created_date", 1000);
      const userDatasets = datasets.filter(d => d.created_by === user?.email);
      for (const dataset of userDatasets) {
        await base44.entities.Dataset.delete(dataset.id);
      }
      
      // Delete all user activity logs
      const activities = await base44.entities.ActivityLog.list("-created_date", 1000);
      const userActivities = activities.filter(a => a.user_email === user?.email);
      for (const activity of userActivities) {
        await base44.entities.ActivityLog.delete(activity.id);
      }
      
      // Delete quality results associated with user's datasets
      const qualityResults = await base44.entities.QualityResult.list("-created_date", 1000);
      const userQualityResults = qualityResults.filter(q => userDatasets.some(d => d.id === q.dataset_id));
      for (const qr of userQualityResults) {
        await base44.entities.QualityResult.delete(qr.id);
      }

      // Delete dataset versions associated with user's datasets
      const versions = await base44.entities.DatasetVersion.list("-created_date", 1000);
      const userVersions = versions.filter(v => userDatasets.some(d => d.id === v.dataset_id));
      for (const version of userVersions) {
        await base44.entities.DatasetVersion.delete(version.id);
      }

      // Finally, logout and redirect
      await base44.auth.logout("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your account information</p>
      </div>

      <Card className="border-slate-200/60">
        <CardContent className="pt-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.full_name || "User"}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <Badge variant="outline" className="mt-1">{user.role || "user"}</Badge>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5">
            {/* Full Name — editable */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Full Name</p>
                {editingName ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                      className="h-7 text-sm py-0"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={handleSaveName} disabled={isSavingName}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400" onClick={() => setEditingName(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-800">{user.full_name || "Not set"}</p>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-teal-600"
                      onClick={() => { setNameInput(user.full_name || ""); setEditingName(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {[
              { icon: Mail, label: "Email", value: user.email },
              { icon: Shield, label: "Role", value: user.role || "user" },
              { icon: Calendar, label: "Joined", value: moment(user.created_date).format("MMMM D, YYYY") },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <Button variant="outline" className="w-full" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          </div>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your datasets, metadata, quality reports, activity logs, and versions will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
                <p className="text-sm text-red-800 font-medium">⚠️ Warning: This will delete everything associated with your account.</p>
              </div>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount} 
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}