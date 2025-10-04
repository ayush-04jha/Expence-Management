import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  mockApprovals,
  mockExpenses,
  mockUsers,
  updateApproval,
  updateExpense,
  getApprovalsForUser,
  getExpenseById,
  getUserById
} from '../services/mockData';
import { CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';
import { ExpenseApproval } from '../types';

export const Approvals: React.FC = () => {
  const { user, company } = useAuth();
  const [selectedApproval, setSelectedApproval] = useState<ExpenseApproval | null>(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  if (!user || user.role === 'employee') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don't have permission to view this page.</p>
      </div>
    );
  }

  const pendingApprovals = getApprovalsForUser(user.id).map(approval => ({
    ...approval,
    expense: getExpenseById(approval.expenseId),
    approver: getUserById(approval.approverId),
  }));

  const handleApprove = async (approvalId: string, expenseId: string) => {
    setActionLoading(true);

    updateApproval(approvalId, {
      status: 'approved',
      comments,
      approvedAt: new Date().toISOString(),
    });

    const expense = getExpenseById(expenseId);
    if (expense) {
      updateExpense(expenseId, {
        status: 'approved',
        currentApprovalLevel: expense.currentApprovalLevel + 1,
      });
    }

    setActionLoading(false);
    setSelectedApproval(null);
    setComments('');
  };

  const handleReject = async (approvalId: string, expenseId: string) => {
    setActionLoading(true);

    updateApproval(approvalId, {
      status: 'rejected',
      comments,
      approvedAt: new Date().toISOString(),
    });

    updateExpense(expenseId, {
      status: 'rejected',
    });

    setActionLoading(false);
    setSelectedApproval(null);
    setComments('');
  };

  const allApprovals = user.role === 'admin'
    ? mockApprovals.map(approval => ({
        ...approval,
        expense: getExpenseById(approval.expenseId),
        approver: getUserById(approval.approverId),
      }))
    : pendingApprovals;

  const approvalStats = {
    pending: allApprovals.filter(a => a.status === 'pending').length,
    approved: allApprovals.filter(a => a.status === 'approved').length,
    rejected: allApprovals.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Expense Approvals</h2>
        <p className="text-slate-600 mt-1">Review and approve expense claims</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{approvalStats.pending}</h3>
          <p className="text-slate-600 text-sm mt-1">Pending Approvals</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{approvalStats.approved}</h3>
          <p className="text-slate-600 text-sm mt-1">Approved</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{approvalStats.rejected}</h3>
          <p className="text-slate-600 text-sm mt-1">Rejected</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {allApprovals.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No approval requests</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {allApprovals.map((approval) => {
              if (!approval.expense) return null;

              const expenseUser = mockUsers.find(u => u.id === approval.expense?.userId);

              return (
                <div key={approval.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`
                          px-2.5 py-1 rounded-full text-xs font-medium
                          ${approval.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                          ${approval.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${approval.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          Level {approval.approvalLevel + 1}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 text-lg mb-2">
                        {approval.expense.description}
                      </h4>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Submitted by</p>
                          <p className="text-slate-900 font-medium flex items-center mt-1">
                            <User className="w-4 h-4 mr-1" />
                            {expenseUser?.fullName}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Category</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {approval.expense.category}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Date</p>
                          <p className="text-slate-900 font-medium mt-1">
                            {new Date(approval.expense.expenseDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Amount</p>
                          <p className="text-slate-900 font-semibold mt-1">
                            {approval.expense.currency} {approval.expense.amount.toFixed(2)}
                          </p>
                          {approval.expense.currency !== company?.baseCurrency && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {company?.baseCurrency} {approval.expense.amountInBaseCurrency.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {approval.expense.receiptUrl && (
                        <div className="mt-3">
                          <a
                            href={approval.expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Receipt
                          </a>
                        </div>
                      )}

                      {approval.comments && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Comments:</span> {approval.comments}
                          </p>
                        </div>
                      )}

                      {approval.approvedAt && (
                        <p className="text-xs text-slate-500 mt-3">
                          {approval.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                          {new Date(approval.approvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {approval.status === 'pending' && approval.approverId === user.id && (
                      <div className="ml-6">
                        <button
                          onClick={() => setSelectedApproval(approval)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedApproval && selectedApproval.expense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-slate-900">Review Expense</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">
                  {selectedApproval.expense.description}
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p className="text-slate-900 font-semibold">
                      {selectedApproval.expense.currency} {selectedApproval.expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Category</p>
                    <p className="text-slate-900">{selectedApproval.expense.category}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="text-slate-900">
                      {new Date(selectedApproval.expense.expenseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Submitted by</p>
                    <p className="text-slate-900">
                      {mockUsers.find(u => u.id === selectedApproval.expense?.userId)?.fullName}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add any comments or notes..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleApprove(selectedApproval.id, selectedApproval.expenseId)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleReject(selectedApproval.id, selectedApproval.expenseId)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedApproval(null);
                    setComments('');
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
