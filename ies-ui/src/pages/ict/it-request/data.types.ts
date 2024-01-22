import { Moment } from "moment";


export type ITRequestListItem = {
    id: number
    processInstanceId: string
    formNo: string
    requestedBy: string
    requestedDate: Moment
    reason: string
    completedBy: string
    completedDate: Moment
    status: string
}

export type ITRequestItemDetail = {
    id: number
    category: string
    itemName: string
    remarks: string
    requestedDate: Moment
    requestedDateTo: Moment
}

export type ITRequestDetail = {
    id: number;
    requestTypeId: number;
    reason: string;
    items: ITRequestItemDetail[]

}


export type SearchParams = {
    keyword?: string,
    status?: string,
    postedStatus?: string,
}

export type SavePayLoad = {
    id?: number;
}

export type ItRequestItemData = {
    id?: number
    categoryId?: number
    itemId: number
    remarks?: string
    date?: Moment
    dateTo?:Moment,
    reason?:string

}

export type ItRequestData = {
    requestorId: string;
    requestTypeId: number;
    requestorBuId: number;
    requestItems: ItRequestItemData[]
    uploadedFiles?: string[]
}

export type ItRequestItem = {
    id: number;
    name: string;
    categoryId: number;

}

export type ItRequestCategory = {
    id: number;
    name: string;
    typeId: number;
}

export const ITRequestFormNames = {
    processDefKey: 'it_request',
    start: 'it_request',
    subFunction: 'it_request_sub_function',
    function: 'it_request_function',
    INFRA_SERVER_MANAGER: 'it_request_inra_server_reviewed',
    CORE_SYSTEM_MANAGER: 'it_request_core_sys_reviewed',
    APP_DEV_MANAGER: 'it_request_app_dev_reviewed',
    ICT_MANAGER: 'it_request_ict_manager',
    MBO: 'it_request_mbo',
    IT_SUPPORT: 'it_request_it_support',
    IT_CORE_SYS_SUPPORT: 'it_request_it_core_support',
    IT_APP_DEV_SUPPORT: 'it_request_it_app_dev_support',
}

