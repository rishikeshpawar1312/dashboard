'use client';

import AuthForm from '@/frontend/auth-form';

export default function SignUp() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-200">
      <AuthForm mode="signup" />
    </div>
  );
}
