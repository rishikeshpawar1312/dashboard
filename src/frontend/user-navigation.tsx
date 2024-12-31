'use client';

import { useSession, signOut } from "next-auth/react";
import Avatar from "react-avatar";
import { Power } from "lucide-react";  // Add a cool sign-out icon

export default function UserNavigation() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    return null;
  }

  // Fallback to email if name is missing
  const userName = session.user.name ?? session.user.email ?? "User";

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 ease-in-out">
      {/* Avatar with dynamic color */}
      <Avatar
        name={userName as string}
        size="40"
        round={true}
        className="border-2 border-gray-200 shadow-md"
        style={{
          backgroundColor: getDynamicBackgroundColor(userName), // dynamic background color
        }}
      />
      
      {/* User Info Section */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{userName}</span>
        <span className="text-xs text-gray-600">{session.user.email}</span>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        className="ml-4 p-1 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 ease-in-out"
      >
        <Power className="h-5 w-5" />
      </button>
    </div>
  );
}

// Function to generate dynamic background color based on user name/email
function getDynamicBackgroundColor(input: string): string {
  // Convert string into an array of characters
  const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = `hsl(${hash % 360}, 70%, 60%)`; // Generate a color based on the name/email
  return color;
}

