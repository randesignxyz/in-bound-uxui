import moment, { Moment } from "moment";

export type SavePayLoad = {}
export type SearchParams = {
    keyword?: string,
    searchValue?: string,
    status?: string,
    postedStatus?: string,
    advanceSearch?: AssetRequestAdvanceSearchParams
}
export type SearchLookupParams = {
  searchValue?: string
  type: 'INVENTORY_ADJ_REQUEST_TYPE',
}
export type AssetRequestAdvanceSearchParams = {
  status: 'ALL' | 'DRAFT' | 'PENDING'  | 'APPROVED' | 'REJECTED' | 'CANCELED'; 
  deptIds?: number[];
  groupIds?: number[];
};
export interface AdjRequestListItem {
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
  requestType?: string
  postedDate?: Moment
  sapDocEntry?: string
  sapDocNo?: string
  integratedStatus?:string
  warehouseFrom?: string
  warehouseTo?: string
} 
export interface AdjRequestItem {
  id?: number;
  key: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  budgetCode?: string;
  remarks?: string;
  requestType?:string;

}
export interface AdjRequest {
  id?: number;
  reason: string;
  remarks?: string;
  // warehouseTo: string;
  items: AdjRequestItem[];
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
export interface AdjRequestResponse {
  formNo: string;
}
export interface AdjRequestItemDetailResponse {
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
  requestType?: string;
}
export interface AdjRequestDetailResponse {
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
  items: AdjRequestItemDetailResponse[];
  lastModifiedDate?: Moment;
  lastModifiedBy?: string;
  fileIds?: string[];
  postedDate?: Moment;
  sapDocEntry?: number;
  sapDocNo?: string;
  warehouseTo?:string;
  warehouseFrom?:string;
  integratedStatus?:string;
}
export interface EmpWarehouseList {
  id: number;
  empId: number;
  empNo: string;
  warehouseCode: string;
}

export interface LookupData {
  id: number;
  code: string;
  name: string
}
export interface FieldsValidation {
  field: string;
  msg: string;
}

  

