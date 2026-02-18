import { Moment } from "moment"

export type NewStaffListItem = {
    id: number
    processInstId: string
    formNo: string
    requestedBy: string
    requestedDate: Moment
    empNo?: string;
    empName: string;
    empLocalName: string;
    jobTitle: string;
    bu?: string;
    department: string;
    subDepartment?: string;
    reportTo?: string;
    startingDate: moment.Moment;
    status: string;
}

export type NewStaffItemDetail = {
    id: number
    empNo?: string;
    empName: string;
    empLocalName: string;
    jobTitle: string;
    bu: string;
    department: string;
    workplace: string;
    startingDate?: Moment;
    items: NewStaffDetailItem[];
}

export type NewStaffDetailItem = {
    id: number;
    itemId: number;
    itemName: number;
    itemType?: string;
    qty: number;
    checked: boolean;
    remarks?: string;
    category: string;
}


export type SearchParams = {
  status?: "ALL"|"PENDING"|"COMPLETED"|"REJECTED",
  keyword?: string;
  buIds?: number[];
  depIds?: number[];
  fromDate?: moment.Moment,
  toDate?: moment.Moment,
}

export type SaveItem = {
    itemId: number;
    itemName: string;
    qty: number;
    itemType?: string;
    itemCategory: string;
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
    buId: number
    bu: string
    gender: string;
    departmentId: number
    hodUserId: string;
    department: string
    workplaceId: number
    startingDate: Moment
    items: SaveItem[];
    phoneNo?: string;
    email?: string;

    carModal?: string;
    carColor?: string;
    year?: string;
    plateNumber?: string;

    uploadedFiles: string[];
}


export const FMANewStaffFormNames = {
    processDefKey: 'fma_new_staff_request',
    start: 'fma_new_staff_request',
    functionManagerApproval: 'fma_new_staff_request_function_manager',
    fmaManagerApproval: 'fma_new_staff_request_fma_manager',
    fmaSupportOfl: 'hr_new_staff_request_fma_support_ofl',
    fmaSupportNvc: 'hr_new_staff_request_fma_support_nvc',
    fmaSupportOmm: 'hr_new_staff_request_fma_support_omm',
    fmaSupportOmr: 'hr_new_staff_request_fma_support_omr',
}
