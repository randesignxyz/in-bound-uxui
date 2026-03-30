import dayjs from 'dayjs';

export interface WarehouseRequestLineItem {
  id: number;
  productId?: string;
  itemName?: string;
  quantity: number;
  receivedQuantity?: number;
  businessUnit?: string;
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
  priority: 'Urgent' | 'High' | 'Normal';
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

export const parseRequestDate = (value: string) =>
  dayjs(value, ['YYYY-MM-DD HH:mm', 'YYYY-MMM-DD, h:mm A', 'YYYY-MMM-DD, hh:mm A'], true);

export const priorityColorMap: Record<WarehouseRequestRecord['priority'], string> = {
  Urgent: 'error',
  High: 'warning',
  Normal: 'info',
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
  const total = request.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const received = request.items.reduce((sum, item) => sum + (Number(item.receivedQuantity) || 0), 0);

  if (request.status === 'Rejected') return 'Rejected';
  if (pickupStatus === 'confirmed') {
    return rawRequestStatus === 'PARTIAL_ISSUE' ? 'Partial' : 'Completed';
  }
  if (rawRequestStatus === 'COMPLETE') return 'Ready To Pick Up';
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

export const mockWarehouseRequests: WarehouseRequestRecord[] = [
  {
    id: 1,
    requestId: 'REQ-WH-0001',
    requestDate: dayjs().subtract(3, 'day').format('YYYY-MMM-DD, h:mm A'),
    requester: 'Sok Dara',
    priority: 'Urgent',
    status: 'Pending',
    items: [
      { id: 1, productId: 'SP-001', itemName: 'Hydraulic Seal', quantity: 4, receivedQuantity: 0, businessUnit: 'BU-01' },
      { id: 2, productId: 'SP-002', itemName: 'O-Ring Kit', quantity: 2, receivedQuantity: 0, businessUnit: 'BU-01' },
    ],
  },
  {
    id: 2,
    requestId: 'REQ-WH-0002',
    requestDate: dayjs().subtract(2, 'day').format('YYYY-MMM-DD, h:mm A'),
    requester: 'Chan Vuthy',
    priority: 'High',
    status: 'Approved',
    items: [
      { id: 1, productId: 'SP-010', itemName: 'Bearing 6204', quantity: 5, receivedQuantity: 0, businessUnit: 'BU-02' },
      { id: 2, productId: 'SP-011', itemName: 'Grease Tube', quantity: 1, receivedQuantity: 0, businessUnit: 'BU-02' },
    ],
  },
  {
    id: 3,
    requestId: 'REQ-WH-0003',
    requestDate: dayjs().subtract(1, 'day').format('YYYY-MMM-DD, h:mm A'),
    requester: 'Kim Sovan',
    priority: 'Normal',
    status: 'Ready To Pick Up',
    shipments: [
      {
        id: 'SHP-0001',
        createdAt: dayjs().subtract(20, 'hour').toISOString(),
        createdBy: 'Warehouse',
        lines: [
          { itemId: 1, sendingQuantity: 4 },
        ],
      },
    ],
    items: [
      { id: 1, productId: 'SP-101', itemName: 'Filter Element', quantity: 6, receivedQuantity: 4, businessUnit: 'BU-03' },
      { id: 2, productId: 'SP-102', itemName: 'V-Belt', quantity: 2, receivedQuantity: 0, businessUnit: 'BU-03' },
    ],
  },
  {
    id: 4,
    requestId: 'REQ-WH-0004',
    requestDate: dayjs().subtract(6, 'hour').format('YYYY-MMM-DD, h:mm A'),
    requester: 'Srey Pov',
    priority: 'Normal',
    status: 'Partial',
    pickupDate: dayjs().subtract(3, 'hour').format('YYYY-MMM-DD, h:mm A'),
    pickedUpBy: 'Dara Sok',
    items: [
      { id: 1, productId: 'SP-201', itemName: 'Pressure Gauge', quantity: 3, receivedQuantity: 3, businessUnit: 'BU-04' },
      { id: 2, productId: 'SP-202', itemName: 'Relay 24V', quantity: 4, receivedQuantity: 1, businessUnit: 'BU-04' },
    ],
  },
  {
    id: 5,
    requestId: 'REQ-WH-0005',
    requestDate: dayjs().subtract(2, 'hour').format('YYYY-MMM-DD, h:mm A'),
    requester: 'Heng Sina',
    priority: 'Urgent',
    status: 'Completed',
    pickupDate: dayjs().subtract(1, 'hour').format('YYYY-MMM-DD, h:mm A'),
    pickedUpBy: 'Dara Sok',
    items: [
      { id: 1, productId: 'SP-301', itemName: 'Solenoid Valve', quantity: 2, receivedQuantity: 2, businessUnit: 'BU-01' },
      { id: 2, productId: 'SP-302', itemName: 'PTFE Tape', quantity: 1, receivedQuantity: 1, businessUnit: 'BU-01' },
    ],
  },
];

