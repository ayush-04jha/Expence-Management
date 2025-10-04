import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, addUser, updateUser, deleteUser } from '../services/mockData';
import { Plus, CreditCard as Edit2, Trash2, Users as UsersIcon, X } from 'lucide-react';
import { User, UserRole } from '../types';

export const Users: React.FC = () => {
  const { user: currentUser, company } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'employee' as UserRole,
    managerId: '',
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don't have permission to view this page.</p>
      </div>
    );
  }

  const companyUsers = mockUsers.filter(u => u.companyId === currentUser.companyId);
  const managers = companyUsers.filter(u => u.role === 'manager' || u.role === 'admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      updateUser(editingUser.id, {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        managerId: formData.managerId || undefined,
      });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        companyId: currentUser.companyId,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        managerId: formData.managerId || undefined,
        createdAt: new Date().toISOString(),
      };
      addUser(newUser);
    }

    setShowForm(false);
    setEditingUser(null);
    setFormData({
      email: '',
      fullName: '',
      role: 'employee',
      managerId: '',
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      managerId: user.managerId || '',
    });
    setShowForm(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const stats = {
    total: companyUsers.length,
    admins: companyUsers.filter(u => u.role === 'admin').length,
    managers: companyUsers.filter(u => u.role === 'manager').length,
    employees: companyUsers.filter(u => u.role === 'employee').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600 mt-1">Manage company users and their roles</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              email: '',
              fullName: '',
              role: 'employee',
              managerId: '',
            });
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
          <p className="text-slate-600 text-sm mt-1">Total Users</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <UsersIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.admins}</h3>
          <p className="text-slate-600 text-sm mt-1">Admins</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <UsersIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.managers}</h3>
          <p className="text-slate-600 text-sm mt-1">Managers</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <UsersIcon className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.employees}</h3>
          <p className="text-slate-600 text-sm mt-1">Employees</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {companyUsers.map((user) => {
                const manager = user.managerId
                  ? mockUsers.find(u => u.id === user.managerId)
                  : null;

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                          {user.id === currentUser.id && (
                            <span className="text-xs text-blue-600">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
                        ${user.role === 'manager' ? 'bg-green-100 text-green-700' : ''}
                        ${user.role === 'employee' ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {manager ? manager.fullName : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assign Manager
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName} ({manager.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
