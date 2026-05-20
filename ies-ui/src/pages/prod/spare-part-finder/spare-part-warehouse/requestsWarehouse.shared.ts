import { parseSpfDateTime } from '../shared/dateTime';

export interface WarehouseRequestLineItem {
  id: number;
  productId?: string;
  itemName?: string;
  quantity: number;
  receivedQuantity?: number;
  businessUnit?: string;
  uom?: string;
}

export interface WarehouseRequestShipmentLine {
  itemId: number;
  sendingQuantity: number;
}

export interface WarehouseRequestShipment {
  id: string;
  createdAt: string;
  createdBy?: string;
  lines: WarehouseRequestShipmentLine[];
}

export interface WarehouseRequestRecord {
  id: number;
  requestId: string;
  requestDate: string;
  requester: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  status:
    | 'Pending'
    | 'Approved'
    | 'In Progress'
    | 'Partial'
    | 'Completed'
    | 'Ready To Pick Up'
    | 'Rejected';
  items: WarehouseRequestLineItem[];
  shipments?: WarehouseRequestShipment[];
  pickupDate?: string;
  pickedUpBy?: string;
  rawRequestStatus?: string;
  pickupStatus?: string;
}

export type WarehouseDisplayStatus =
  | 'Pending'
  | 'In Progress'
  | 'Ready To Pick Up'
  | 'Partial'
  | 'Completed'
  | 'Rejected';

export const parseRequestDate = (value: string) => parseSpfDateTime(value);

export const priorityColorMap: Record<WarehouseRequestRecord['priority'], string> = {
  Urgent: 'error',
  High: 'warning',
  Normal: 'info',
  Low: 'default',
};

export const getWarehouseRequestStatus = (status: WarehouseRequestRecord['status']) => status;

export const warehouseStatusColorMap: Record<WarehouseDisplayStatus, string> = {
  Pending: 'default',
  'In Progress': 'processing',
  'Ready To Pick Up': 'success',
  Partial: 'gold',
  Completed: 'success',
  Rejected: 'error',
};

export const warehouseStatusLabelMap: Record<WarehouseDisplayStatus, string> = {
  Pending: 'Pending',
  'In Progress': 'In Progress',
  'Ready To Pick Up': 'Ready To Pick Up',
  Partial: 'Partial',
  Completed: 'Completed',
  Rejected: 'Rejected',
};

export const deriveWarehouseDisplayStatus = (request: WarehouseRequestRecord): WarehouseDisplayStatus => {
  const rawRequestStatus = String(request.rawRequestStatus || '').trim().toUpperCase();
  const pickupStatus = String(request.pickupStatus || '').trim().toLowerCase();
  const received = request.items.reduce((sum, item) => sum + (Number(item.receivedQuantity) || 0), 0);

  if (request.status === 'Rejected') return 'Rejected';
  if (request.status === 'Completed') return 'Completed';
  if (request.status === 'Partial') return 'Partial';
  if (request.status === 'Ready To Pick Up') return 'Ready To Pick Up';
  if (request.status === 'In Progress') return 'In Progress';
  if (rawRequestStatus === 'IN_PROGRESS') {
    return pickupStatus === 'confirmed' && received > 0 ? 'Partial' : 'In Progress';
  }
  if (rawRequestStatus === 'PARTIAL_ISSUE') return 'Ready To Pick Up';
  if (rawRequestStatus === 'COMPLETE') {
    return pickupStatus === 'confirmed' ? 'Completed' : 'Ready To Pick Up';
  }
  if (request.status === 'Ready To Pick Up') return 'Ready To Pick Up';
  if (request.status === 'Partial') return 'Partial';
  if (request.status === 'In Progress') return 'In Progress';
  if (
    request.status === 'Approved' ||
    request.status === 'Pending'
  ) {
    // For warehouse queue, approved requests are treated as pending until warehouse confirms requester.
    return 'Pending';
  }

  if (
    received > 0
  ) {
    return 'In Progress';
  }

  return 'Pending';
};

export const calcRequestTotals = (request: WarehouseRequestRecord) => {
  const total = request.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const received = request.items.reduce((sum, item) => sum + (Number(item.receivedQuantity) || 0), 0);
  const percent = total ? Math.round((received / total) * 100) : 0;
  return { total, received, percent };
};

