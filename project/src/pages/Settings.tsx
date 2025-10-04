import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  mockApprovalRules,
  mockUsers,
  addApprovalRule,
  updateApprovalRule,
  deleteApprovalRule
} from '../services/mockData';
import { Plus, CreditCard as Edit2, Trash2, Settings as SettingsIcon, X } from 'lucide-react';
import { ApprovalRule, ApprovalRuleType, UserRole, ApprovalLevel } from '../types';

export const Settings: React.FC = () => {
  const { user: currentUser, company } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'sequential' as ApprovalRuleType,
    percentageThreshold: 60,
    specificApproverId: '',
    approvalSequence: [] as ApprovalLevel[],
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don't have permission to view this page.</p>
      </div>
    );
  }

  const companyRules = mockApprovalRules.filter(r => r.companyId === currentUser.companyId);
  const companyUsers = mockUsers.filter(u => u.companyId === currentUser.companyId);

  const addApprovalLevel = () => {
    setFormData({
      ...formData,
      approvalSequence: [
        ...formData.approvalSequence,
        {
          level: formData.approvalSequence.length,
          roles: [],
          userIds: [],
          description: `Level ${formData.approvalSequence.length + 1}`,
        },
      ],
    });
  };

  const updateApprovalLevel = (index: number, updates: Partial<ApprovalLevel>) => {
    const newSequence = [...formData.approvalSequence];
    newSequence[index] = { ...newSequence[index], ...updates };
    setFormData({ ...formData, approvalSequence: newSequence });
  };

  const removeApprovalLevel = (index: number) => {
    const newSequence = formData.approvalSequence.filter((_, i) => i !== index);
    setFormData({ ...formData, approvalSequence: newSequence });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRule) {
      updateApprovalRule(editingRule.id, {
        name: formData.name,
        ruleType: formData.ruleType,
        approvalSequence: formData.approvalSequence,
        percentageThreshold: formData.ruleType === 'percentage' || formData.ruleType === 'hybrid'
          ? formData.percentageThreshold
          : undefined,
        specificApproverId: formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid'
          ? formData.specificApproverId
          : undefined,
      });
    } else {
      const newRule: ApprovalRule = {
        id: `rule-${Date.now()}`,
        companyId: currentUser.companyId,
        name: formData.name,
        ruleType: formData.ruleType,
        approvalSequence: formData.approvalSequence,
        percentageThreshold: formData.ruleType === 'percentage' || formData.ruleType === 'hybrid'
          ? formData.percentageThreshold
          : undefined,
        specificApproverId: formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid'
          ? formData.specificApproverId
          : undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addApprovalRule(newRule);
    }

    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      ruleType: 'sequential',
      percentageThreshold: 60,
      specificApproverId: '',
      approvalSequence: [],
    });
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      ruleType: rule.ruleType,
      percentageThreshold: rule.percentageThreshold || 60,
      specificApproverId: rule.specificApproverId || '',
      approvalSequence: rule.approvalSequence,
    });
    setShowForm(true);
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this approval rule?')) {
      deleteApprovalRule(ruleId);
    }
  };

  const toggleRuleStatus = (ruleId: string, currentStatus: boolean) => {
    updateApprovalRule(ruleId, { isActive: !currentStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-600 mt-1">Manage approval rules and configurations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-slate-500">Company Name</p>
            <p className="text-slate-900 font-medium mt-1">{company?.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Country</p>
            <p className="text-slate-900 font-medium mt-1">{company?.country}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Base Currency</p>
            <p className="text-slate-900 font-medium mt-1">{company?.baseCurrency}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Approval Rules</h3>
          <button
            onClick={() => {
              setEditingRule(null);
              setFormData({
                name: '',
                ruleType: 'sequential',
                percentageThreshold: 60,
                specificApproverId: '',
                approvalSequence: [],
              });
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Rule</span>
          </button>
        </div>

        <div className="space-y-4">
          {companyRules.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <SettingsIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No approval rules configured</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first rule
              </button>
            </div>
          ) : (
            companyRules.map((rule) => {
              const specificApprover = rule.specificApproverId
                ? companyUsers.find(u => u.id === rule.specificApproverId)
                : null;

              return (
                <div key={rule.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold text-slate-900">{rule.name}</h4>
                        <span className={`
                          px-2.5 py-1 rounded-full text-xs font-medium capitalize
                          ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}
                        `}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {rule.ruleType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          rule.isActive
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {rule.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {rule.ruleType === 'sequential' && rule.approvalSequence.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">Approval Sequence:</p>
                      <div className="space-y-2">
                        {rule.approvalSequence.map((level, index) => (
                          <div key={index} className="flex items-center space-x-3 pl-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-sm">{level.level + 1}</span>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-lg px-4 py-2">
                              <p className="text-sm text-slate-900 font-medium">{level.description}</p>
                              {level.roles && level.roles.length > 0 && (
                                <p className="text-xs text-slate-600 mt-1">
                                  Roles: {level.roles.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.ruleType === 'percentage' && (
                    <p className="text-sm text-slate-600">
                      Requires {rule.percentageThreshold}% approval from designated approvers
                    </p>
                  )}

                  {rule.ruleType === 'specific_approver' && specificApprover && (
                    <p className="text-sm text-slate-600">
                      Requires approval from: <span className="font-medium">{specificApprover.fullName}</span>
                    </p>
                  )}

                  {rule.ruleType === 'hybrid' && (
                    <p className="text-sm text-slate-600">
                      Requires {rule.percentageThreshold}% approval OR approval from{' '}
                      <span className="font-medium">{specificApprover?.fullName}</span>
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRule(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Standard Approval Workflow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rule Type
                </label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as ApprovalRuleType })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sequential">Sequential (Multi-level approval)</option>
                  <option value="percentage">Percentage-based</option>
                  <option value="specific_approver">Specific Approver</option>
                  <option value="hybrid">Hybrid (Percentage OR Specific)</option>
                </select>
              </div>

              {formData.ruleType === 'sequential' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Approval Sequence
                    </label>
                    <button
                      type="button"
                      onClick={addApprovalLevel}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Level
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.approvalSequence.map((level, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Level {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeApprovalLevel(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={level.description}
                          onChange={(e) => updateApprovalLevel(index, { description: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="Level description"
                        />

                        <div>
                          <label className="block text-xs text-slate-600 mb-2">Roles</label>
                          <div className="flex flex-wrap gap-2">
                            {(['admin', 'manager', 'employee'] as UserRole[]).map((role) => (
                              <label key={role} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={level.roles?.includes(role)}
                                  onChange={(e) => {
                                    const roles = level.roles || [];
                                    if (e.target.checked) {
                                      updateApprovalLevel(index, { roles: [...roles, role] });
                                    } else {
                                      updateApprovalLevel(index, { roles: roles.filter(r => r !== role) });
                                    }
                                  }}
                                  className="rounded border-slate-300"
                                />
                                <span className="text-sm text-slate-700 capitalize">{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Approval Percentage Threshold
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={formData.percentageThreshold}
                      onChange={(e) => setFormData({ ...formData, percentageThreshold: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-900 w-12">
                      {formData.percentageThreshold}%
                    </span>
                  </div>
                </div>
              )}

              {(formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Specific Approver
                  </label>
                  <select
                    value={formData.specificApproverId}
                    onChange={(e) => setFormData({ ...formData, specificApproverId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an approver</option>
                    {companyUsers.filter(u => u.role === 'admin' || u.role === 'manager').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.role})
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
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
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
