
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  onDeleteAccount: () => Promise<void>;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ onDeleteAccount }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDeleteAccount();
      setOpen(false);
    } catch (error) {
      console.error('Account deletion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All of your data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete your account? Your trading history, portfolio, and all other data will be lost forever.
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
