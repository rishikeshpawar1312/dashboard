import React, { useState } from 'react';
import { 
  Search, 
  Trophy, 
  Code, 
  Brain, 
  Swords, 
  AlertCircle,
  ChevronUp,
  Target,
  Binary,
  Flame
} from 'lucide-react';

interface Submission {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
  submissions: number;
}

interface MatchedUserStats {
  acSubmissionNum: Submission[];
  totalSubmissionNum: Submission[];
}

interface LeetCodeStats {
  totalSolved: number;
  totalSubmissions: Submission[];
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  matchedUserStats: MatchedUserStats;
}

const LeetCodeStats: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [data, setData] = useState<LeetCodeStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetchData = async (): Promise<void> => {
    if (!username) {
      setErrorMessage('Username is required!');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
      const result = await response.json();

      if (response.ok && result) {
        setData(result);
      } else {
        setErrorMessage('User not found!');
      }
    } catch (error) {
      setErrorMessage('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (solved: number, total: number): string => {
    return ((solved / total) * 100).toFixed(1);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch(difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTotalSubmissions = (submissions: Submission[]): number => {
    return submissions.reduce((acc, curr) => acc + curr.submissions, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Code className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">LeetCode Statistics Dashboard</h1>
        </div>
        <p className="text-gray-600">View detailed LeetCode problem-solving statistics for any user</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter LeetCode username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleFetchData}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Solved</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalSolved}</p>
                  <p className="text-sm text-gray-500">of {data.totalQuestions} problems</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculatePercentage(data.totalSolved, data.totalQuestions)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Binary className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalSubmissions(data.totalSubmissions)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Progress */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              Problem Difficulty Breakdown
            </h2>
            <div className="space-y-6">
              {/* Easy */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-gray-700">Easy</span>
                  </div>
                  <span className="text-gray-600">{data.easySolved} solved</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${calculatePercentage(data.easySolved, data.totalSolved)}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-medium text-gray-700">Medium</span>
                  </div>
                  <span className="text-gray-600">{data.mediumSolved} solved</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${calculatePercentage(data.mediumSolved, data.totalSolved)}%` }}
                  ></div>
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium text-gray-700">Hard</span>
                  </div>
                  <span className="text-gray-600">{data.hardSolved} solved</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${calculatePercentage(data.hardSolved, data.totalSolved)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Flame className="h-5 w-5 text-indigo-600" />
              Submission History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.totalSubmissions.map((submission) => (
                <div
                  key={submission.difficulty}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${getDifficultyColor(submission.difficulty)}`}>
                      {submission.difficulty}
                    </span>
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{submission.submissions}</p>
                  <p className="text-sm text-gray-600">submissions</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeetCodeStats;