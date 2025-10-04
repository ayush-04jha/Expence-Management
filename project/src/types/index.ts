export type UserRole = 'admin' | 'manager' | 'employee';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalRuleType = 'percentage' | 'specific_approver' | 'hybrid' | 'sequential';

export interface Company {
  id: string;
  name: string;
  country: string;
  baseCurrency: string;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  email: string;
  fullName: string;
  role: UserRole;
  managerId?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  companyId: string;
  amount: number;
  currency: string;
  amountInBaseCurrency: number;
  category: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  currentApprovalLevel: number;
  createdAt: string;
  user?: User;
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  name: string;
  ruleType: ApprovalRuleType;
  approvalSequence: ApprovalLevel[];
  percentageThreshold?: number;
  specificApproverId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApprovalLevel {
  level: number;
  roles?: UserRole[];
  userIds?: string[];
  description: string;
}

export interface ExpenseApproval {
  id: string;
  expenseId: string;
  approverId: string;
  approvalLevel: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  approver?: User;
  expense?: Expense;
}

export interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

export interface ExchangeRateResponse {
  base: string;
  rates: {
    [key: string]: number;
  };
}
