/**
 * Split4Us Mobile API Client
 *
 * Kommunicerar med Split4Us web API
 */

import { supabase } from '../supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Delay helper for retry backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper för att göra API-anrop med auth och retry
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<ApiResponse<T>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { error: 'Not authenticated', status: 401 };
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || response.statusText;

        // Retry on 5xx server errors
        if (response.status >= 500 && retries > 0) {
          await delay(RETRY_DELAY_MS * (MAX_RETRIES - retries + 1));
          return apiRequest<T>(endpoint, options, retries - 1);
        }

        return { error: errorMessage, status: response.status };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as unknown as T };
      }

      const data = await response.json();
      return { data };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Retry on network errors
    if (retries > 0 && error instanceof TypeError) {
      await delay(RETRY_DELAY_MS * (MAX_RETRIES - retries + 1));
      return apiRequest<T>(endpoint, options, retries - 1);
    }

    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown network error',
    };

    if (error instanceof DOMException && error.name === 'AbortError') {
      apiError.message = 'Request timed out';
      apiError.code = 'TIMEOUT';
    }

    console.error(`API request failed: ${endpoint}`, apiError);
    return { error: apiError.message };
  }
}

// ==================== GROUPS ====================

export interface Split4UsGroup {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_archived: boolean;
  member_count?: number;
  total_expenses?: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  currency?: string;
}

export const groupsApi = {
  async getAll() {
    return apiRequest<Split4UsGroup[]>('/api/split4us/groups');
  },

  async getById(groupId: string) {
    return apiRequest<Split4UsGroup>(`/api/split4us/groups/${groupId}`);
  },

  async create(data: CreateGroupRequest) {
    return apiRequest<Split4UsGroup>('/api/split4us/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(groupId: string, data: Partial<Split4UsGroup>) {
    return apiRequest<Split4UsGroup>(`/api/split4us/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(groupId: string) {
    return apiRequest<void>(`/api/split4us/groups/${groupId}`, {
      method: 'DELETE',
    });
  },

  async archive(groupId: string) {
    return apiRequest<Split4UsGroup>(`/api/split4us/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_archived: true }),
    });
  },
};

// ==================== MEMBERS ====================

export interface GroupMember {
  user_id: string;
  group_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export const membersApi = {
  async getAll(groupId: string) {
    return apiRequest<GroupMember[]>(`/api/split4us/groups/${groupId}/members`);
  },

  async add(groupId: string, email: string, role: 'admin' | 'member' = 'member') {
    return apiRequest<GroupMember>(`/api/split4us/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async remove(groupId: string, userId: string) {
    return apiRequest<void>(`/api/split4us/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateRole(groupId: string, userId: string, role: 'admin' | 'member') {
    return apiRequest<GroupMember>(`/api/split4us/groups/${groupId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
};

// ==================== EXPENSES ====================

export interface Split4UsExpense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paid_by: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  notes?: string;
  receipt_url?: string;
  splits?: ExpenseSplit[];
  paid_by_user?: {
    email: string;
    full_name?: string;
  };
}

export interface ExpenseSplit {
  user_id: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface CreateExpenseRequest {
  group_id: string;
  description: string;
  amount: number;
  currency?: string;
  category: string;
  date: string;
  paid_by: string;
  notes?: string;
  split_type: SplitType;
  splits: ExpenseSplit[];
}

export const expensesApi = {
  async getAll(groupId?: string) {
    const query = groupId ? `?groupId=${groupId}` : '';
    return apiRequest<Split4UsExpense[]>(`/api/split4us/expenses${query}`);
  },

  async getById(expenseId: string) {
    return apiRequest<Split4UsExpense>(`/api/split4us/expenses/${expenseId}`);
  },

  async create(data: CreateExpenseRequest) {
    return apiRequest<Split4UsExpense>('/api/split4us/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(expenseId: string, data: Partial<CreateExpenseRequest>) {
    return apiRequest<Split4UsExpense>(`/api/split4us/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(expenseId: string) {
    return apiRequest<void>(`/api/split4us/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== BALANCES ====================

export interface UserBalance {
  user_id: string;
  group_id: string;
  balance: number;
  total_paid: number;
  total_owed: number;
  currency: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface Settlement {
  from_user_id: string;
  to_user_id: string;
  amount: number;
}

export interface SettlementSuggestion {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  from_user?: {
    email: string;
    full_name?: string;
  };
  to_user?: {
    email: string;
    full_name?: string;
  };
}

export const balancesApi = {
  async getAll(groupId: string) {
    return apiRequest<UserBalance[]>(`/api/split4us/balances?groupId=${groupId}`);
  },

  async getSettlementSuggestions(groupId: string) {
    return apiRequest<SettlementSuggestion[]>(`/api/split4us/settlements?groupId=${groupId}&suggestions=true`);
  },

  async recordSettlement(groupId: string, fromUserId: string, toUserId: string, amount: number) {
    return apiRequest<void>('/api/split4us/settlements', {
      method: 'POST',
      body: JSON.stringify({
        group_id: groupId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
      }),
    });
  },
};

// ==================== ANALYTICS ====================

export interface GroupStats {
  total_expenses: number;
  total_amount: number;
  average_expense: number;
  expense_count_by_category: Record<string, number>;
  top_spender: {
    user_id: string;
    total: number;
  } | null;
}

export const analyticsApi = {
  async getStats(groupId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiRequest<GroupStats>(`/api/split4us/analytics/${groupId}/stats${query}`);
  },
};

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  async getAll() {
    return apiRequest<Notification[]>('/api/split4us/notifications');
  },

  async markAsRead(notificationId: string) {
    return apiRequest<void>(`/api/split4us/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
  },

  async markAllAsRead() {
    return apiRequest<void>('/api/split4us/notifications/mark-all-read', {
      method: 'POST',
    });
  },
};
