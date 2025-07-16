import { Moment } from "moment";

export type DF360InfoAdvanceSearchParams = {
  status: 'ALL' | 'PENDING' | 'SUBMITTED';
  subStatus?: string;
  subStatus2?: string;
  searchValue?: string;
  processStatus?: string;
  postedStatus?: string;
};
export interface DF360Form {
  id: number;
  empCode: string;  
  empName: string;  
  empNameKh: string;
  jobTitle: string;
  jobLevel: string;
  buName: string;
  deptName: string;
  lastModifiedBy: string;
  lastModifiedDate: Moment;
  dueDate: Moment;
  formNo?: string;
  processInstId: string;
  status: string;
  
};
export interface AssessorFD{
  key: string;
  empId: number;
  empNo: string;
  empName: string;
};

export interface DF360Playload {
  empId: number;
  buId: number;  
  managers?: number[];
  peers?: number[];
  subordinates?: number[];
}