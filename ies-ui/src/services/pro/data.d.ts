import { Moment } from 'moment';

export interface RequisitionListItem {
  id: number;
  formNo?: string;
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
  processStatus?: string;
  createdDate?: Moment;
}

export interface RequisitionDetail {
  id: number;
}

export interface ItemListItem {
  id: number;
  itemCode: string;
  itemName: string;
  buyUoM?: string;
  lastPurchasePrice?: number;
  lastPurchaseCurr?: string;
  itemGroup: {
    itemGroupName: string;
  };
}

export interface ItemDetail extends ItemListItem {
  uomList: string[];
}

export interface ItemGroupListItem {
  id: number;
  itemGroupName: string;
}

export interface Requistion {
  id?: number;
  acquisitionDate: Moment;
  budgetCodeRequired: boolean;
  reason: string;
  remarks?: string;
  totalAmount: Number;
  items: RequisitionItem[];
  services: RequisitionService[];
  service: boolean;
  fileIds: string[];
}

export interface RequisitionItem {
  id?: number;
  key: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  description?: string;
  qty: number;
  unitPrice: number;
  uom: string;
  amount: number;
  budgetCode?: string;
  remarks?: string;
  seqNo?: number;
}

export interface RequisitionService {
  id?: number;
  key: string;
  serviceName: string;
  description?: string;
  amount: number;
  budgetCode?: string;
  remarks?: string;
  seqNo?: number;
}

export interface RequisitionResponse {
  formNo: string;
}

export interface RequisitionDetailResponse {
  id: number;
  acquisitionDate: Moment;
  formNo?: string;
  budgetCodeRequired: boolean;
  reason: string;
  service: boolan;
  remarks?: string;
  processStatus: string;
  deptId: number;
  createdDate: Moment;
  createdBy: string;
  totalAmount: number;
  sapStatus?: string;
  items: RequisitionItemDetailResponse[];
  services: RequisitionServiceItemDetailResponse[];
  lastModifiedDate?: Moment;
  lastModifiedBy?: string;
  fileIds?: string[];
}


export interface RequisitionItemDetailResponse {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  description?: string;
  budgetCode?: string;
  qty: number;
  unitPrice: number;
  amount: number;
  uom: string;
  remarks?: string;
  seqNo?: number;
}

export interface RequisitionServiceItemDetailResponse {
  id: number;
  serviceName: string;
  description?: string;
  budgetCode?: string;
  amount: number;
  remarks?: string;
  seqNo?: number;
}

export interface BudgetCodeListItem {
  code: string;
  name: string;
}

export interface ProEmployee {
  id: number;
  empNo: string;
  firstName: string;
  lastName: string;
}

export interface RequisitionLess {
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

export interface ProDepartment {
  id: number;
  name: string;
  integratedId: number;
  integratedName: string;
}

export interface RequisitionItemList {
  service: boolean;
  items: RequisitionItemDetailResponse[];
  services: RequisitionServiceItemDetailResponse[];
}