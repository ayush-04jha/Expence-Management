import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockExpenses, mockApprovals, mockUsers } from '../services/mockData';
import {
  FileText,
  CheckSquare,
  Clock,
  TrendingUp,
  DollarSign,
  Users as UsersIcon
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, company } = useAuth();

  const getStats = () => {
    if (!user) return { totalExpenses: 0, pendingExpenses: 0, approvedExpenses: 0, totalAmount: 0 };

    let expenses = mockExpenses;

    if (user.role === 'employee') {
      expenses = mockExpenses.filter(e => e.userId === user.id);
    } else if (user.role === 'manager') {
      const teamUserIds = mockUsers.filter(u => u.managerId === user.id).map(u => u.id);
      expenses = mockExpenses.filter(e => teamUserIds.includes(e.userId) || e.userId === user.id);
    }

    const totalExpenses = expenses.length;
    const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
    const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
    const totalAmount = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amountInBaseCurrency, 0);

    return { totalExpenses, pendingExpenses, approvedExpenses, totalAmount };
  };

  const getPendingApprovals = () => {
    if (!user || user.role === 'employee') return 0;
    return mockApprovals.filter(a => a.approverId === user.id && a.status === 'pending').length;
  };

  const stats = getStats();
  const pendingApprovals = getPendingApprovals();

  const recentExpenses = mockExpenses
    .filter(e => {
      if (user?.role === 'employee') return e.userId === user.id;
      if (user?.role === 'manager') {
        const teamUserIds = mockUsers.filter(u => u.managerId === user.id).map(u => u.id);
        return teamUserIds.includes(e.userId) || e.userId === user.id;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName.split(' ')[0]}!
        </h2>
        <p className="text-slate-600 mt-1">Here's what's happening with your expenses today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.totalExpenses}</h3>
          <p className="text-slate-600 text-sm mt-1">Total Expenses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.pendingExpenses}</h3>
          <p className="text-slate-600 text-sm mt-1">Pending Review</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.approvedExpenses}</h3>
          <p className="text-slate-600 text-sm mt-1">Approved</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {company?.baseCurrency} {stats.totalAmount.toFixed(2)}
          </h3>
          <p className="text-slate-600 text-sm mt-1">Total Approved</p>
        </div>
      </div>

      {(user?.role === 'manager' || user?.role === 'admin') && pendingApprovals > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">
                You have {pendingApprovals} pending {pendingApprovals === 1 ? 'approval' : 'approvals'}
              </h3>
              <p className="text-slate-600 mt-1">
                Review and approve expense claims submitted by your team members.
              </p>
              <a
                href="/approvals"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Review Now
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Expenses</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {recentExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No expenses yet</p>
            </div>
          ) : (
            recentExpenses.map((expense) => {
              const expenseUser = mockUsers.find(u => u.id === expense.userId);
              return (
                <div key={expense.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-slate-900">{expense.description}</h4>
                        <span className={`
                          px-2.5 py-1 rounded-full text-xs font-medium
                          ${expense.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                          ${expense.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${expense.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                        {user?.role !== 'employee' && expenseUser && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <UsersIcon className="w-4 h-4" />
                              <span>{expenseUser.fullName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </p>
                      {expense.currency !== company?.baseCurrency && (
                        <p className="text-sm text-slate-500 mt-1">
                          {company?.baseCurrency} {expense.amountInBaseCurrency.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
