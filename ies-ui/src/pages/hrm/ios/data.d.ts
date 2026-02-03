import { Moment } from "moment";


export interface IosEmpRequest {
    id: number;

    // Business Unit
    buId: number;
    buName: string;

    // Employee info
    empId: number;
    empNo: string;
    empName: string;
    empNameKh: string;
    empUserId: string;
    empEmail: string | null;

    // Job info
    jobId: number;
    jobTitle: string;
    jobLevel: string;
    jobLevelId: number;

    // Department info
    deptId: number;
    deptName: string;
    subDeptId: number;
    subDeptName: string;

    // Request info
    iosEmpSettingId: number;
    status: string;
    currentLevel: number;

    // Weightage
    weightageSection1: number;
    weightageSection2: number;

    // Audit fields
    createdBy: string;
    createdDate: string;          // ISO date string
    lastModifiedBy: string;
    lastModifiedDate: string;     // ISO date string

    // Requester
    requesterId: string;
    requesterEmail: string;
}



export interface IosRequestPayload {
    iosMasterListId?: number;
    iosEmpRequestId?: number;
    action: string;
    comment?: string | null;
    payload: IosData;
}

export interface IosData {
    section1?: IosSection1Params[] | null;
    section2?: IosSection2Params[] | null;
    section3?: IosSection3Params[] | null;
}


interface IosSection1Params {
    midYearReview: string;
    key: string;
    id: number;
    iosEmpRequestId?: number | null;
    obj: string;
    actionPlan: string;
    kpi: string;
    weight?: number;
    startedDate?: Moment;   // ISO string (from Instant)
    dueDate?: Moment;       // ISO string (from Instant)
    mid?: string | null;
    selfEvaluation?: number | null;
    mEvaluation?: number | null;
    justification?: string | null;
}

export interface IosSection2Params {
    initial: any;
    midYearReview: string;
    key: string;
    id: number;
    iosEmpRequestId?: number | null;
    objId: number;
    objTitle: string;
    obj: string;
    actionPlanId: number;
    actionPlan: string;
    kpiId: number;
    kpi: string;
    weight?: number;
    startedDate?: Moment; // ISO 8601 (Instant)
    dueDate?: Moment;     // ISO 8601 (Instant)
    mid?: string | null;
    selfEvaluation?: number | null;
    mEvaluation?: number | null;
    justification?: string | null;
    objectives: string
}

export interface IosSection3Params {
    key: any;
    id: number;
    iosEmpRequestId?: number | null;
    achieve?: string | null;
    strength?: string | null;
    develop?: string | null;
}




export interface IosEmpRequestDetail {
    id: number;
    iosEmpRequestId: number;
    status: "PENDING" | "APPROVED" | "REJECTED";

    iosEmpRequest: IosEmpRequest;
    iosWorkFlow: IosWorkFlow;

    activities: Activity[];
    iosEmpApprovalSteps: ApprovalStep[];

    section1: Section1[];
    section2: Section2[];
    section3: Section3[];

    currentLevel: number;

    empId: number;
    empNo: string;
    empName: string;
    empNameKh: string;
    empUserId: string;
    empEmail: string | null;

    jobId: number;
    jobTitle: string;
    jobLevel: string;
    jobLevelId: number;

    deptId: number;
    deptName: string;
    subDeptId: number;
    subDeptName: string;

    buId: number;
    buName: string;

    appraiser1: string;
    appraiser1No: string;
    appraiser2: string;
    appraiser2No: string;

    weightageSection1: number;
    weightageSection2: number;
}

export interface IosEmpRequest {
    id: number;
    empId: number;
    empNo: string;
    empName: string;
    empNameKh: string;
    empEmail: string | null;
}

export interface IosWorkFlow {
    approverId: number;
    currentLevel: number;
    actions: IosAction[];
}

export interface Activity {
    id: number;
    iosEmpRequestId: number;
    taskName: string;
    action: string;
    actionBy: string;
    actionDate?: string;
}
export interface ApprovalStep {
    id: number;
    iosEmpRequestId: number;
    approvalLevel: number;
    approverId: number;
    approverNo: string;
    approverName?: string;
    status?: string;
}
export interface Section1 {
    id: number;
    iosEmpRequestId: number;
    obj: string;
    kpi: string;
    actionPlan: string;
    weight: number;
    startedDate?: Moment; // ISO 8601 (Instant)
    dueDate?: Moment;     // ISO 8601 (Instant)
}
export interface Section2 {
    id: number;
    iosEmpRequestId: number;
    objId: number;
    objTitle: string;
    weight?: number;
    startedDate?: Moment; // ISO 8601 (Instant)
    dueDate?: Moment;     // ISO 8601 (Instant)
    actionPlan: string;
    kpi: string;
}
export interface Section3 {
    id?: number;
    iosEmpRequestId?: number;
    [key: string]: any;
}







interface FormSetting {
    section1: IosSection1Params;
    section2: IosSection2Params;
    section3: IosSection3Params;
}
interface FormSection1 {
    midYear: boolean;
    weightage: boolean;
    selfRating: boolean;
    yearEndRating: boolean;
    justification: boolean;

}
interface FormSection2 {
    midYear: boolean;
    weightage: boolean;
    selfRating: boolean;
    yearEndRating: boolean;
    justification: boolean;

}
interface FormSection3 {
    showComment: boolean;

}