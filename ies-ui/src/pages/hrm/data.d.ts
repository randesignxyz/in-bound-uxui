import { LookupData } from "@/services/data";
import { LookupDataItem } from "@/services/shared/data";
import { Moment } from "moment";
import { LookUpDataDTO } from "../fleet/lookupData/data";

export interface EmployeeListItem {
  id: number;
  employeeId: number;
  empNo: number;
  employeeCode: string;
  employeeLocalName: string;
  firstName: string;
  lastName: string;
  status: string;
  sapId: string;
  jobTitle?: string;
  job_id?: number;
  reportTo?: string;
  department?: string;
  department_id?: number;
  bu?: string;
  bu_id?: number;
  userId?: string;
}

export type EmployeeAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  integratedStatus?: string;
  keyword?: string;
  advanceSearch?: {
    buIds?: number[];
    depIds?: number[];
    integratedStatus?: string;
    status?: string;
  };
};


export type BU = {
  id: number;
  name: string;
};

export type Department = {
  id: number;
  name: string;
};

export type SubDepartment = {
  id: number;
  name: string;
  departmentId: number;
};

export type StaffRequisitionAdvanceSearchParams = {
  status?: "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";
  integratedStatus?: string;
  keyword?: string;
  advanceSearch?: {
    buIds?: number[];
    depIds?: number[];
    integratedStatus?: string;
    status?: string;
  };
};

export type ProbationAdvanceSearchParams = {
  status?: "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";
  integratedStatus?: string;
  keyword?: string;
  advanceSearch?: {
    buIds?: number[];
    depIds?: number[];
    integratedStatus?: string;
    status?: string;
  };
};

export type ProbationEvaluationData = {
  requestorId: string;
  requestorBuId: number;
  jobId: number;
  formTypeId: string;
  refId: number;
  empId: number;
  attachedFiles?: string[];
  remarks?: string;
  preparationUserId?: number;
  hoPreparationUserId?: number;
}

export type StaffRequisitionRequestCancel = {
  processInstanceId: string;
  remarks: string;
  fileIds?: string[];
}

export type RequisitionData = {
  requestorId: string;
  requestorBuId: number;
  jobId: number;
  buId: number;
  departmentId: number;
  subDepartmentId?: number;
  section?: string;
  team?: string;
  directReportTo: number;
  workingShiftId: string;
  segmentId: number;
  otherSegment?: string;
  contractTypeId: number;
  contractDates?: Moment[];
  expectedJoinDate: Moment;
  requisitionTypeId: number;
  headcount: number;
  workplaceId?: number;
  replacedEmployeeId?: number;
  replacedEmployeeName?: string;
  hiredReasonFor?: string;
  suggestedSourcing?: string;
  attachedFiles?: string[];
}

export type StaffRequisitionRequest = {
  id: number;
  instanceId: string | undefined;
  requester: string;
  requestedDate: Moment;
  formNo: string;
  positionHired: LookupDataItem;
  bu: LookupDataItem;
  department: LookupDataItem;
  subDepartment?: LookupDataItem;
  section: string;
  team: string;
  directReportTo: LookupDataItem;
  workingShift: LookupDataItem;
  segment: LookupDataItem;
  otherSegment?: string;
  contractType: LookupDataItem;
  contractDates?: Moment[];
  expectedJoinDate: Moment;
  requisitionType: LookupDataItem;
  replacedEmp?: LookupDataItem;
  hiredReason?: string;
  headcount?: number;
  location?: LookupDataItem;
  suggestedSourcing: string;
  attachedFiles?: string[];
  proposedBudget?: string;
  remarks?: string;
  status: string
}

export type JobTitle = {
  id: number
  jobTitle: string
  description?: string
  empSegment?: LookupDataItem
}

export type EmployeeJobDetail = {
  id: number;
  empNo: string;
  empName: string;
  localName: string;
  jobTitle: string;
  bu: string;
  function: string;
  subFunction: string;
  reportTo: string;
};

export type RequestItem = {
  id: number
  itemName: string
  itemCategoryId: number
  itemDescription: string
  optionGroup?: string
  selector?: string
}

export type EmployeeDataRs = {
  id: number;
  buId?: number;
  buName?: string;
  empNo: string;
  firstName: string;
  lastName: string;
  internalName: string;
  department: string;
  subDepartment?: string;
  hod: string;
  hodEnpNo?: string;
  jobTitle: string;
  hodEmpId?: number;
  hodUserId?: string;
  jobTitle: string;
  reportTo?: string;
}
