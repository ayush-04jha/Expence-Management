import { Expense, ExpenseApproval, User, ApprovalRule } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    companyId: 'company-1',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    companyId: 'company-1',
    email: 'manager@example.com',
    fullName: 'Manager User',
    role: 'manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    companyId: 'company-1',
    email: 'employee@example.com',
    fullName: 'Employee User',
    role: 'employee',
    managerId: 'user-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-4',
    companyId: 'company-1',
    email: 'employee2@example.com',
    fullName: 'Jane Smith',
    role: 'employee',
    managerId: 'user-2',
    createdAt: new Date().toISOString(),
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'expense-1',
    userId: 'user-3',
    companyId: 'company-1',
    amount: 150.00,
    currency: 'USD',
    amountInBaseCurrency: 150.00,
    category: 'Travel',
    description: 'Taxi to client meeting',
    expenseDate: '2025-10-01',
    status: 'pending',
    currentApprovalLevel: 0,
    createdAt: new Date('2025-10-01').toISOString(),
  },
  {
    id: 'expense-2',
    userId: 'user-3',
    companyId: 'company-1',
    amount: 89.50,
    currency: 'USD',
    amountInBaseCurrency: 89.50,
    category: 'Meals',
    description: 'Team lunch meeting',
    expenseDate: '2025-09-28',
    status: 'approved',
    currentApprovalLevel: 1,
    createdAt: new Date('2025-09-28').toISOString(),
  },
  {
    id: 'expense-3',
    userId: 'user-3',
    companyId: 'company-1',
    amount: 1200.00,
    currency: 'USD',
    amountInBaseCurrency: 1200.00,
    category: 'Software',
    description: 'Annual software subscription',
    expenseDate: '2025-09-25',
    status: 'rejected',
    currentApprovalLevel: 0,
    createdAt: new Date('2025-09-25').toISOString(),
  },
];

export const mockApprovals: ExpenseApproval[] = [
  {
    id: 'approval-1',
    expenseId: 'expense-1',
    approverId: 'user-2',
    approvalLevel: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'approval-2',
    expenseId: 'expense-2',
    approverId: 'user-2',
    approvalLevel: 0,
    status: 'approved',
    comments: 'Approved - valid business expense',
    approvedAt: new Date('2025-09-29').toISOString(),
    createdAt: new Date('2025-09-28').toISOString(),
  },
  {
    id: 'approval-3',
    expenseId: 'expense-3',
    approverId: 'user-2',
    approvalLevel: 0,
    status: 'rejected',
    comments: 'Please get pre-approval for subscriptions over $1000',
    approvedAt: new Date('2025-09-26').toISOString(),
    createdAt: new Date('2025-09-25').toISOString(),
  },
];

export const mockApprovalRules: ApprovalRule[] = [
  {
    id: 'rule-1',
    companyId: 'company-1',
    name: 'Standard Sequential Approval',
    ruleType: 'sequential',
    approvalSequence: [
      {
        level: 0,
        roles: ['manager'],
        description: 'Manager Approval',
      },
      {
        level: 1,
        roles: ['admin'],
        description: 'Admin Final Approval',
      },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const addExpense = (expense: Expense) => {
  mockExpenses.push(expense);
};

export const updateExpense = (id: string, updates: Partial<Expense>) => {
  const index = mockExpenses.findIndex(e => e.id === id);
  if (index !== -1) {
    mockExpenses[index] = { ...mockExpenses[index], ...updates };
  }
};

export const addApproval = (approval: ExpenseApproval) => {
  mockApprovals.push(approval);
};

export const updateApproval = (id: string, updates: Partial<ExpenseApproval>) => {
  const index = mockApprovals.findIndex(a => a.id === id);
  if (index !== -1) {
    mockApprovals[index] = { ...mockApprovals[index], ...updates };
  }
};

export const addUser = (user: User) => {
  mockUsers.push(user);
};

export const updateUser = (id: string, updates: Partial<User>) => {
  const index = mockUsers.findIndex(u => u.id === id);
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...updates };
  }
};

export const deleteUser = (id: string) => {
  const index = mockUsers.findIndex(u => u.id === id);
  if (index !== -1) {
    mockUsers.splice(index, 1);
  }
};

export const addApprovalRule = (rule: ApprovalRule) => {
  mockApprovalRules.push(rule);
};

export const updateApprovalRule = (id: string, updates: Partial<ApprovalRule>) => {
  const index = mockApprovalRules.findIndex(r => r.id === id);
  if (index !== -1) {
    mockApprovalRules[index] = { ...mockApprovalRules[index], ...updates };
  }
};

export const deleteApprovalRule = (id: string) => {
  const index = mockApprovalRules.findIndex(r => r.id === id);
  if (index !== -1) {
    mockApprovalRules.splice(index, 1);
  }
};

export const getExpensesForUser = (userId: string): Expense[] => {
  return mockExpenses.filter(e => e.userId === userId);
};

export const getExpensesForManager = (managerId: string): Expense[] => {
  const teamUserIds = mockUsers.filter(u => u.managerId === managerId).map(u => u.id);
  return mockExpenses.filter(e => teamUserIds.includes(e.userId));
};

export const getApprovalsForUser = (approverId: string): ExpenseApproval[] => {
  return mockApprovals.filter(a => a.approverId === approverId && a.status === 'pending');
};

export const getExpenseById = (id: string): Expense | undefined => {
  return mockExpenses.find(e => e.id === id);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};


