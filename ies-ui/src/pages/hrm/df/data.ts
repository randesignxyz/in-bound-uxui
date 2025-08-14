import exp from "constants";
import { Moment } from "moment";

export type DF360InfoAdvanceSearchParams = {
  status: 'ALL' | 'PENDING' | 'SUBMITTED';
  subStatus?: string;
  searchValue?: string;
};
export interface DF360Emp {
  id: number;
  empNo: string;  
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
export type DfEmpEvaluation = {
    id: number   
    key: string
    assessment?: string
    target?: string
    rating5?: number
    rating4?: number
    rating3?: number
    rating2?: number
    rating1?: number
    remark?: string
    seqNo?: number
}
export interface DF360EmpDetailRs {
  id: number;
  formNo?: string;
  empId:number;
  empNo: string;  
  empName: string;  
  empNameKh: string;
  hiredDate: Moment;
  buId: number;
  buName: string;
  deptId: number;
  deptName: string;
  jobId: number;
  jobTitle: string;
  jobLevelId: number;
  jobLevel: string;
  status: string;
  processInstId?: string;
  processStatus?: string;
  workflowStatus?: string;
  createdBy: string;
  createdDate: Moment;
  lastModifiedBy: string;
  lastModifiedDate: Moment;
  dueDate?: Moment;
  // statementEvaluations:DfEmpEvaluationRs[];
  // comments?: DfCommentRs[];
  currentAssessor: DfEmpAssessorRs;
  assessors: DfEmpAssessorRs[];
};
export interface DfEmpAssessorRs{
  id: number;
  dfEmpId: number;
  empId: number;
  empNo: string;
  empName: string;
  userId: string;
  type: string;
  status: string;
  statementEvaluations:DfEmpEvaluationRs[];
  comments?: DfCommentRs[];
  currentAccess: boolean;
  summary?: DfEmpSummaryRs;
}
export interface DfEmpSummaryRs{
  statementEvaluations?: DfEmpEvaluationDetailReport[];
  sumEvaluations?: DfEmpEvaluationSummaryReport[];
  comments?: DfCommentRs[];
}
export interface DfEmpEvaluationSummaryReport{
  id: number;
  dfEmpId: number;
  title: string
  title1: string
  self: number;
  manger: number;
  peer: number;
  subordinate: number;
  avgSelf: number;
  avgManager: number;
  avgPeer: number;
  avgSubordinate: number;
  overall: number;
}
export interface DfEmpEvaluationDetailReport{
  id: number;
  dfEmpId: number;
  title: string
  title1: string
  description: string
  description1: string
  self: number;
  manger: number;
  peer: number;
  subordinate: number;
  avgSelf: number;
  avgManager: number;
  avgPeer: number;
  avgSubordinate: number;
  overall: number;
}

export interface DfEmpEvaluationRs{ 
  id: number;
  key: string;
  dfEmpAssessorId: number;
  dfStatementId: number;
  description: string;
  description1: string;
  dfStatementGroupId: number;
  title: string;
  title1: String
  rating1?: number;
  rating2?: number;
  rating3?: number;
  rating4?: number;
  rating5?: number;
  seqNo: number;
}

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
export interface DF360EmpListItem {
  id: number;
  empNo: string;  
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
  assessors: DfEmpAssessorRs[];
};

export interface DF360UpdatePlayload {
  id: number;
  dfEmpAssessorId: number;
  statements?: DfStatementRs[];
  comments?: DfCommentRs[];
}
export interface DfStatementRs{
  id: number;
  dfEmpAssessorId: number;
  dfStatementId: number;
  dfStatementGroupId: number;
  rating1?: number;
  rating2?: number;
  rating3?: number;
  rating4?: number;
  rating5?: number;
  seqNo: number;
}
export interface DfCommentRs{
  id: number;
  dfEmpAssessorId: number;
  comment: string;
  seqNo: number;
  type: string;
}

export type DfComment = {
    id: number
    key:string
    comment: string
    seqNo?: number
}


export type AppraisalMapping = {
    id: number
    empNo: string
    empName: string
    appraiser1Id?: number
    appraiser2Id?: number
}

export type EmployeeInfResult = {
    empId: number
    empNo: string
    empName: string
    internalName?: string
    empFirstName: string
    empLastName: string
    buId: number
    buName?: string
    departmentId: number
    departmentName: String
    subDepartmentId?: number
    subDepartmentName?: string
    jobId: number
    jobTitle: string
    reportToId?: number
    reportTo?: string
    hodId?: number
    hodName?: string
    jobLevelId?: number
    jobLevelName?: string
    jobLevelCode?: string
}
export interface DfAssessorList{
  id: number;
  empNo: string;
  empName: string;
  internalName: string;
  firstName: string;
  lastName: string;
  jobLevelCode: string;
  
}
export interface DfInstrunctionItemList{
  id: number;
  description: string;
 description1: string;
  
}