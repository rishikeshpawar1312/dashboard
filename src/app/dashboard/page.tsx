// app/dashboard/page.tsx
'use client'

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Clock, Calendar, Trophy } from "lucide-react";
import { Session } from "next-auth";
import StreakCounter from "@/frontend/StreakCounter";

interface StatsRowProps {
  session: Session | null;
}

const StatsRow: React.FC<StatsRowProps> = ({ session }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="bg-white w-full rounded-lg shadow-sm p-4 flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-full">
        <Trophy className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Current Streak</p>
        <StreakCounter />
      </div>
    </div>

    <div className="bg-white w-full rounded-lg shadow-sm p-4 flex items-center space-x-4">
      <div className="bg-green-100 p-3 rounded-full">
        <Calendar className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Today's Date</p>
        <p className="text-xl font-semibold text-gray-900">
          {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>

    <div className="bg-white w-full rounded-lg shadow-sm p-4 flex items-center space-x-4">
      <div className="bg-purple-100 p-3 rounded-full">
        <Clock className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Local Time</p>
        <p className="text-xl font-semibold text-gray-900">
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>
      </div>
    </div>
  </div>
);


export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsRow session={session} />
      {/* Add links or navigation to the respective pages if needed */}
    </div>
  );
}
