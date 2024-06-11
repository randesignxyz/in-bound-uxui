import { Moment } from "moment";
import { RequisitionItem, RequisitionService } from "./data";

export type RequisitionAdvanceSearchParams = {
  status: 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  // acquiredDate?: Moment;
  // requestedDate?: Moment;
  subStatus?: string;
  searchValue?: string;
  service?: boolean;
  integratedStatus?: string;
  deptIds?: number[];
};

export interface SaveRequisitionParams {
  id?: number;
  requestedBy: number;
  remarks?: string;
}

export type ItemAdvanceSearchParams = {
  groupIds?: number[]
  itemType?: 'ALL' | 'PRODUCT' | 'SERVICE';
}

export interface RequisitionBudgetCodeReviewParams {
  id: number;
  items?: RequisitionItem[],
  services?: RequisitionService[]
}

export interface RequisitionProReviewparams {
  id: number;
  assignedTo: number;
}