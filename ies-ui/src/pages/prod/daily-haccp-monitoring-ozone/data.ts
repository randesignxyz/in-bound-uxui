import { Moment } from "moment"

export type HACCPMonitoringOzoneSystem = {
    id: number,
    ozone: string
}

export type HACCPMonitoringOzoneControl = {
    id: number,
    control: string,
    ozone_id: number,
}


export type HACCPMonitoringOzone = {
    id?:number,
    assign_to?: string,
    time?: string,
    assign_date?: Moment,
    haccp_monitoring_id?: string,
    haccp_monitoring_type?: string,
    remark?: string,
    createdBy?: string,
    createdDate?: Moment,
    lastModifiedBy?: String,
    lastModifiedDate?: Moment,
    haccp_ozone_id?:string,
    haccp_ozone_type?:string,
    ozonelist: HACCPMonitoringOzoneList[],
    length:number
}

export type HACCPMonitoringOzoneList = {
    warning_count: number,
    lastModifiedDate: any
    id: number,
    haccp_ozone_id?: string,
    control?: string,
    check_by?: string,
    feed_array1 ?: string,
    feed_array2?: string,
    concentrate ?: string,
    array1?: string,
    array2 ?: string,
    feed_ro ?: string,
    recycle?: string,
    permeate?: string,
    feed?: string,
    um1_filter?: string,
    ro_buffer_tank?: string,
    uv1?: string,
    uv2?: string,
    um022_filter?: string,
    uv3?: string,
    uv4?: string,
    cartridge_um3?: string,
    cartridge_um08?: string,
    feed_pht133?: string,
    blending?: string,
    feed_ft102?: string,
    ft171_ft192?: string,
    adjustment_ft382?: string,
    ca384?: string,
    ca181?: string,
    mixed_tank?: string,
    o3_mixed_tank?: string,
    air_supply_ps002?: string,
    mixed_pipe?: string,
    chiller_tt302?: string,
    controller?: string,
    o3_a143?: string,
    uv5?: string,
    uv6?: string,
    status: string,
    assign_to_user?: string,
    createdBy?: string,
    createdDate ?: string,
    remark?: string
}

export type HACCPMonitoringOzoneActivities = {
    id?: number,
    action: string,
    actionBy: string,
    actionDate: Moment,
    haccp_ozone_id: string,
    control_id: number,
}