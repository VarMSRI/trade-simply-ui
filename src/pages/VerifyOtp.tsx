
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from '@/providers/AuthProvider';
import { toast } from "sonner";

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, login } = useAuth();
  
  // Extract phoneNumber from navigation state
  const phoneNumber = location.state?.phoneNumber;
  
  // If no phone number is provided, redirect to login
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/login');
    }
  }, [phoneNumber, navigate]);
  
  // Countdown for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await verifyOtp(phoneNumber, otp);
      if (success) {
        toast.success('Verification successful');
        navigate('/'); // Redirect to dashboard, the auth provider will handle redirects if profile is incomplete
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setCountdown(30);
    
    try {
      await login(phoneNumber);
      toast.success('OTP sent again');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit OTP sent to {phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} id="verify-otp-form">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-input">One-Time Password</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} id="otp-input" name="otp">
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                id="verify-otp-button"
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <div className="flex justify-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={resendDisabled}
                  onClick={handleResendOtp}
                  id="resend-otp-button"
                >
                  {resendDisabled 
                    ? `Resend OTP in ${countdown}s` 
                    : 'Resend OTP'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            id="change-phone-button"
          >
            Change Phone Number
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtp;
