'use client'

import { useEffect, useState } from 'react';
import { User, Search } from 'lucide-react';  // Importing icons from lucide-react

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <h2 className="text-xl font-medium mb-4">Users List</h2>
      <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">ID</th>
            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">Email</th>
            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">Name</th>
            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">Created At</th>
            <th className="py-3 px-6 text-center text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-3 px-6 text-sm text-gray-600">{user.id}</td>
                <td className="py-3 px-6 text-sm text-gray-600">{user.email}</td>
                <td className="py-3 px-6 text-sm text-gray-600">{user.name || 'N/A'}</td>
                <td className="py-3 px-6 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-6 text-center text-sm text-gray-600">
                  <button className="text-blue-500 hover:text-blue-700">
                    <User className="inline-block mr-1" size={16} />
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-3 px-6 text-center text-sm text-gray-600">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
