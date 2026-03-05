import { SortOrder } from 'antd/es/table/interface';

export type SparePartTab = 'spare-list' | 'my-requests' | 'my-received';
export type SparePartType = 'MRO-W' | 'MRO-S' | 'MRO-G';
export type SparePartStockStatus = 'available' | 'low' | 'no-stock';

export type RequestPriority = 'urgent' | 'high' | 'normal' | 'low';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in-progress' | 'partial';

export interface SparePartRequestSearch {
  searchValue?: string;
  tab?: SparePartTab;
  type?: 'ALL' | SparePartType;
  warehouse?: string;
  category?: string;
  status?: 'ALL' | SparePartStockStatus;
  sort?: Record<string, SortOrder>;
}

export interface MyRequestSearch {
  searchValue?: string;
  priority?: 'ALL' | RequestPriority;
  status?: 'ALL' | RequestStatus;
  type?: 'ALL' | SparePartType;
  dateRange?: [string, string];
  sort?: Record<string, SortOrder>;
}

export interface SparePartRequestItem {
  id: number;
  image?: string;
  productId: string;
  partName: string;
  description?: string;
  tags?: string[];
  type: SparePartType;
  category: string;
  stock: number;
  businessUnit: string;
  status: SparePartStockStatus;
  warehouse: string;
  tab: SparePartTab;
  createdDate?: string;
}

export interface MyRequestItem {
  id: number;
  requestId: string;
  priority: RequestPriority;
  requestDate: string;
  totalItems: number;
  receivedItems: number;
  requestStatus: RequestStatus;
  remark: string;
  type?: SparePartType;
}
