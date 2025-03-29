
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, AtSign } from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from '@/types/auth';

interface ProfileFormProps {
  user: UserType;
  updateUserProfile: (name: string, email: string) => Promise<UserType | null>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, updateUserProfile }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <Card>
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
    </Card>
  );
};

export default ProfileForm;
