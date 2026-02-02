export interface EmployeeMasterIOS {
    id: number;
    empId: number;
    empNo: string;
    empName: string;
    buName: string;
    deptName: string;
    jobTitle: string;
    jobLevel: string;
    jobLevelId: number;
    appraiser1: string;
    appraiser1No: string;
    appraiser2: string;
    appraiser2No: string;
    initData: InitData;
}
export interface InitData {
    section2: Section2Item[];
    weighTage: Weightage[];
}

export interface Section2Item {
    id: number;
    iosEmpRequestId?: number | null;

    objId: number;
    objTitle: string;
    obj: string;

    actionPlanId: number;
    actionPlan: string;

    kpiId: number;
    kpi: string;

    weight: number;
    startedDate?: string | null;
    dueDate?: string | null;

    mid?: string | null;
    selfEvaluation?: number | null;
    justification?: string | null;
    mevaluation?: number | null;
}


interface IOSWeightage {
    id: number;
    section: string
    jobLevelId: number
    jobLevel: string
    weight: number | 0.6
}