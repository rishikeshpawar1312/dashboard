import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";


interface WeeklyPlan {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  subjects: string[];
}

const WeeklyPlanner: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState<string>('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState<string>('');
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
   
  useEffect(() => {
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = endOfWeek(currentWeek);
    setStartDate(weekStart);
    setEndDate(weekEnd);
  }, [currentWeek]);

  useEffect(() => {
    fetchWeeklyPlans();
  }, []);

  const fetchWeeklyPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/weekly-plan');
      if (response.ok) {
        const plans: WeeklyPlan[] = await response.json();
        setWeeklyPlans(plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
      alert('Failed to fetch weekly plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    
    if (range?.from && range.to) {
      setCurrentWeek(range.from);
      setStartDate(startOfWeek(range.from));
      setEndDate(endOfWeek(range.to));
      setIsCalendarOpen(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prevWeek => 
      direction === 'prev' 
        ? addWeeks(prevWeek, -1) 
        : addWeeks(prevWeek, 1)
    );
  };

  const handleCreatePlan = async () => {
    if (goals.length === 0 || subjects.length === 0) {
      alert('Please add at least one goal and one subject');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          goals,
          subjects
        })
      });

      if (response.ok) {
        const newPlan: WeeklyPlan = await response.json();
        setGoals([]);
        setSubjects([]);
        fetchWeeklyPlans();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Failed to create plan', error);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/weekly-plan', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: planId })
      });

      if (response.ok) {
        setWeeklyPlans(weeklyPlans.filter(plan => plan.id !== planId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Failed to delete plan', error);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
      {/* Header and Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Weekly Planner</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            <ChevronLeft className="text-gray-600" />
          </button>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            <ChevronRight className="text-gray-600" />
          </button>
        </div>
      </div>
{/* Date Range and Calendar Toggle */}
<div className="relative mb-6">
  {/* Calendar Button */}
  <div 
    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
    className="flex items-center justify-center bg-blue-50 py-3 rounded-lg cursor-pointer hover:bg-blue-100 transition"
  >
    <Calendar className="mr-2 text-blue-600" />
    <span className="font-semibold text-blue-800">
      {`${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`}
    </span>
  </div>

  {/* Pop-Out Calendar */}
  {isCalendarOpen && (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-40"
      onClick={() => setIsCalendarOpen(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing on calendar click
      >
        <button
          onClick={() => setIsCalendarOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          className="p-4"
        />
      </div>
    </div>
  )}
</div>


      {/* Goals and Subjects Input */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Goals Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Goals</h3>
          <div className="flex mb-4">
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Enter a goal"
              className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newGoal.trim()) {
                  setGoals([...goals, newGoal.trim()]);
                  setNewGoal('');
                }
              }}
            />
            <button 
              onClick={() => {
                if (newGoal.trim()) {
                  setGoals([...goals, newGoal.trim()]);
                  setNewGoal('');
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              <Plus />
            </button>
          </div>
          
          {goals.map((goal, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md mb-2"
            >
              <div className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={16} />
                <span>{goal}</span>
              </div>
              <button 
                onClick={() => setGoals(goals.filter((_, i) => i !== index))}
                className="text-red-500 hover:bg-red-100 p-1 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Subjects Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Subjects</h3>
          <div className="flex mb-4">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter a subject"
              className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubject.trim()) {
                  setSubjects([...subjects, newSubject.trim()]);
                  setNewSubject('');
                }
              }}
            />
            <button 
              onClick={() => {
                if (newSubject.trim()) {
                  setSubjects([...subjects, newSubject.trim()]);
                  setNewSubject('');
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              <Plus />
            </button>
          </div>
          
          {subjects.map((subject, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md mb-2"
            >
              <div className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={16} />
                <span>{subject}</span>
              </div>
              <button 
                onClick={() => setSubjects(subjects.filter((_, i) => i !== index))}
                className="text-red-500 hover:bg-red-100 p-1 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Plan Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={handleCreatePlan}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading ? 'Creating Plan...' : 'Create Weekly Plan'}
        </button>
      </div>

      {/* Existing Plans */}
      {weeklyPlans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Existing Plans</h3>
          {weeklyPlans.map((plan) => (
            <div 
              key={plan.id} 
              className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700">
                  {`${format(new Date(plan.startDate), 'MMM dd')} - ${format(new Date(plan.endDate), 'MMM dd, yyyy')}`}
                </span>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-red-500 hover:bg-red-100 p-2 rounded"
                >
                  <Trash2 />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-600 mb-2">Goals</h4>
                  <ul className="list-disc list-inside">
                    {plan.goals.map((goal, index) => (
                      <li key={index} className="text-gray-700">{goal}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-600 mb-2">Subjects</h4>
                  <ul className="list-disc list-inside">
                    {plan.subjects.map((subject, index) => (
                      <li key={index} className="text-gray-700">{subject}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;

// Dependencies to install:
// npm install react-day-picker date-fns lucide-react