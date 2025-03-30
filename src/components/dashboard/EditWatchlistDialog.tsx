
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditWatchlistDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  watchlistName: string;
  onWatchlistNameChange: (name: string) => void;
  onUpdateWatchlist: () => void;
}

const EditWatchlistDialog: React.FC<EditWatchlistDialogProps> = ({
  isOpen,
  onOpenChange,
  watchlistName,
  onWatchlistNameChange,
  onUpdateWatchlist,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Watchlist</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Watchlist Name"
          value={watchlistName}
          onChange={(e) => onWatchlistNameChange(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpdateWatchlist}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditWatchlistDialog;
