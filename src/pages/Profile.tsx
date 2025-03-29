
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/providers/AuthProvider';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Mail, Indian, User, AtSign, Wallet } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, updateUserProfile, deleteUserProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateUserProfile(name, email);
      // Success toast is shown in the auth provider
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    try {
      const success = await deleteUserProfile();
      if (success) {
        setDeleteDialogOpen(false);
        navigate('/login');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBalanceRequest = () => {
    window.location.href = `mailto:admin@intuitifi.com?subject=Balance%20Increase%20Request&body=Hello,%0A%0AI%20would%20like%20to%20request%20an%20increase%20in%20my%20trading%20balance.%0A%0APhone%20Number:%20${user?.phoneNumber}%0AUser%20ID:%20${user?.id}%0ACurrent%20Balance:%20₹${user?.balance.toLocaleString()}%0A%0AThank%20you.`;
    toast.success('Opening email client for balance increase request');
  };

  if (!user) {
    return null; // Should be handled by auth routing
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
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
              <Indian className="h-4 w-4 text-muted-foreground" />
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    className="pl-10"
                    placeholder="Your full name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    className="pl-10" 
                    placeholder="Your email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="w-full h-px bg-border"></div>
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={logout}
              >
                Logout
              </Button>
              
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
