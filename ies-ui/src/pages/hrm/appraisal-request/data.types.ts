import { LookupDataItem } from "@/services/data"
import { Moment } from "moment"
import { AppraisalEmp } from "../appraisal-submit/data.types"

export type AppraisalRequestListItem = {   
    id: number,
    processInstId: string,
    lastActionDate?: Moment,
    lastActionBy?: string,
    formNo: string,
    requestedDate: Moment,
    requestedBy: string,
    requestTypeId: number,
    requestTypeLabel: string,
    requestTypeDesc:string,
    submittedBy: string,
    status: string    
}
export type ApprovalAppraisalRequestItem= {
    id: number,
    appraisalEmpId: number,
    appraisalRequestId: number,
    empId: number,
    empNo: string,
    empName: string,
    internalName?: string,
    buName?: string,
    departmentName?: string,
    jobTitle?: string
    rating1?: number
    rating2?: number
    rating3?:number
    rating4?: number
    rating5?: number
    finalScore?: number
    status: string,
}

export type SearchParams = {
    keyword?: string,
    status?: string,
    processInstId?: string
}

export type RequestedItem = {
    checked: boolean;
    itemId: number;
    itemName: string;
    amount?: number;
    selector?: string;
    optionGroup?: string;
    remarks?: string;
}


export type SavePayLoad = {
    id?: number
    title:string
    requester: string
    requestTypeId: number
    requestorBuId: number
    uploadedFiles: string[]
    items: number[]
    remarks?: string
}

export type AppraisalRequestDetail = {
    id: number
    title?:string
    empName: string
    jobTitle: LookupDataItem
    segment: LookupDataItem
    bu: LookupDataItem
    department: LookupDataItem
    requisition: LookupDataItem
    subDepartment?: LookupDataItem
    session?: string
    team?: string
    directReportTo: LookupDataItem
    workingShift: LookupDataItem
    dayOffGroup: LookupDataItem
    startingDate: Moment
    contractType: LookupDataItem
    contractDateFrom?: Moment
    contractDateTo?: Moment
    items: AppraisalEmp[]
    members?: ReviewerMember[]
    requestType: AppraisalLookupData
    status: string
}


export const AppraisalRequestFormNames = {
    processDefKey: 'performance_review_request_process',
    start: 'performance_review_request_process',
    performance_review_hr_review: 'performance_review_hrm_review',
    performance_review_dmbo_mbo_approval: 'performance_review_dmbo_mbo_approval',
    performance_review_dmbo_mbo_review: 'performance_review_dmbo_mbo_review',
    performance_review_sm_hrm_consent: 'performance_review_sm_hrm_consent',
    performance_review_dmd_approval:'performance_review_dmd_approval',
    performance_review_dmd_review:'performance_review_dmd_review',
    performance_review_md_ed_approval:'performance_review_md_ed_approval'
}

export type RequestItem = {
    itemId: number
    itemName: string
    itemType?: string
    qty?: number,
    amount?: number,
    remarks?: string
}
export type SearchCriteria ={
    requestTypeId: number;
    searchValue?:string;
    buName?: string[];
    deptName?:string[];
}
export type EmpSubmissionParams = {
    id: number
    appraisalDimensionId: number
    rating1: number
    rating2?: number
    rating3?: number
    rating4?: number
    rating5?: number
    weight?: number
}
export type AppraisalRequestItemPayload = {
    id: number
    submissionList: EmpSubmissionParams[]
    actionStatus: string
    personalAction?: string
    devAction?: number  
    remark?: string
}
export type ReviewerMember = {
    id: number
    appraisalRequestId:number   
    empId: number
    empNo: string
    empName?:string
    remarks?: string
}
export type ReviewerMemberPayload = {
    id: number
    processInstId:string
    empId: number
    empNo: string
    empName?:string
    remarks?: string
}
export type AppraisalLookupData = {
    label:string
    value:number
    description?:string,
    status?: boolean
}


export type SaveContactData = {
    id?: number;
    contractNo?: string;
    customerId: number;
    contractTypeId: number;
    brandId: number;
    budgetCode: string;
    contractDate: Moment;
    contractDuration: Moment[];
    termId: number;
    remarks?: string;
}
export type AppraisalRequestReportParams = {
    status?: string[],
    requestTypeId?: number[],
    appraisalPeriodId?: number[]
}  

export type PerformanceEvaluationAccessRs = {
    access: boolean;
    appraiser?: AppraiserEvaluationRs[];
    company?: AppraiserCompanyRs[]
    function?: AppraiserFunctionRs[]
}
export type AppraiserEvaluationRs ={
    id: string
    company: string
    func: string
    appraiser1Id: number
    appraiser1No: String
    appraiser1: string
    appraisalPerformanceId: number
}
export type AppraiserCompanyRs = {
    id: string
    company: string
    appraisalPerformanceId: number
}
export type AppraiserFunctionRs = {
    id: string
    company: string
    func: string
    appraisalPerformanceId: number
}