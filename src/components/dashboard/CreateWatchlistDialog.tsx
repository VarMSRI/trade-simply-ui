
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

interface CreateWatchlistDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  watchlistName: string;
  onWatchlistNameChange: (name: string) => void;
  onCreateWatchlist: () => void;
}

const CreateWatchlistDialog: React.FC<CreateWatchlistDialogProps> = ({
  isOpen,
  onOpenChange,
  watchlistName,
  onWatchlistNameChange,
  onCreateWatchlist,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Watchlist</DialogTitle>
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
          <Button onClick={onCreateWatchlist}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWatchlistDialog;
