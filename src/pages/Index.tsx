import { useState } from 'react';
import { usePasswordStore } from '@/hooks/usePasswordStore';
import { Header } from '@/components/Header';
import { SecurityScoreCard } from '@/components/SecurityScoreCard';
import { PasswordList } from '@/components/PasswordList';
import { PasswordForm } from '@/components/PasswordForm';
import { PassphraseGenerator } from '@/components/PassphraseGenerator';
import { DuplicateAlert } from '@/components/DuplicateAlert';
import { PasswordEntry } from '@/types/password';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Key, Wand2 } from 'lucide-react';

const Index = () => {
  const {
    passwords,
    isLoading,
    isChecking,
    addPassword,
    updatePassword,
    deletePassword,
    checkAllPasswords,
    calculateSecurityScore,
    getDuplicateGroups,
  } = usePasswordStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const securityScore = calculateSecurityScore();
  const duplicateGroups = getDuplicateGroups();

  const handleAddPassword = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEditPassword = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength' | 'isCompromised' | 'breachCount' | 'lastChecked'>) => {
    if (editingEntry) {
      await updatePassword(editingEntry.id, entry);
    } else {
      await addPassword(entry);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deletePassword(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Shield className="w-16 h-16 text-primary animate-pulse-glow" />
          <p className="text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        <Header
          onAddPassword={handleAddPassword}
          onCheckAll={checkAllPasswords}
          isChecking={isChecking}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Score */}
            <SecurityScoreCard score={securityScore} totalPasswords={passwords.length} />

            {/* Duplicate Alert */}
            <DuplicateAlert duplicateGroups={duplicateGroups} onEdit={handleEditPassword} />

            {/* Tabs */}
            <Tabs defaultValue="passwords" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="passwords" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Passwords ({passwords.length})
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generator
                </TabsTrigger>
              </TabsList>
              <TabsContent value="passwords" className="mt-4">
                <PasswordList
                  passwords={passwords}
                  onEdit={handleEditPassword}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              </TabsContent>
              <TabsContent value="generator" className="mt-4">
                <PassphraseGenerator />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Generator (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <PassphraseGenerator />
            </div>
          </div>
        </div>
      </div>

      {/* Password Form Modal */}
      <PasswordForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        editEntry={editingEntry}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Password?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The password will be permanently removed from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
