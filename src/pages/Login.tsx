
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/providers/AuthProvider';
import { toast } from "sonner";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Indian phone number format (10 digits)
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Make sure we're passing the phone number parameter correctly
      const success = await login(phoneNumber);
      if (success) {
        navigate('/verify-otp', { state: { phoneNumber } });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Intuitifi</CardTitle>
          <CardDescription>Login with your WhatsApp number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">WhatsApp Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter your 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  className="text-lg py-6"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  We'll send an OTP to verify your number
                </p>
              </div>
              
              {errorMessage && (
                <div className="text-destructive text-sm">{errorMessage}</div>
              )}
              
              <Button 
                type="submit" 
                className="w-full py-6" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : 'Get OTP'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
