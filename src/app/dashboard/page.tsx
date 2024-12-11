'use client'

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Clock, Calendar, Trophy, User } from "lucide-react";
import LeetCodeData from "../../frontend/leetcodedata";
import TodoList from "@/frontend/TodoList";
import StreakCounter from "@/frontend/StreakCounter";
import WeeklyPlanner from "@/frontend/WeeklyPlanner";
import PomodoroTimer from "@/frontend/PomodoroTimer";
import GitHubIntegration from "@/frontend/GitHubIntegration";
import NotesPage from "@/frontend/Notes";
import DocumentList from "../../../src/frontend/DocumentList";
import DocumentUpload from "../../../src/frontend/DocumentUpload";


   
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{session?.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <StreakCounter />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Date</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Local Time</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Date().toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Productivity Tools */}
          <div className="lg:col-span-3 space-y-8">
            {/* Todo List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
                <h3 className="text-lg font-semibold text-white">Todo List</h3>
              </div>
              <div className="p-6">
                <TodoList />
              </div>
            </div>
            
            {/* Pomodoro Timer */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
                <h3 className="text-lg font-semibold text-white">Pomodoro Timer</h3>
              </div>
              <div className="p-6">
                <PomodoroTimer />
              </div>
            </div>
          </div>

          {/* Center/Right Column - Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* LeetCode Progress */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                <h3 className="text-lg font-semibold text-white">LeetCode Progress</h3>
              </div>
              <div className="p-6">
                <LeetCodeData />
              </div>
            </div>

            {/* Weekly Planner */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600">
                <h3 className="text-lg font-semibold text-white">Weekly Planner</h3>
              </div>
              <div className="p-6">
                <WeeklyPlanner />
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800">
                <h3 className="text-lg font-semibold text-white">GitHub Integration</h3>
              </div>
              <div className="p-6">
                <GitHubIntegration />
              </div>
            </div>
            <NotesPage/>
           </div>
           
        </div>
        <DocumentUpload/>
        <DocumentList/>
      </main>
    </div>
  );
}