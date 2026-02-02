import { Moment } from "moment";

export interface IosRequestPayload {
    iosMasterListId: number;
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