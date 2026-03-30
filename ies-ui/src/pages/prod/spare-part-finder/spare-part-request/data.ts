import { SortOrder } from 'antd/es/table/interface';

export type SparePartTab = 'spare-list' | 'my-requests' | 'my-received';
export type SparePartType = 'MRO-W' | 'MRO-S' | 'MRO-G';
export type SparePartStockStatus = 'available' | 'low' | 'no-stock';

export type RequestPriority = 'urgent' | 'high' | 'normal' | 'low';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in-progress' | 'partial' | 'ready_to_Pickup' | 'completed';

export interface MyRequestLineItem {
  requestLineId: number;
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  requestedQty: number;
  approvedQty: number;
  unit: string;
  toWarehouseCode?: string;
  forLine?: string;
  remark?: string;
  imageId?: string | string[];
}

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
  imageId?: string[];
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
  locations?: {
    warehouseCode: string;
    warehouseName?: string;
    level: string;
    shelve: string;
    rack: string;
    bin: string;
    onHandQty: number;
    reservedQty: number;
    availableQty: number;
    reorderLevel: number;
  }[];
  tab: SparePartTab;
  createdDate?: string;
}

export interface MyRequestItem {
  id: number;
  requestId: string;
  requestNo?: string;
  requestedBy?: string;
  priority: RequestPriority;
  requestDate: string;
  totalItems: number;
  receivedItems: number;
  requestStatus: RequestStatus;
  remark: string;
  type?: SparePartType;
  totalApprovedQty?: number;
  totalIssuedQty?: number;
  totalPickedQty?: number;
  items?: MyRequestLineItem[];
  rawRequestStatus?: string;
}

// =======================================
//                   Return
// =======================================
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed return' | 'partial return'
