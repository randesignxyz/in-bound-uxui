import moment, { Moment } from "moment";

export type SavePayLoad = {}
export type SearchParams = {
    keyword?: string,
    searchValue?: string,
    status?: string,
    postedStatus?: string,
    advanceSearch?: StockRequestAdvanceSearchParams
}
export type StockRequestAdvanceSearchParams = {
  status: 'ALL' | 'DRAFT' | 'PENDING'  | 'APPROVED' | 'REJECTED' | 'CANCELED'; 
  deptIds?: number[];
  groupIds?: number[];
};
export interface StockRequestListItem {
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
} 
export interface StockRequestLess {
  id: number;
  formNo?: String;
  acquisitionDate: Moment;
  budgetCodeRequired: boolean;
  service: string;
  totalAmount: number;
  reason: string;
  sapDocNo?: string;
  remarks?: string;
  amount?: number;
  postedDate?: Moment;
  sapStatus?: string;
  instanceId?: string;
  requestedBy?: string;
  submittedBy?: string;
  createdDate?: Moment;
} 
export type StockItem = {
    id: number
    code: string
    abr: string
    name: string
}
export interface StockRequestItem {
  id?: number;
  key: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  budgetCode?: string;
  remarks?: string;
  returnType?:string;
  returnDate?: Moment;

}
export interface StockRequest {
  id?: number;
  reason: string;
  remarks?: string;
  items: StockRequestItem[];
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
export interface StockRequestResponse {
  formNo: string;
}
export interface StockRequestItemDetailResponse {
  id: number;
  key: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  budgetCode?: string;
  remarks?: string;
  stockRemarks?: string;
  seqNo: number;
  returnDate?: Moment;
  returnType?: string;
}
export interface StockRequestDetailResponse {
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
  warehouseFrom?: string;
  createdDate: Moment;
  createdBy: string;
  items: StockRequestItemDetailResponse[];
  lastModifiedDate?: Moment;
  lastModifiedBy?: string;
  fileIds?: string[];
}
export interface WarehouseGroup {
  id: string;
  code: string;
  name: string;
}

  

