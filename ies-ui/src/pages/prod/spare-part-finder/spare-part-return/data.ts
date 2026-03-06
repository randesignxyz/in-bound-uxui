/** Spare part master data */
export interface SparePart {
  id: number;
  image?: string;
  part_number: string;
  spare_part_name: string;
  spare_part_type: string;
  category: string;
  receiving_from_warehouse: string;
  business_unit: string;
  description: string;
  unit: string;
  stock: number;
  spa_stock: number;
  unit_price: number;
}

/** Single return item from API (may include flattened spare part fields in list response) */
export interface SparePartReturnItem {
  id: number;
  spare_part_id: number;
  requested_id?: string;
  requested_by?: string;
  return_quantity: number;
  used_quantity: number;
  reason?: string;
  from_warehouse?: string;
  spare_part_return_batch_id?: string;
  Requested_Date?: string | Date;
  Requested_Pickup_Date?: string | Date;
  remark?: string;
  // Flattened from SparePart when API returns list (for table display)
  image?: string;
  part_number?: string;
  spare_part_name?: string;
  spare_part_type?: string;
  category?: string;
  receiving_from_warehouse?: string;
  business_unit?: string;
  requested_date?: string | Date;
  requested_pickup_date?: string | Date;
  stock_quantity?: number;
}

/** One row in MySparePartList table and in FormModalSelectItems / DrawerViewItem */
export type SparePartReturnListItem = Pick<SparePart, 'id' | 'image' | 'part_number' | 'spare_part_name' | 'spare_part_type' | 'category' | 'receiving_from_warehouse' | 'business_unit'> & {
  requested_date?: string | Date;
  requested_pickup_date?: string | Date;
  return_quantity?: number;
  used_quantity?: number;
  reason?: string;
  stock_quantity?: number;
};

export interface SparePartReturnBatch {
  id: number;
  spare_part_return_batch_number: string;
  status: 'draft' | 'send' | 'approved';
  user_requester_by: string;
  approved_by?: string;
  items?: SparePartReturnItem[];
}

/** Search/filter params for spare-part-return list (used by service.page) */
export interface SparePartReturnItemSearch {
  pickup_date?: string | Date;
  return_batch_number?: string;
  part_number?: string;
  spare_part_name?: string;
  receiving_from_warehouse?: string;
  business_unit?: string;
  category?: string;
  type?: string;
  searchValue?: string;
}

/** One row in "My Requests to Return" table */
export interface MyRequestToReturnItem {
  id: number;
  return_id: string;
  return_date: string;
  total_items: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  remarks?: string;
}

/** Status options for My Requests to Return filter */
export const MY_REQUESTS_TO_RETURN_STATUS_OPTIONS = [
  { value: 'Status', label: 'Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Completed', label: 'Completed' },
] as const;

/** One line item in the Details Request drawer table */
export interface RequestDetailLineItem {
  no: number;
  image?: string;
  product_id: string;
  request_id: string;
  item_name: string;
  quantity_to_return: number;
  used_quantity: number;
  total: number;
}

/** One activity in Recent Activities timeline */
export interface RequestDetailActivity {
  label: string;
  description: string;
  date?: string;
  dot?: 'default' | 'pending';
}

/** Full request detail for DrawerBatchReturnItems (Details Request) */
export interface RequestDetailData {
  no: number;
  request_id: string;
  total_items: number;
  request_date: string; // e.g. "2025-Dec-01 8:05AM"
  status: MyRequestToReturnItem['status'];
  items: RequestDetailLineItem[];
  activities: RequestDetailActivity[];
  remarks?: string;
}

/** Mock list for My Requests to Return */
export const MOCK_MY_REQUESTS_TO_RETURN: MyRequestToReturnItem[] = [
  { id: 1, return_id: 'RET-001', return_date: '2025-03-01', total_items: 3, status: 'Pending', remarks: 'Urgent' },
  { id: 2, return_id: 'RET-002', return_date: '2025-03-02', total_items: 5, status: 'Approved', remarks: '' },
  { id: 3, return_id: 'RET-003', return_date: '2025-03-03', total_items: 2, status: 'Completed' },
  { id: 4, return_id: 'RET-004', return_date: '2025-03-04', total_items: 8, status: 'Rejected', remarks: 'Missing docs' },
  { id: 5, return_id: 'RET-005', return_date: '2025-03-05', total_items: 1, status: 'Pending' },
];

/** Mock request detail for drawer (e.g. request No 2) */
export const MOCK_REQUEST_DETAIL: RequestDetailData = {
  no: 2,
  request_id: 'PRD-0001',
  total_items: 6,
  request_date: '2025-Dec-01 8:05AM',
  status: 'Pending',
  items: [
    { no: 1, product_id: 'ELE-SNS-0r4', request_id: 'Re-001', item_name: 'Gloves', quantity_to_return: 12, used_quantity: 5, total: 17, image: 'https://via.placeholder.com/48?text=1' },
    { no: 2, product_id: 'ELE-SNS-0r4', request_id: '2e-001', item_name: 'V-Belt A-42', quantity_to_return: 12, used_quantity: 0, total: 12, image: 'https://via.placeholder.com/48?text=2' },
    { no: 3, product_id: 'ELE-SNS-0r4', request_id: 'Re-002', item_name: 'Gear Coupling Assembly', quantity_to_return: 12, used_quantity: 0, total: 12, image: 'https://via.placeholder.com/48?text=3' },
    { no: 4, product_id: 'ELE-SNS-0r4', request_id: 'Re-0032', item_name: 'V-Belt A50V-Belt A50V-Belt A50', quantity_to_return: 12, used_quantity: 0, total: 12, image: 'https://via.placeholder.com/48?text=4' },
    { no: 5, product_id: 'ELE-SNS-0r4', request_id: 'Re-001', item_name: 'Gloves', quantity_to_return: 12, used_quantity: 0, total: 12, image: 'https://via.placeholder.com/48?text=5' },
  ],
  activities: [
    { label: 'Request by', description: 'Request by Mr.Khun Meas - 20 days ago', date: 'Feb-01-2025', dot: 'default' },
    { label: 'Approved by', description: 'Approved by Mr.Khun Meas - 20 days ago', date: 'Feb-01-2025', dot: 'default' },
    { label: 'Waiting', description: 'Waiting', dot: 'pending' },
  ],
};

/** Filter options for MySparePartList (radio: All / MRO-W / MRO-S / MRO-G) */
export const SPARE_PART_RETURN_RADIO_OPTIONS = [
  { value: 'All', label: 'ALL' },
  { value: 'MRO-W', label: 'MRO-W' },
  { value: 'MRO-S', label: 'MRO-S' },
  { value: 'MRO-G', label: 'MRO-G' },
] as const;

/** Category filter options for the list */
export const SPARE_PART_CATEGORY_OPTIONS = [
  { value: 'category', label: 'Categories' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Hydraulic', label: 'Hydraulic' },
  { value: 'Tools', label: 'Tools' },
] as const;

/** Mock list data for spare part return (used when not calling real endpoint) */
export const MOCK_SPARE_PART_RETURN_LIST: SparePartReturnListItem[] = [
  {
    id: 1,
    part_number: 'SP-001',
    spare_part_name: 'Bearing Assembly',
    spare_part_type: 'Mechanical',
    category: 'Mechanical',
    receiving_from_warehouse: 'WH-MRO-W',
    business_unit: 'MRO-W',
    image: 'https://via.placeholder.com/80?text=SP-001',
    requested_date: '2025-03-01',
    requested_pickup_date: '2025-03-05',
    stock_quantity: 12,
  },
  {
    id: 2,
    part_number: 'SP-002',
    spare_part_name: 'Motor Seal Kit',
    spare_part_type: 'Hydraulic',
    category: 'Hydraulic',
    receiving_from_warehouse: 'WH-MRO-S',
    business_unit: 'MRO-S',
    image: 'https://via.placeholder.com/80?text=SP-002',
    requested_date: '2025-03-02',
    requested_pickup_date: '2025-03-06',
    stock_quantity: 5,
  },
  {
    id: 3,
    part_number: 'SP-003',
    spare_part_name: 'Control Relay',
    spare_part_type: 'Electrical',
    category: 'Electrical',
    receiving_from_warehouse: 'WH-MRO-G',
    business_unit: 'MRO-G',
    image: 'https://via.placeholder.com/80?text=SP-003',
    requested_date: '2025-03-03',
    requested_pickup_date: '2025-03-07',
    stock_quantity: 24,
  },
  {
    id: 4,
    part_number: 'SP-004',
    spare_part_name: 'Wrench Set',
    spare_part_type: 'Tools',
    category: 'Tools',
    receiving_from_warehouse: 'WH-MRO-W',
    business_unit: 'MRO-W',
    requested_date: '2025-03-04',
    requested_pickup_date: '2025-03-08',
    stock_quantity: 8,
  },
  {
    id: 5,
    part_number: 'SP-005',
    spare_part_name: 'Gasket Pack',
    spare_part_type: 'Mechanical',
    category: 'Mechanical',
    receiving_from_warehouse: 'WH-MRO-S',
    business_unit: 'MRO-S',
    image: 'https://via.placeholder.com/80?text=SP-005',
    requested_date: '2025-03-05',
    requested_pickup_date: '2025-03-09',
    stock_quantity: 30,
  },
];
