/** Spare part master data */
export interface SparePart {
  id: number;
  image?: string;
  part_number: string;
  spare_part_name: string;
  spare_part_type: string;
  category: string;
  receiving_from_warehouse: string;
  businessUnit: string;
  description: string;
  unit: string;
  stock: number;
  spa_stock: number;
  unit_price: number;
}

/** ===========================
 *  RAW API RESPONSE TYPES
 * =========================== */

export interface SparePartPickedLine {
  itemId: string;
  requestLineId: number;
  fulfillmentLineId: number;
  partName: string;
  uom: string;
  type: string;
  requestedQty: number;
  deliveredQty: number;
  category: string;
  businessUnit: string;
   kind: string;
   imageId?: string;
}

export interface SparePartShipment {
  fulfillmentNo: string;
  warehouseCode: string;
  warehouseName: string;
  readyToPickUpAt: string;
  pickedUpAt: string;
  pickedUpBy: string;
  pickupLocation: string;
  pickupMethod: string;
  lines: SparePartPickedLine[];
}

export interface SparePartPickedRequest {
  requestId: number;
  requestNo: string;
  requestedAt: string;
  requestedBy: string;
  approvedBy: string;
  approvedAt: string;
  requestedQty: number;
  totalPickedUpAmount: number;
  remainingQty: number;
  shipping: SparePartShipment[];
}

export interface SparePartReturnBatchResponseItem {
  returnId: number;
  returnNo?: string;
  returnDate?: string;
  returnStatus?: string;
  returnByUser?: string;
  approvedByUser?: string | null;
  approvedDate?: string | null;
  rejectedByUser?: string | null;
  rejectedDate?: string | null;
  totalItems?: number;
  remark?: string;
}

/** ===========================
 *  FLATTENED TABLE ROW TYPE
 * =========================== */

/** One row in MySparePartList table and in FormModalSelectItems / DrawerViewItem */
export interface SparePartReturnListItem {
  id: string;
  // mapped to old field names to match table columns
  part_number?: string;
  spare_part_name?: string;
  request_id?: string;
  quantity?: number;
  UoM?: string;
  spare_part_type?: string;
  category?: string;
  receiving_from_warehouse?: string;
  businessUnit?: string;
  requested_date?: string;
  requested_pickup_date?: string;
  imageId?: string;
  // extra fields for drawer/modal
  requestId?: number;
  requestLineId?: number;
  requestNo?: string;
  requestedBy?: string;
  approvedBy?: string;
  fulfillmentNo?: string;
  fulfillmentLineId?: number;
  warehouseCode?: string;
  warehouseName?: string;
  pickupLocation?: string;
  itemId?: string;
  type?: string;
  kind?: string;
  deliveredQty?: number;
  // Fields for My Requests to Return
  return_id?: string;
  return_date?: string;
  total_items?: number;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  remarks?: string;
  return_quantity?: number;
  used_quantity?: number;
  reason?: string;
  stock_quantity?: number;
}

/** ===========================
 *  LEGACY TYPES (kept for compatibility)
 * =========================== */

/** Single return item from API (legacy) */
export interface SparePartReturnItem {
  id: number;
  spare_part_id: number;
  request_id?: string;
  requested_by?: string;
  return_quantity: number;
  used_quantity: number;
  quantity?: number;
  UoM?: string;
  reason?: string;
  from_warehouse?: string;
  spare_part_return_batch_id?: string;
  Requested_Date?: string | Date;
  Requested_Pickup_Date?: string | Date;
  remark?: string;
  imageId?: string;
  part_number?: string;
  spare_part_name?: string;
  spare_part_type?: string;
  category?: string;
  receiving_from_warehouse?: string;
  businessUnit?: string;
  requested_date?: string | Date;
  requested_pickup_date?: string | Date;
  stock_quantity?: number;
}

export interface SparePartReturnBatch {
  id: number;
  spare_part_return_batch_number: string;
  status: 'draft' | 'send' | 'approved';
  user_requester_by: string;
  approved_by?: string;
  items?: SparePartReturnItem[];
}

/** Search/filter params for spare-part-return list */
export interface SparePartReturnAdvanceSearch {
  searchValue?: string;
  requestedByUser?: string;
  approvedBy?: string;
  pickedUpBy?: string;
  warehouse?: string;
  warehouseCode?: string;
  bu?: string;
  category?: string;
  uom?: string;
  productNumber?: string;
  dateRange?: [string, string];
}

export interface SparePartReturnItemSearch {
  searchValue?: string;
  advanceSearch?: SparePartReturnAdvanceSearch;
}

/** One row in "My Requests to Return" table */
export interface MyRequestToReturnItem {
  id: number;
  return_id: string;
  return_date: string;
  manager_decide_date?: string;
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
  uom?: string;
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
  request_date: string;
  status: MyRequestToReturnItem['status'];
  items: RequestDetailLineItem[];
  activities: RequestDetailActivity[];
  remarks?: string;
}
export interface TableViewSearchReturnsParam{
  status?: string;
  approvedDateFrom?: string;
  approvedDateTo?: string;
  rejectedDateFrom?: string;
  rejectedDateTo?: string;
  returnDateFrom?: string;
  returnDateTo?: string;
}
/** Mock list for My Requests to Return */
export const MOCK_MY_REQUESTS_TO_RETURN: MyRequestToReturnItem[] = [
  { id: 1, return_id: 'RET-001', return_date: '2025-03-01', total_items: 3, status: 'Pending', remarks: 'Urgent' },
  { id: 2, return_id: 'RET-002', return_date: '2025-03-02', total_items: 5, status: 'Approved', remarks: '' },
  { id: 3, return_id: 'RET-003', return_date: '2025-03-03', total_items: 2, status: 'Completed' },
  { id: 4, return_id: 'RET-004', return_date: '2025-03-04', total_items: 8, status: 'Rejected', remarks: 'Missing docs' },
  { id: 5, return_id: 'RET-005', return_date: '2025-03-05', total_items: 1, status: 'Pending' },
];

/** Mock request detail for drawer */
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

/**
 * Maps nested API response (SparePartPickedRequest[])
 * to flattened table rows (SparePartReturnListItem[]).
 * Field names are kept aligned with existing table columns.
 */
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? dateStr
    : date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, 
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

export const mapToFlattenedRowsMySparePartList = (
  items: SparePartPickedRequest[]
): SparePartReturnListItem[] => {
  return items.flatMap((request) =>
    request.shipping.flatMap((shipment) =>
      shipment.lines.map((line) => ({
        // unique row key
        id: `${request.requestId}-${shipment.fulfillmentNo}-${line.fulfillmentLineId}`,
        // mapped to old field names to match existing table columns
        part_number:              line.itemId,
        spare_part_name:          line.partName,
        request_id:               request.requestNo,
        quantity:                 line.requestedQty,
        UoM:                      line.uom,
        receiving_from_warehouseName : shipment.warehouseName,
        receiving_from_warehouse:   shipment.warehouseCode,
        businessUnit:             line.businessUnit,
        requested_date:           formatDate(request.requestedAt),
        requested_pickup_date:    formatDate(shipment.pickedUpAt),
        // extra fields for drawer/modal
        requestId:                request.requestId,
        requestLineId:            line.requestLineId,
        requestNo:                request.requestNo,
        requestedBy:              request.requestedBy,
        approvedBy:               request.approvedBy,
        fulfillmentNo:            shipment.fulfillmentNo,
        fulfillmentLineId:        line.fulfillmentLineId,
        warehouseCode:            shipment.warehouseCode,
        warehouseName:            shipment.warehouseName,
        pickupLocation:           shipment.pickupLocation,
        itemId:                   line.itemId,
        imageId:                   line.imageId,
        deliveredQty:             line.deliveredQty,
        category:                 line.category,
        type:                     line.type,
      }))
    )
  );
};

export const mapToMyRequestToReturn = (
  item: SparePartReturnBatchResponseItem
): MyRequestToReturnItem => ({
  id: item.returnId,
  return_id: item.returnNo ?? `RET-${item.returnId}`,
  return_date: formatDate(item.returnDate ?? ''),
  manager_decide_date: formatDate(item.approvedDate ?? item.rejectedDate ?? ''),
  total_items: item.totalItems ?? 0,
  status:
    item.returnStatus === 'APPROVED'
      ? 'Approved'
      : item.returnStatus === 'REJECTED'
        ? 'Rejected'
        : item.returnStatus === 'COMPLETED'
          ? 'Completed'
          : 'Pending',
  remarks: item.remark ?? '',
});
