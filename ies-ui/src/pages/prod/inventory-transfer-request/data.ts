// export type TransferRequestListItem = {
//     id: number;
//     code: String,
// }

import { SortOrder } from 'antd/es/table/interface';
import moment, { Moment } from 'moment';

// export type TransferRequestSearchParams = {
//     keyword?: string,
//     status?: string,
// }

// export type TransferRequestItem = {
//     id?: number;
// }

// export type TransferRequestSavePayload = {
//     id?: number;
// }

// export type TransferRequestDetail = {
//     id: number;
// }

export interface TransferRequestSearch {
  searchValue?: string;
  date?: moment.Moment;
  sort?: Record<string, SortOrder>;
  items?: TransferRequestItem[];
}

export interface TransferRequest {
  transfer_id: string;
  id: string;
  key: string;
  item: TransferRequestItem[];
  from_warehouse: Warehouse[];
  to_warehouse: Warehouse[];
  transfer_type: string;
  status: string;
  createdBy?: string;
  createdDate?: moment.Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: moment.Moment;
  remark: string;
  posting_date: moment.Moment;
  taxDate: moment.Moment;
  due_date: moment.Moment;
  business_unit: string;
  line: string;
  shift: string;
  activities: ActivitiesItem[];
  state: string;
  sapDocNo: string;
  sapDocEntry?: number;
}

export interface TransferRequestItem {
  childItem: any;
  item: string;
  quantity: string;
  remark: string;
  id: number;
  itemId: number;
  item_code: string;
  item_name: string;
  key: string;
  uom: string;
  received: string;
  itemReceive: number;
  is_receive: string;
  transfer_request: string;
  supplier: string;
  oldtotal: string;
}
export type TransferRequestAdvanceParams = {
  searchValue?: string;
  business_unit: string;
  state: string;
  count?: number;
  transfer_type: string;
  postingDate?: string | null;
  docDueDate?:string | null;
};

export interface TransferRequestCreate {
  items: TransferRequestItem[];
  transfer_type: string;
  business_unit: string;
  key: string;
  item_count: number;
  activities: ActivitiesItem[];
}

export interface SAPTransferRequest {
  postingDate?: string;
  docDueDate?: string;
  taxDate?: string;
  vendorCode: string;
  vendorName: string;
  // productionOfficer: string;
  fromWarehouse: string;
  toWarehouse: string;
  apiReferenceNo: string;
  comments: string;
  transferRequestDetails: SAPTransferRequestDetail[];
  statusChange: string;
  state: string;
  activities_name: string;
  action: string;
  transfer_request: string;
  id: string
}

export interface SAPTransferRequestDetail {
  itemCode: string;
  itemName: string;
  quantity: string;
  remark: string;
  fromWarehouse: string;
  toWarehouse: string;
}

export interface TransferRequestStatusChange {
  id?: string;
  statusChange: string;
  remark: string | null;
  state: string;
}

export interface Provided {
  item: ProvidedItem[];
  transfer_request_id: string,
  status: string,
  transfer_request?: string,
  activities_name?: string,
  action?: string,
  remark?: string
}

export interface ProvidedList {
  id: number;
  transfer_request_id: number,
  provided: string,
  status: string,
  createdBy: string,
  createdDate: string,
  lastModifiedBy: string,
  lastModifiedDate: string
}

export interface ProvidedItem {
  item_name: string;
  item_code: string;
  uom: string;
  quantity: string;
  remark: string;
  itemReceive: string;
  is_receive: string;
  total: string;
  supplier: string;
  received: string
}
export interface ActivitiesItem {
  transfer_request?: string;
  activities_name: string;
  action: string;
  remark?: string;
  actionBy?: string;
  actionDate?: Moment;
  id?: number;
}

export interface ItemSearch {
  searchValue?: string;
  groupIds?: number[];
}

export interface Item {
  id: number;
  key: string;
  itemCode: string;
  itemName: string;
  inventoryUoM: string;
  tendency: string;
  item_group_id: number;
  item_group: ItemGroup[];
  childItem: ChildItem[];
  active: string;
}

export interface ChildItem {
  id: number;
  father: number;
  child_num: number;
  code: string;
  quantity: string;
  active: string;
}

export interface Supplier {
  card_code: string;
  card_name: string;
  tendency: string;
  active: string;
}

export interface ItemGroup {
  id: number;
  itemGroupName: string;
}

export interface Warehouse {
  id: number;
  whsCode: string;
  whsName: string;
  building?: string;
  tendency: string;
  active: string;
}

export interface WarehouseSearch {
  searchValue?: string;
}

export type WarehouseAdvanceParams = {
  searchValue?: string;
  tendency: string;
};

export interface GetCount {
  status?: string;
}

export interface GetToExcelParams {
  shift: string;
  line: string;
  startDate: string;
  endDate: string;
}

export interface BomItem {
  product_code: number;
  product_name: string;
  tendency: string;
  active: string;
}

export interface BomItemSearch {
  tendency?: string;
}

export interface ChildFather {
  father: string;
}

export interface SupplierSearch {
  searchValue?: string;
  tendency?: string;
}

export interface AddSupplierParams {
  remark?: string;
  supplier: string;
  item_code: string;
  transfer_request: string;
}

export interface TotalProvideParams {
  transfer_request_id?: string;
  item_code: string;
}

export interface closeParams {
  docEntry: number,
  id: string,
  statusChange: string,
  state: string,
  remark: string,
  transfer_request?: string;
  activities_name: string;
  action: string;
  actionBy?: string;
  actionDate?: Moment;
}

export interface ProductionLine {
  id?: number,
  prdcode: string,
  prdname: string,
  active?:number
}