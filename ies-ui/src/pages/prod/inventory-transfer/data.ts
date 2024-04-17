import moment from "moment";
// import { SortOrder } from "antd/lib/table/interface";

import { SortOrder } from 'antd/es/table/interface';

// export interface TestSearch{
//     searchValue?: string,
//     date?: moment.Moment,
//     sort?: Record<string, SortOrder>,
//     first_name?: string,
//     last_name?:string
// }

// export interface Testing{
//     id: string,
//     first_name: string,
//     last_name : string,
//     createdBy?: string,
//     createdDate?: moment.Moment,
//     lastModifiedBy?: string,
//     lastModifiedDate?: moment.Moment,
//     userType: String,
//     status: number
// }

// export type TestingAdvanceParams = {
//     searchValue?: string,
//     status?:string,
// };

// export interface TestingCreate{
//     first_name: string,
//     last_name:string
// }

// export interface TestingVoid{
//     id:string,
//     status?:number
// }

export interface TransferSearch {
  searchValue?: string;
  date?: moment.Moment;
  sort?: Record<string, SortOrder>;
  items?: string;
}

export interface Transfer {
  id: number;
  items: string;
  quantity: string;
  transfer_type: string;
  status: string;
  createdBy?: string;
  createdDate?: moment.Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: moment.Moment;
  received?: string;
  item: TransferItem[];
  from_warehouse: Warehouse[];
  to_warehouse: Warehouse[];
  business_unit: string;
  remark: string;
  posting_date: moment.Moment;
  due_date: moment.Moment;
  key: string;
  transfer_request: number;
  line: string;
  shift: string;
  activities: ActivitiesItem[];
  transfer_id: string;
  sapDocEntry?: number;
}

export interface ActivitiesItem {
  transfer_request?: string;
  activities_name: string;
  action: string;
  remark?: string;
  actionBy?: string;
  actionDate?: string;
  id?: number;
}

export interface TransferCreate {
  items: TransferItem[];
  transfer_type: string;
  business_unit?: string;
  key: string;
  status: string;
  transfer_request?: string;
  transfer_id: string;
  posting_date?: moment.Moment;
  due_date?: moment.Moment;
  from_warehouse: number;
  to_warehouse: number;
  line: string;
  shift: string;
}

export type TransferAdvanceParams = {
  searchValue?: string;
  transfer_type?: string;
  business_unit?: string;
  transfer_request?: string;
};

export interface Warehouse {
  id: number;
  whsCode: string;
  whsName: string;
  building?: string;
  tendency: string;
  active: string;
}

export interface TransferItem {
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
  transfer_request: number;
  total: string;
  oldtotal: string;
  supplier?: string;
}

export interface ReceivedItem {
  id: number;
  received: number;
}

export interface ReceiveStatusChange {
  transfer_request: string;
}

export interface GetReceive {
  transfer_request?: number;
  item_code: string;
}

export interface SAPCloseDoc {
  docEntry?: number;
  id?: number;
  items: TransferItem[];
  transfer_type: string;
  business_unit?: string;
  key: string;
  status: string;
  transfer_request?: string;
  transfer_id: string;
  posting_date?: moment.Moment;
  due_date?: moment.Moment;
  from_warehouse: number;
  to_warehouse: number;
  line: string;
  shift: string;
  statusChange: string;
  state: string;
}
