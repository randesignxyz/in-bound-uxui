import { Moment } from "moment"

export type NewStaffListItem = {
    id: number
    processInstId: string
    formNo?: string
    requestedBy: string
    requestedDate: Moment
    empNo: string;
    empName: string;
    empLocalName: string;
    jobTitle: string;
    bu?: string;
    department: string;
    subDepartment?: string;
    reportTo?: string;
    status: string;
}


export type NewStaffDetailItem = {
    id: number;
    itemId: number;
    itemName: number;
    itemType?: string;
    qty: number;
    checked: boolean;
    remarks?: string;
}

export type NewStaffItemDetail = {
    id: number
    empNo?: string;
    empName: string;
    empLocalName: string;
    jobTitle: string;
    department: string;
    reportTo: string;
    startingDate: Moment;
    items: NewStaffDetailItem[];
}

export type SearchParams = {
    keyword?: string,
    status?: string,
}


export type SaveItem = {

    itemId: number;
    itemName: string;
    qty: number;
    itemType?: string;
    checked: boolean;
    remarks?: string;
}

export type SavePayLoad = {
    id?: number;
    requestor: string;
    requesterBuId: number;
    empNo?: string;
    empName: string;
    empLocalName: string;
    jobId: number
    jobTitle: String
    buId: number
    bu: string
    departmentId: number
    department: string
    workplaceId: number
    workplace: string
    startingDate: Moment
    hodUserId: string;
    items: SaveItem[];
    uploadedFiles: string[];
}

export const ITNewStaffFormNames = {
    processDefKey: 'it_new_staff_request',
    start: 'it_new_staff_request',
    function_manager: 'it_new_staff_request_function_manager',
    ict_manager: 'it_new_staff_request_ict_manager',
    it_support: 'it_new_staff_request_it_support',
    it_review: 'it_new_staff_request_ict_review'
}

export type AccountInfo = {
    accountType: string
    accountId: string
    tmpPassword?: string
    remarks?: string
}

export type ItemSupportSaveParams = {
    id: number,
    accountInfoList: AccountInfo[]

}

export type HiringFunctionSaveParams = {
    instanceId: string,
    items: SaveItem[];

}
