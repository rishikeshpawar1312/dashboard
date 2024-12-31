// app/dashboard/tasks/page.tsx
'use client'

import TodoList from "@/frontend/TodoList";
import PomodoroTimer from "@/frontend/PomodoroTimer";

export default function TasksPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Todo List</h3>
        <TodoList />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Pomodoro Timer</h3>
        <PomodoroTimer />
      </div>
    </div>
  );
}