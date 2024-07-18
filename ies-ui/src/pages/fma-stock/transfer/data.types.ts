import moment, { Moment } from "moment";

export type SavePayLoad = {}
export type SearchParams = {
    keyword?: string,
    searchValue?: string,
    status?: string,
    postedStatus?: string,
    advanceSearch?: TransferRequestAdvanceSearchParams
}
export type TransferRequestAdvanceSearchParams = {
  status: 'ALL' | 'DRAFT' | 'PENDING'  | 'APPROVED' | 'REJECTED' | 'CANCELED'; 
  deptIds?: number[];
  groupIds?: number[];
};
export interface TransferRequestListItem {
  id: number
  formNo?: string
  instanceId?:string  
  requestedDate: Moment
  reason: string
  remarks?: string
  requestedBy?: string
  createdDate?: Moment
  workflowStatus?: string
  status?: string
  returnDate?: Moment
  returnType?: string
  postedDate?: Moment
  sapDocEntry?: string
  sapDocNo?: string
  integratedStatus?:string
  warehouseFrom?: string
  warehouseTo?: string
} 
// export interface StockRequestLess {
//   id: number;
//   formNo?: String;
//   acquisitionDate: Moment;
//   budgetCodeRequired: boolean;
//   service: string;
//   totalAmount: number;
//   reason: string;
//   sapDocNo?: string;
//   remarks?: string;
//   amount?: number;
//   postedDate?: Moment;
//   sapStatus?: string;
//   instanceId?: string;
//   requestedBy?: string;
//   submittedBy?: string;
//   createdDate?: Moment;
// } 
// export type StockItem = {
//     id: number
//     code: string
//     abr: string
//     name: string
// }
export interface TransferRequestItem {
  id?: number;
  key: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  remarks?: string;
  returnType?:string;
  returnDate?: Moment;

}
export interface TransferRequest {
  id?: number;
  reason: string;
  remarks?: string;
  warehouseTo: string;
  items: TransferRequestItem[];
  fileIds: string[];
}
  

export interface ItemListItem {
  id: number;
  itemCode: string;
  itemName: string;
  defaultUoM?: string;  
  itemGroup: {
    id: number;
    itemGroupName: string;
  };
}
export interface ItemGroupListItem {
  id: number;
  itemGroupName: string;
}

export interface UoMItemList {
  id: number;
  itemCode: string;
  uom: string;
}

export interface ItemDetail extends ItemListItem {
  uomList: string[];
}

export interface ItemListItem {
  id: number;
  itemCode: string;
  itemName: string;
  buyUoM?: string;
  lastPurchasePrice?: number;
  lastPurchaseCurr?: string;
  itemGroup: {
    id: number;
    itemGroupName: string;
  };
}
/*--------- Response ----------------------*/
export interface TransferRequestResponse {
  formNo: string;
}
export interface TransferRequestItemDetailResponse {
  id: number;
  key: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  remarks?: string;
  stockRemarks?: string;
  seqNo: number;
  returnDate?: Moment;
  returnType?: string;
}
export interface TransferRequestDetailResponse {
  id: number;  
  instanceId: string;
  requestedDate: Moment;
  formNo?: string;
  reason: string;
  remarks?: string;
  stockRemarks?: string;
  processStatus: string;
  deptId: number;
  groupId: number;
  groupName: string;
  createdDate: Moment;
  createdBy: string;
  items: TransferRequestItemDetailResponse[];
  lastModifiedDate?: Moment;
  lastModifiedBy?: string;
  fileIds?: string[];
  warehouseTo?:string;
  warehouseFrom?:string;
}
export interface EmpWarehouseList {
  id: number;
  empId: number;
  empNo: string;
  warehouseCode: string;
}
  

