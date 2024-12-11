'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Star, GitBranch, Filter, ArrowUpDown, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch GitHub data');
  }
  
  return response.json();
};

const GitHubIntegration: React.FC = () => {
  const [username, setUsername] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'stars' | 'updated'>('stars');

  const { data, error, isValidating } = useSWR(
    shouldFetch ? `/api/github?username=${username}` : null, 
    fetcher
  );

  // Language Breakdown Pie Chart Data
  const languageData = useMemo(() => {
    if (!data?.languages) return [];
    return Object.entries(data.languages)
      .map(([name, percentage]) => ({
        name, 
        value: percentage as number
      }))
      .filter(lang => lang.value > 1)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data?.languages]);

  // Repository Filtering and Sorting
  const filteredAndSortedRepos = useMemo(() => {
    if (!data?.repositories) return [];

    return data.repositories
      .filter((repo: { name: string; }) => 
        repo.name.toLowerCase().includes(repoSearch.toLowerCase())
      )
      .sort((a: { stargazers_count: number; updated_at: string | number | Date; }, b: { stargazers_count: number; updated_at: string | number | Date; }) => {
        if (sortCriteria === 'stars') {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [data?.repositories, repoSearch, sortCriteria]);

  // Pie Chart Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleFetchData = () => {
    setShouldFetch(true);
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <div className="flex-grow mr-4">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub Username"
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
        </div>
        <button 
          onClick={handleFetchData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center space-x-2 disabled:opacity-50"
          disabled={isValidating}
        >
          {isValidating ? 'Fetching...' : 'Fetch GitHub Data'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error.message}
        </div>
      )}

      {data && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-6 text-center">
            <img 
              src={data.profile.avatar_url} 
              alt="GitHub Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-200"
            />
            <h2 className="text-2xl font-bold text-gray-800">{data.profile.name || data.profile.login}</h2>
            <p className="text-gray-500 mb-4">{data.profile.bio || 'GitHub Developer'}</p>
            <div className="flex justify-around">
              <div>
                <p className="font-bold text-blue-600">{data.profile.public_repos}</p>
                <p className="text-gray-500">Repos</p>
              </div>
              <div>
                <p className="font-bold text-blue-600">{data.profile.followers}</p>
                <p className="text-gray-500">Followers</p>
              </div>
            </div>
          </div>

          {/* Language Breakdown Section */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <GitBranch className="mr-2 text-blue-600" />
              Language Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => {
                    const numericValue = Number(value);
                    return [`${numericValue.toFixed(2)}%`, 'Percentage'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-4">
              {languageData.map((lang, index) => (
                <div key={lang.name} className="flex items-center mr-4">
                  <div 
                    className="w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Repositories Section with Search and Sort */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <GitBranch className="mr-2 text-blue-600" />
                Repositories
              </h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search repositories"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Filter className="absolute left-2 top-3 text-gray-400 w-4 h-4" />
                </div>
                <button 
                  onClick={() => setSortCriteria(sortCriteria === 'stars' ? 'updated' : 'stars')}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <ArrowUpDown className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAndSortedRepos.slice(0, 4).map((repo: any) => (
                <div 
                  key={repo.id} 
                  className="bg-gray-100 rounded-lg p-4 hover:bg-blue-50 transition duration-300"
                >
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {repo.name}
                  </a>
                  <p className="text-sm text-gray-600">{repo.description || 'No description provided'}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="ml-2 text-gray-500">{repo.stargazers_count} stars</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contributions Section */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Activity className="mr-2 text-blue-600" />
              Recent Contributions
            </h2>
            {data.contributions && data.contributions.length > 0 ? (
              <div className="space-y-3">
                {data.contributions.slice(0, 5).map((contribution: any, index: number) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {contribution.type.replace(/([A-Z])/g, ' $1').trim()}
                        {contribution.action && contribution.action !== 'unknown' 
                          ? ` (${contribution.action})` 
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {contribution.repo}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No contributions found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubIntegration;