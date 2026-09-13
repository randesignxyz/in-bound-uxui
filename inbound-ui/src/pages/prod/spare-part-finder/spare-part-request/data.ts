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
  categoryId?: number;
  category?: string;
  requestedQty: number;
  approvedQty: number;
  unit: string;
  fromWarehouse?: string;
  fromWarehouseCode?: string;
  toWarehouseCode?: string;
  forLine?: string;
  requestOtherDestination?: boolean;
  otherDestination?: string;
  remark?: string;
  imageId?: string | string[];
}

export interface SparePartRequestSearch {
  searchValue?: string;
  tab?: SparePartTab;
  warehouse?: string;
  category?: string;
  categoryId?: number;
  status?: 'ALL' | SparePartStockStatus;
  sort?: Record<string, SortOrder>;
}

export interface MyRequestSearch {
  searchValue?: string;
  priority?: 'ALL' | RequestPriority;
  status?: 'ALL' | RequestStatus;
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
  kind?: string;
  categoryId?: number;
  category: string;
  uom?: string;
  uomOptions?: string[];
  stock: number;
  businessUnit: string;
  isActive?: boolean;
  status: SparePartStockStatus;
  warehouse: string;
  stockStatus?: string;
  locations?: {
    inventoryId?: number | null;
    warehouseCode: string;
    warehouseName?: string;
    businessUnit?: string;
    level: string;
    shelve: string;
    rack: string;
    bin: string;
    onHandQty?: number;
    reservedQty?: number;
    availableQty: number;
    reorderLevel: number;
    stockStatus?: string;
    sapStock?: number | null;
    lastSyncedAt?: string;
  }[];
  tab: SparePartTab;
  createdDate?: string;
  updatedDate?: string;
}

export interface MyRequestItem {
  id: number;
  requestId: string;
  requestNo?: string;
  requestedBy?: string;
  approvedBy?: string;
  approverRemark?: string;
  priority: RequestPriority;
  requestDate: string;
  totalItems: number;
  receivedItems: number;
  requestStatus: RequestStatus;
  remark: string;
  category?: string;
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

