'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type RegistrationStep = 'phone' | 'otp' | 'profile' | 'email-otp';

export default function PhoneRegisterPage() {
  const router = useRouter();
  const { sendPhoneOtp, verifyPhoneOtp, completePhoneRegistration, isAuthenticated, error: authError, clearError, isLoading } = useAuth();
  
  const [step, setStep] = useState<RegistrationStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
  });
  const [emailOtp, setEmailOtp] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [emailOtpTimer, setEmailOtpTimer] = useState(0);

  // Redirect if already authenticated (but wait for loading to complete)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpTimer]);

  // Email OTP timer countdown
  useEffect(() => {
    if (emailOtpTimer <= 0) return;
    const timer = setTimeout(() => setEmailOtpTimer(emailOtpTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [emailOtpTimer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    clearError();
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    clearError();
    if (errors.otp) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.otp;
        return newErrors;
      });
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    clearError();
  };

  const validatePhone = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number format (e.g., +1234567890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOtp(e.target.value);
    clearError();
    if (errors.emailOtp) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.emailOtp;
        return newErrors;
      });
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailOtp = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!emailOtp.trim()) {
      newErrors.emailOtp = 'Email OTP is required';
    } else if (!/^\d{6}$/.test(emailOtp)) {
      newErrors.emailOtp = 'Email OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) {
      return;
    }

    const success = await sendPhoneOtp(phone);
    if (success) {
      setOtpSent(true);
      setOtpTimer(60); // 60 seconds timer
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtp()) {
      return;
    }

    const success = await verifyPhoneOtp(phone, otp);
    if (success) {
      setStep('profile');
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    // Send email OTP
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ email: error.message || 'Failed to send email OTP' });
        return;
      }

      setEmailOtpSent(true);
      setEmailOtpTimer(60);
      setStep('email-otp');
    } catch (error) {
      setErrors({ email: 'Failed to send email OTP' });
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailOtp()) {
      return;
    }

    try {
      // Verify email OTP
      const verifyResponse = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: emailOtp }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        setErrors({ emailOtp: error.message || 'Invalid email OTP' });
        return;
      }

      // Now complete registration
      const success = await completePhoneRegistration({
        phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role as 'customer' | 'service_provider',
      });

      if (success) {
        router.push('/');
      }
    } catch (error) {
      setErrors({ emailOtp: 'Failed to verify email OTP' });
    }
  };

  const handleResendOtp = async () => {
    const success = await sendPhoneOtp(phone);
    if (success) {
      setOtpTimer(60);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login-phone" className="font-medium text-blue-600 hover:text-blue-500">
              sign in with your phone number
            </Link>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-between items-center">
          <div className={`flex-1 h-2 rounded-full ${step === 'phone' || step === 'otp' || step === 'profile' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex-1 h-2 rounded-full mx-2 ${step === 'otp' || step === 'profile' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex-1 h-2 rounded-full ${step === 'profile' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        </div>

        {authError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{authError}</p>
          </div>
        )}

        {/* Step 1: Phone */}
        {step === 'phone' && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={handlePhoneChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                We'll send you an OTP to verify your phone number
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <p className="text-sm text-gray-600 mb-2">
                We've sent a 6-digit code to {phone}
              </p>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.otp ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest`}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 0 || isLoading}
                className="text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setOtpSent(false);
                }}
                className="text-gray-600 hover:text-gray-500"
              >
                Change number
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* Step 3: Complete Profile */}
        {step === 'profile' && (
          <form className="mt-8 space-y-6" onSubmit={handleCompleteRegistration}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleProfileChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleProfileChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleProfileChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I want to
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleProfileChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="customer">Book event services</option>
                <option value="service_provider">Provide event services</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending email OTP...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step 4: Email OTP Verification */}
        {step === 'email-otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyEmailOtp}>
            <div>
              <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700">
                Enter Email OTP
              </label>
              <p className="text-sm text-gray-600 mb-2">
                We've sent a 6-digit code to {formData.email}
              </p>
              <input
                id="emailOtp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={emailOtp}
                onChange={handleEmailOtpChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.emailOtp ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest`}
              />
              {errors.emailOtp && (
                <p className="mt-1 text-sm text-red-600">{errors.emailOtp}</p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={async () => {
                  const response = await fetch('/api/auth/send-email-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email }),
                  });
                  if (response.ok) {
                    setEmailOtpTimer(60);
                  }
                }}
                disabled={emailOtpTimer > 0 || isLoading}
                className="text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {emailOtpTimer > 0 ? `Resend in ${emailOtpTimer}s` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('profile');
                  setEmailOtp('');
                  setEmailOtpSent(false);
                }}
                className="text-gray-600 hover:text-gray-500"
              >
                Change email
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Verify & Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login-phone" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
