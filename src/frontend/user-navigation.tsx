'use client';

import { useSession, signOut } from "next-auth/react";

export default function UserNavigation() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">{session.user.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Sign out
      </button>
    </div>
  );
}