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
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'Approved' | 'Partial' | 'Completed' | 'Ready To Pick Up' | 'Rejected';
  items: WarehouseRequestLineItem[];
  shipments?: WarehouseRequestShipment[];
  pickupDate?: string;
  pickedUpBy?: string;
}

export const parseRequestDate = (value: string) =>
  dayjs(value, ['YYYY-MM-DD HH:mm', 'YYYY-MMM-DD, h:mm A', 'YYYY-MMM-DD, hh:mm A'], true);

export const priorityColorMap: Record<WarehouseRequestRecord['priority'], string> = {
  Urgent: '#ff4d4f',
  High: '#fa8c16',
  Normal: '#1677ff',
  Low: '#8c8c8c',
};

export const getWarehouseRequestStatus = (status: WarehouseRequestRecord['status']) =>
  status === 'Approved' ? 'Processing' : status;

export const statusPillMap: Record<string, { background: string; color: string }> = {
  Pending: { background: '#e6f4ff', color: '#1677ff' },
  Partial: { background: '#fff7e6', color: '#fa8c16' },
  Completed: { background: '#f6ffed', color: '#52c41a' },
  'Ready To Pick Up': { background: '#fffbe6', color: '#ad8b00' },
  Processing: { background: '#e6f4ff', color: '#1677ff' },
  'In Progress': { background: '#e6f4ff', color: '#1677ff' },
  Approved: { background: '#e6f4ff', color: '#1677ff' },
  Rejected: { background: '#fff1f0', color: '#f5222d' },
  'Completed Return': { background: '#f6ffed', color: '#52c41a' },
  'Partially Returned': { background: '#fff7e6', color: '#fa8c16' },
};

export const getStatusPill = (status: string) =>
  statusPillMap[status] ?? { background: '#f0f0f0', color: '#8c8c8c' };

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
    priority: 'Low',
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

