
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/providers/AuthProvider';
import ProfileAccountInfo from '@/components/profile/ProfileAccountInfo';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileActions from '@/components/profile/ProfileActions';

const Profile = () => {
  const { user, updateUserProfile, deleteUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    try {
      const success = await deleteUserProfile();
      if (success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Should be handled by auth routing
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProfileAccountInfo user={user} />
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <ProfileForm 
              user={user} 
              updateUserProfile={updateUserProfile} 
            />
            <ProfileActions 
              logout={logout} 
              onDeleteAccount={handleDeleteAccount} 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
