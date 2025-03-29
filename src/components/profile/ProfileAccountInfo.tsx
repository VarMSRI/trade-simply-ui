
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Wallet, Mail } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { User as UserType } from '@/types/auth';
import { toast } from "sonner";

interface ProfileAccountInfoProps {
  user: UserType;
}

const ProfileAccountInfo: React.FC<ProfileAccountInfoProps> = ({ user }) => {
  const handleBalanceRequest = () => {
    window.location.href = `mailto:admin@intuitifi.com?subject=Balance%20Increase%20Request&body=Hello,%0A%0AI%20would%20like%20to%20request%20an%20increase%20in%20my%20trading%20balance.%0A%0APhone%20Number:%20${user?.phoneNumber}%0AUser%20ID:%20${user?.id}%0ACurrent%20Balance:%20₹${user?.balance.toLocaleString()}%0A%0AThank%20you.`;
    toast.success('Opening email client for balance increase request');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Member since:</span>
        </div>
        <div className="pl-6 text-sm">
          {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'N/A'}
        </div>
        
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Phone:</span>
        </div>
        <div className="pl-6 text-sm">
          {user.phoneNumber}
        </div>
        
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Trading Balance:</span>
        </div>
        <div className="pl-6 text-lg font-bold">
          ₹{user.balance.toLocaleString()}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleBalanceRequest}
        >
          <Mail className="mr-2 h-4 w-4" />
          Request Balance Increase
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileAccountInfo;
