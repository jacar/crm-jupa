export type UserRole = 'ADMIN' | 'DIRECTOR' | 'MANAGER' | 'SALES' | 'ARCHITECT' | 'DESIGNER' | 'ACCOUNTING' | 'CLIENT';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
