import { LookupDataItem } from "@/services/data"
import { Moment } from "moment"

export type StaffProposalListItem = {
    id: number
    processInstId: string
    formNo: string
    requestedBy: string
    requestedDate: Moment
    status: string
    empName: string
    jobTitle: string
    bu: string
    department: string
    reportTo: string
}


export type SearchParams = {
    keyword?: string,
    status?: string,
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


export type StaffProposalRequestCancel = {
    processInstanceId: string;
    remarks: string;
    fileIds?: string[];
}

export type SavePayLoad = {
    id?: number,
    requestor: string
    requesterBuId: number
    empName: string
    jobId: number
    buId: number
    departmentId: number
    requisitionId: number
    subDepartmentId?: number
    section?: string
    team?: string
    directReportTo: number
    workingShiftId: number
    dayOffGroupId: number
    startingDate?: Moment
    contractTypeId: number
    contractDateFrom?: Moment
    contractDateTo?: Moment
    segmentId: number
    uploadedFiles: string[]
    items: RequestedItem[]
    remarks?: string
}

export type StaffProposalDetail = {
    id: number
    empName: string
    jobTitle: LookupDataItem,
    segment: LookupDataItem,
    bu: LookupDataItem,
    department: LookupDataItem,
    requisition: LookupDataItem,
    subDepartment?: LookupDataItem,
    session?: string,
    team?: string,
    directReportTo: LookupDataItem,
    workingShift: LookupDataItem,
    dayOffGroup: LookupDataItem,
    startingDate: Moment,
    contractType: LookupDataItem,
    contractDateFrom?: Moment,
    contractDateTo?: Moment,
    items: RequestedItem[],
    status: string;
}


export const StaffProposalFormNames = {
    processDefKey: 'staff_proposal_request_process',
    start: 'staff_proposal_request_process',
    staff_proposal_hrbp: 'staff_proposal_hrbp',
    staff_proposal_hrbp_manager: 'staff_proposal_hrbp_manager',
    staff_proposal_hrm_manager: 'staff_proposal_hrm_manager',
    staff_proposal_dmbo1: 'staff_proposal_dmbo1',
    staff_proposal_dmbo2: 'staff_proposal_dmbo2',
    staff_proposal_dmbo_omr: 'staff_proposal_dmbo_mr',
    staff_proposal_mbo: 'staff_proposal_mbo',
    staff_proposal_dmd: 'staff_proposal_dmd',
    staff_proposal_hra_sr_manager: 'staff_proposal_hra_sr_manager',
}
export const StaffProposalOFLFormNames = {
    processDefKey: 'staff_proposal_request_process_ofl',
    start: 'staff_proposal_request_process_ofl',
    staff_proposal_hrbp: 'staff_proposal_ofl_hrbp',
    staff_proposal_hrm_manager: 'staff_proposal_ofl_hrm_manager',
    staff_proposal_sr_manager_approval: 'staff_proposal_ofl_sr_manager_approval',
    staff_proposal_dmd: 'staff_proposal_ofl_dmd',
    staff_proposal_hra_sr_manager: 'staff_proposal_ofl_hra_sr_manager',
}
export type RequestItem = {
    itemId: number
    itemName: string
    itemType?: string
    qty?: number,
    amount?: number,
    remarks?: string
}