import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const motivationalQuotes = [
  "Stay focused and never give up!",
  "Small steps every day lead to big results.",
  "Your future self will thank you!",
  "Consistency is key to success.",
];

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime === 0) {
            if (!isBreak) {
              setCompletedSessions((prev) => prev + 1);
              setIsBreak(true);
              return breakDuration * 60;
            } else {
              setIsBreak(false);
              return workDuration * 60;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isBreak, workDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const progressPercentage = () =>
    isBreak
      ? ((breakDuration * 60 - time) / (breakDuration * 60)) * 100
      : ((workDuration * 60 - time) / (workDuration * 60)) * 100;

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setTime(workDuration * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  const handleSettingsSubmit = () => {
    setTime(workDuration * 60);
    setShowSettings(false);
    setIsRunning(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg p-8 max-w-md mx-auto relative">
      {showSettings && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-10">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-gray-700 w-80">
            <h3 className="text-lg font-semibold mb-4">Customize Timer</h3>
            <label className="block mb-4">
              <span className="text-sm font-medium">Work Duration (minutes):</span>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm font-medium">Break Duration (minutes):</span>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </label>
            <button
              onClick={handleSettingsSubmit}
              className="bg-indigo-500 text-white w-full py-2 rounded hover:bg-indigo-600 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Pomodoro Timer</h3>
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="p-2 rounded-full bg-indigo-400 hover:bg-indigo-500 transition"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="text-center">
  {/* Progress Bar */}
  <div className="relative mb-8">
    <div
      className="bg-indigo-300 rounded-full overflow-hidden"
      style={{ height: '8px', width: '100%' }}
    >
      <div
        className="bg-white h-full"
        style={{
          width: `${progressPercentage()}%`,
          transition: 'width 0.5s',
        }}
      ></div>
    </div>
  </div>

  {/* Timer */}
  <div className={`text-6xl font-bold mb-6 ${isBreak ? 'text-green-300' : 'text-white'}`}>
    {formatTime(time)}
  </div>

  {/* Work/Break Status */}
  <p className={`text-lg font-medium mb-8 ${isBreak ? 'text-green-200' : 'text-indigo-100'}`}>
    {isBreak ? 'Break Time' : 'Work Time'}
  </p>

  {/* Motivational Quote */}
  <p className="italic text-sm mb-8 text-indigo-100">
    "Small steps every day lead to big results."
  </p>

  {/* Controls */}
  <div className="flex justify-center space-x-4">
    {!isRunning ? (
      <button
        onClick={handleStart}
        className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
      >
        <Play size={24} />
      </button>
    ) : (
      <button
        onClick={handlePause}
        className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
      >
        <Pause size={24} />
      </button>
    )}
    <button
      onClick={handleReset}
      className="p-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
    >
      <RotateCcw size={24} />
    </button>
  </div>
</div>


      <div className="mt-6 text-center">
        <p className="text-sm text-indigo-200">
          Completed Sessions: <span className="font-bold">{completedSessions}</span>
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
