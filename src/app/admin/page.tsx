"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, Search, User, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// This map is now only used to find an ID when updating a status.
const statusMap = {
  1: 'active',
  2: 'inactive',
};

// Helper to find the ID of a status by its name.
const getStatusIdByName = (name) => {
    for (const id in statusMap) {
        if (statusMap[id] === name) {
            return parseInt(id, 10);
        }
    }
    return null;
};

// Safely gets the status name directly from the user's status object.
const getStatusName = (user) => {
    // Check for a nested status object first, e.g., user.status.name
    if (user && user.status && typeof user.status === 'object' && user.status.name) {
        return user.status.name;
    }
    // Fallback for older data structures if needed
    if (user && user.statusId) {
        return statusMap[user.statusId] || 'N/A';
    }
    return 'N/A';
};


export default function AdminDashboard() {
  const { token } = useAuth(); 
  const [userType, setUserType] = useState('CLIENT'); 
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'ascending' });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to fetch the first page of users
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchInitialUsers = async () => {
      setIsLoading(true);
      setError(null);
      setPage(1); 
      try {
        const response = await fetch(`${API_BASE_URL}/users?page=1&limit=10`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);

        const responseData = await response.json();
        setAllUsers(responseData.data || []); 
        setHasNextPage(responseData.hasNextPage);
      } catch (err) {
        setError(err.message);
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialUsers();
  }, [token]);

  // Function to load more users for pagination
  const handleLoadMore = async () => {
    if (!hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
        const response = await fetch(`${API_BASE_URL}/users?page=${nextPage}&limit=10`, {
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to load more users.');

        const responseData = await response.json();
        setAllUsers(prevUsers => [...prevUsers, ...(responseData.data || [])]);
        setPage(nextPage);
        setHasNextPage(responseData.hasNextPage);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoadingMore(false);
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setSearchTerm('');
    setSortConfig({ key: 'firstName', direction: 'ascending' });
  };

  const handleBlockUser = async (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user || !token) return;

    const currentStatusName = getStatusName(user);
    const newStatusName = currentStatusName === 'active' ? 'inactive' : 'active';
    const newStatusId = getStatusIdByName(newStatusName);

    if (newStatusId === null) {
        setError("Could not determine the new status ID.");
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ statusId: newStatusId }), // Ensure backend expects statusId
        });
        if (!response.ok) throw new Error('Failed to update user status.');
        
        // Optimistically update the user's status in the local state
        setAllUsers(allUsers.map(u => 
            u.id === userId 
            ? { ...u, status: { ...u.status, name: newStatusName }, statusId: newStatusId } 
            : u
        ));
    } catch (err) {
        setError(err.message);
    } finally {
        setOpenDropdown(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to delete user.');
        setAllUsers(allUsers.filter(user => user.id !== userId));
    } catch (err) {
        setError(err.message);
    } finally {
        setShowDeleteModal(null);
        setOpenDropdown(null);
    }
  };

  const displayedUsers = useMemo(() => {
    let filteredUsers = allUsers.filter(user => user.userType === userType);

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => {
        const firstName = (user.firstName || '').toLowerCase();
        const lastName = (user.lastName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return firstName.includes(lowerCaseSearchTerm) || lastName.includes(lowerCaseSearchTerm) || email.includes(lowerCaseSearchTerm);
      });
    }

    if (sortConfig !== null) {
      filteredUsers = [...filteredUsers].sort((a, b) => {
        let valA, valB;
        
        if (sortConfig.key === 'status') { // Sort by 'status' key
            valA = getStatusName(a);
            valB = getStatusName(b);
        } else {
            valA = a[sortConfig.key];
            valB = b[sortConfig.key];
        }
        const safeValA = valA || '';
        const safeValB = valB || '';
        if (safeValA < safeValB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (safeValA > safeValB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filteredUsers;
  }, [allUsers, userType, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronDown className="h-4 w-4 inline text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />;
  };

  const statusColor = (user) => {
    const statusName = getStatusName(user);
    return statusName === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your clients and providers efficiently.</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex border border-gray-200 rounded-lg p-1">
              <button onClick={() => handleUserTypeChange('CLIENT')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${userType === 'CLIENT' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Users className="h-5 w-5" /> Clients
              </button>
              <button onClick={() => handleUserTypeChange('PROVIDER')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${userType === 'PROVIDER' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <User className="h-5 w-5" /> Providers
              </button>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder={`Search...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('firstName')}>First Name {getSortIcon('firstName')}</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('lastName')}>Last Name {getSortIcon('lastName')}</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 cursor-pointer hidden md:table-cell" onClick={() => requestSort('createdAt')}>Created At {getSortIcon('createdAt')}</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isClient && (
                  <>
                    {isLoading ? (
                      <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading users...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="5" className="text-center py-10 text-red-600">{error}</td></tr>
                    ) : displayedUsers.length > 0 ? (
                      displayedUsers.map(user => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{user.firstName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{user.lastName || 'N/A'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColor(user)}`}>
                              {getStatusName(user)}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-4 relative">
                            <button onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)} className="p-2 rounded-full hover:bg-gray-200">
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            </button>
                            {openDropdown === user.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit User</a>
                                <button onClick={() => handleBlockUser(user.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  {getStatusName(user) === 'active' ? 'Deactivate' : 'Activate'} User
                                </button>
                                <button onClick={() => { setOpenDropdown(null); setShowDeleteModal(user.id); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                  Delete User
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-500"><p>No {userType === 'CLIENT' ? 'clients' : 'providers'} found.</p></td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {isClient && hasNextPage && (
            <div className="mt-6 text-center">
                <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
            </div>
          )}

        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <button onClick={() => setShowDeleteModal(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={() => handleDeleteUser(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}