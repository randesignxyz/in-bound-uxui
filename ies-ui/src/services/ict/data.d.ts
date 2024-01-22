import { Moment } from 'moment';

export interface Incident {
  id?: number;
  
  symptom: string;
  description: string;

  sourceId: number?;

  urgencyId: number?;
  impactId: number?;
  priorityId: number?;

  classificationId: number?;
  categoryId: number?;
  workgroupId: number?;

  onHoldReason: string?;
  closeReason: string?;

  assignedTo: string?;

  formNo: string?;
  status: string?;

  processInstId: string?;
  requestedDate: Moment?;
  requestedBy: string?;
  submittedBy: string?;
  parentId: number?;

  createdBy: string?;
  createdDate: Moment?;
  lastModifiedBy: string?;
  lastModifiedDate: Moment?;

  companyId: number?;
  locationId: number?;
  contactNo: string?;
  closureId: number?;

  fileIds: string[];
}

export interface IncidentListItem {
  id: number;
  formNo?: string;
  symptom: string;
  description?: string;
  instanceId?: string;
  requestedBy?: string;
  submittedBy?: string;
  requestedDate: Moment;

  status: string?;

  processStatus?: string;
  urgencyId: number?;
  impactId: number?;
  priorityId: number?;
  classificationId: number?;
  categoryId: number?;

  workgroupId: number?;
  assignedTo: string?;

  sourceId: number?;

  lastModifiedDate: Moment?;
  createdDate: Moment;

  companyId: number?;
  locationId: number?;
  contactNo: string?;
  closureId: number?;

  responseSlaColor: string?;
  resolutionSlaColor: string?;

  resolvedDate?: Moment; 
}

export interface IncidentDetail {
  id: number;
}

export interface IncidentDetailResponse {
  id: number;
  
  urgency: string?;
  impact: string?;
  priority: string?;

  classificationId: number?;
  classification: string?;
  category: string?;
  categoryId: number?;

  responseSlaDeadline: Moment?;
  responseSlaActual: number;
  responseSlaViolation: string;

  resolutionSlaDeadline: Moment?;
  resolutionSlaActual: number;
  resolutionSlaViolation: string;

  workgroup: string?;
  assignedTo: string?;

  workgroupId: number?;

  source: string?;

  requestedDate: Moment;
  requestedBy: string;

  symptom: string;
  description?: string;
  onHoldReason: string?;
  closeReason: string?;

  status: string?;
  processStatus: string;
  
  createdDate: Moment;
  createdBy: string;
  lastModifiedDate?: Moment;
  lastModifiedBy?: string;
  fileIds?: string[];

  firstResponseTime?: number;
  everyResponseTime?: number;
  resolutionTime?: number;

  company: string?;
  location: string?;
  contactNo: string?;
  closureCode: string?;

}

export interface IncidentResponse {
  formNo: string;
}

export interface IncidentEmployee {
  id: number;
  firstName: string?;
  lastName: string?;
  empNo: string?;
}

export interface AssignedTo {
  id: number;
  firstName: string?;
  lastName: string?;
  empNo: string?;
}

export interface RequestedBy {
  id: number;
  firstName: string?;
  lastName: string?;
  empNo: string?;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number?;
}

export interface Classification {
  id: number;
  name: string;
  description: string?;
}

export interface Priority {
  id: number;
  name: string;
  description: string?;
}

export interface Urgency {
  id: number;
  name: string;
  description: string?;
}

export interface Impact {
  id: number;
  name: string;
  description: string?;
}

export interface Workgroup {
  id: number;
  name: string;
  code: string;
  description: string?;
}

export interface OnHoldReason {
  id: number;
  reason: string;
}

export interface CloseReason {
  id: number;
  reason: string;
}


export interface IncidentTicketSLALess{
  id: number?;
  priority: string?;
  actual: string?;
  isViolated: boolean?;
}

export interface PriorityMatrix{
  id: number;
  urgencyId: number;
  impactId: number;
  priorityId: number;
}

export interface SlaMatrix{
  id: number;
  priorityId: number;
  classificationId: number?;
  categoryId: number?;
  workgroupId: number?;
  sourceId: number?;
  slaId: number;
  firstResponseTime: number;
  everyResponseTime: number;
  resolutionTime: number;
}


export interface SlaMatrixIncidents{
  incidentId: number;
  responseSlaDeadline: Moment?;
  responseSlaActual: number;
  responseSlaViolation: string;

  resolutionSlaDeadline: Moment?;
  resolutionSlaActual: number;
  resolutionSlaViolation: string;
}

export interface IncidentPayloadParam {
  // id?: number;
  
  symptom: string?;
  description: string?;

  sourceId: number?;

  urgencyId: number?;
  impactId: number?;
  priorityId: number?;

  classificationId: number?;
  categoryId: number?;
  workgroupId: number?;

  // onHoldReason: string?;
  // closeReason: string?;

  // assignedTo: string?;

  // formNo: string?;
  // status: string?;

  // processInstId: string?;
  requestedDate: Moment?;
  requestedBy: string?;
  // submittedBy: string?;
  // parentId: number?;

  // createdBy: string?;
  // createdDate: Moment?;
  // lastModifiedBy: string?;
  // lastModifiedDate: Moment?;

  // fileIds: string[];
}

export interface WorkgorupMatrix{
  id: number,
  workgroupId: number,
  username: string,
  default: number,
}

export interface WorkgroupCategory{
  id: number,
  workgroupId: number,
  categoryId: number
}

export interface IncidentLess {
  id: number;
  formNo?: string;
  symptom: string;
  description?: string;
  instanceId?: string;
  requestedBy?: string;
  submittedBy?: string;
  requestedDate: Moment;

  status: string?;

  processStatus?: string;
  urgencyId: number?;
  impactId: number?;
  priorityId: number?;
  classificationId: number?;
  categoryId: number?;

  workgroupId: number?;
  assignedTo: string?;

  sourceId: number?;

  lastModifiedDate: Moment?;
  createdDate: Moment;

  companyId: number?;
  locationId: number?;
  contactNo: string?;
  closureId: number?;

  responseSlaColor: string?;
  resolutionSlaColor: string?;
}
