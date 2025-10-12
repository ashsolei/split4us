/**
 * Split4Us Type Definitions
 * Re-exports types from the API client for easier imports
 */

import type {
  Split4UsGroup,
  CreateGroupRequest,
  GroupMember,
  Split4UsExpense,
  ExpenseSplit,
  CreateExpenseRequest,
  SplitType,
} from '../lib/split4us/api';

export type {
  Split4UsGroup,
  CreateGroupRequest,
  GroupMember,
  Split4UsExpense,
  ExpenseSplit,
  CreateExpenseRequest,
  SplitType,
};

// Extended types with optional UI properties
export type Group = Split4UsGroup & {
  expense_count?: number;
};

export type Expense = Split4UsExpense & {
  paid_by_name?: string;
  group_name?: string;
  split_type?: SplitType;
  participants?: { user_id: string; amount: number }[];
};

export type Member = GroupMember;


