import { Moment } from "moment";
import { IncidentListItem } from "./data";

export type IncidentAdvanceSearchParams = {
    status: 'ALL' | 'DRAFT' | 'PENDING'  | 'APPROVED' | 'REJECTED' | 'CANCELED';
    // acquiredDate?: Moment;
    // requestedDate?: Moment;
    // service?: boolean;
   
  };
  
export interface SaveIncidentParams {
  id?: number;
  requestedBy?: string?;
  remarks?: string;
}

export interface TicketIncidentReviewParams {
  id: number;
  symptom: string;
  description?: string;
  onHoldReason: string?;
  closeReason: string?;

  instanceId?: string;
  processInstId: string?;

  urgencyId: number?;
  impactId: number?;
  priorityId: number?;
  classificationId: number?;
  categoryId: number?;

  workgroupId: number?;
  assignedTo: string?;

  
  sourceId: number?;
  closureId: number?;

  status: string;
  processStatus?: string?;

  company: string?;
  location: string?;
  contactNo: string?;
}


export interface RequstorConfirmParams {
  id?: number;
  action: string;
  comment: string?;
}

export interface IgniteWorkFlowParam<IncidentPayloadParam> {
  processDef: string, 
  formKey: string, 
  buId: number, 
  requestor: string;
  payload: IncidentPayloadParam
  comment?: string,
}