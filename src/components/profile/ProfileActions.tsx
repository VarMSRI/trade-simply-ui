
import React from 'react';
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteAccountDialog from './DeleteAccountDialog';

interface ProfileActionsProps {
  logout: () => void;
  onDeleteAccount: () => Promise<void>;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ logout, onDeleteAccount }) => {
  return (
    <CardFooter className="flex flex-col space-y-2">
      <div className="w-full h-px bg-border"></div>
      <div className="flex justify-between w-full">
        <Button 
          variant="outline" 
          onClick={logout}
        >
          Logout
        </Button>
        
        <DeleteAccountDialog onDeleteAccount={onDeleteAccount} />
      </div>
    </CardFooter>
  );
};

export default ProfileActions;
