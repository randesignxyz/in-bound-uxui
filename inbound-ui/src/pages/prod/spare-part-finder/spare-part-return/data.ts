import { formatSpfDateTime } from "../shared/dateTime";

/** Spare part master data */
export interface SparePart {
  id: number;
  image?: string;
  part_number: string;
  spare_part_name: string;
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
  fulfillmentLineId: number | string;
  isClosed: boolean;
  forLine?: string;
  toWarehouseCode?: string;
  toWarehouseName?: string;
  partName: string;
  uom: string;
  requestedQty: number;
  deliveredQty: number;
  category?: string | { category_name?: string | null } | null;
  businessUnit: string;
  requestOtherDestination?: boolean;
  otherDestination?: string;
  kind: string;
  imageId?: string;
  pendingReturnQty?: number;
  returnedQty?: number;
  item_condition?: string;
  itemCondition?: string;
  remainingQty?: number;
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
  description?: string;
  request_id?: string;
  quantity?: number;
  UoM?: string;
  category?: string;
  receiving_from_warehouse?: string;
  forLine?: string;
  toWarehouseCode?: string;
  toWarehouseName?: string;
  businessUnit?: string;
  requested_date?: string;
  requested_pickup_date?: string;
  imageId?: string;
  item_condition?: string;
  itemCondition?: string;
  // extra fields for drawer/modal
  requestId?: number;
  requestLineId?: number;
  requestNo?: string;
  requestedBy?: string;
  approvedBy?: string;
  fulfillmentNo?: string;
  fulfillmentLineId?: number | string;
  warehouseCode?: string;
  warehouseName?: string;
  pickupLocation?: string;
  requestOtherDestination?: boolean;
  otherDestination?: string;
  itemId?: string;
  type?: string;
  kind?: string;
  isClosed?: boolean;
  deliveredQty?: number;
  pendingReturnQty?: number;
  returnedQty?: number;
  availableQty?: number;
  // Fields for My Requests to Return
  return_id?: string;
  return_date?: string;
  total_items?: number;
  status?:
    | 'Pending'
    | 'Approved'
    | 'Rejected'
    | 'Completed'
    | 'Receiving'
    | 'Partially Returned';
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
  pickedItemState?: string;
  dateRange?: [string, string];
}

export interface SparePartReturnItemSearch {
  searchValue?: string;
  advanceSearch?: SparePartReturnAdvanceSearch;
}

/** Status for My Requests to Return */
export type ReturnStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Receiving'
  | 'Partially Returned';

/** One row in "My Requests to Return" table */
export interface MyRequestToReturnItem {
  id: number;
  return_id: string;
  return_date: string;
  manager_decide_date?: string;
  total_items: number;
  status: ReturnStatus;
  remarks?: string;
}

/** Status options for My Requests to Return filter */
export const MY_REQUESTS_TO_RETURN_STATUS_OPTIONS = [
  { value: 'Status', label: 'Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Partially Returned', label: 'Partially Returned' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Completed', label: 'Completed' },
] as const;

/** One line item in the Details Request drawer table */
export interface RequestDetailLineItem {
  no: number;
  return_item_id?: number;
  imageId?: string;
  image?: string;
  product_id: string;
  request_id: string;
  item_condition?: string;
  item_name: string;
  uom?: string;
  quantity_to_return: number;
  used_quantity: number;
  total: number;
  forLine?: string;
  requestOtherDestination?: boolean;
  otherDestination?: string;
  // Warehouse receipt fields (present when state = COMPLETED)
  received_qty?: number;
  good_qty?: number;
  damaged_qty?: number;
  remark?: string;
  images?: string[]; // file IDs from FILE microservice
}

export interface RequestDetailActivityItem {
  itemId: string;
  itemName: string;
  qty_confirm: number;
  from_request?: number;
  uom: string;
  image?: string[];
  business_unit?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  requestOtherDestination?: boolean;
  otherDestination?: string;
  damaged_qty?: number;
  good_qty?: number;
  damage_message?: string | null;
  remark?: string;
  forLine?: string;
}

/** One activity in Recent Activities timeline */
export interface RequestDetailActivity {
  label: string;
  description: string;
  date?: string;
  dot?: string;
  messages?: string;
  items?: RequestDetailActivityItem[] | null;
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

/** Filter options for MySparePartList (radio: All / MRO-W / MRO-S / MRO-G) */
export const SPARE_PART_RETURN_RADIO_OPTIONS = [
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

export const SPARE_PART_PICKED_ITEM_STATE_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ALL', label: 'All' },
] as const;

/**
 * Maps nested API response (SparePartPickedRequest[])
 * to flattened table rows (SparePartReturnListItem[]).
 * Field names are kept aligned with existing table columns.
 */
const formatDate = (dateStr: string) => formatSpfDateTime(dateStr);

export const mapToFlattenedRowsMySparePartList = (
  items: SparePartPickedRequest[]
): SparePartReturnListItem[] => {
  return items.flatMap((request) =>
    request.shipping.flatMap((shipment) =>
      shipment.lines.map((line) => {
        const pendingReturnQty = line.pendingReturnQty ?? 0;
        const returnedQty = line.returnedQty ?? 0;
        const remainingQty = line.remainingQty ?? Math.max(0, line.deliveredQty - returnedQty);

        return {
          // unique row key
          id: `${request.requestId}-${shipment.fulfillmentNo}-${line.fulfillmentLineId}`,
          // mapped to old field names to match existing table columns
          part_number:              line.itemId,
          spare_part_name:          line.partName,
          request_id:               request.requestNo,
          quantity:                 line.requestedQty,
          UoM:                      line.uom,
          receiving_from_warehouseName : shipment.warehouseName,
          receiving_from_warehouse:   line.toWarehouseCode,
          forLine:                    line.forLine,
          toWarehouseCode:            line.toWarehouseCode,
          toWarehouseName:            line.toWarehouseName,
          businessUnit:             line.businessUnit,
          requestOtherDestination:   Boolean(line.requestOtherDestination || line.otherDestination?.trim()),
          otherDestination:          line.otherDestination?.trim() || undefined,
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
          isClosed:                 line.isClosed,
          warehouseCode:            shipment.warehouseCode,
          warehouseName:            shipment.warehouseName,
          pickupLocation:           shipment.pickupLocation,
          itemId:                   line.itemId,
          imageId:                   line.imageId,
          item_condition:           line.item_condition ?? line.itemCondition,
          itemCondition:            line.itemCondition ?? line.item_condition,
          deliveredQty:             line.deliveredQty,
          category:                 typeof line.category === 'string' ? line.category : line.category?.category_name || '-',
          pendingReturnQty,
          returnedQty,
          remainingQty,
          availableQty:             Math.max(0, remainingQty - pendingReturnQty),
        };
      })
    )
  );
};

export const mapToMyRequestToReturn = (
  item: SparePartReturnBatchResponseItem
): MyRequestToReturnItem => {
  const s = (item.returnStatus || '').toString().trim().toUpperCase();
  let status: MyRequestToReturnItem['status'] = 'Pending';
  
  if (s === 'APPROVED') status = 'Approved';
  else if (s === 'REJECTED') status = 'Rejected';
  else if (s === 'COMPLETE' || s === 'COMPLETED') status = 'Completed';
  else if (s === 'RECEIVING') status = 'Receiving';
  else if (s === 'PARTIAL_RETURN') status = 'Partially Returned';

  return {
    id: item.returnId,
    return_id: item.returnNo ?? `RET-${item.returnId}`,
    return_date: formatDate(item.returnDate ?? ''),
    manager_decide_date: formatDate(item.approvedDate ?? item.rejectedDate ?? ''),
    total_items: item.totalItems ?? 0,
    status,
    remarks: item.remark ?? '',
  };
};
