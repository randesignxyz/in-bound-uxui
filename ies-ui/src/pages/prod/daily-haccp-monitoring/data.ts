import { Moment } from "moment"

export type HACCPMonitoring = {
    some(arg0: (item: any) => boolean): unknown
    id?: number,
    assign_to?: string,
    remark?: string,
    assign_date?: Moment,
    line?: string,
    haccp_id?: string,
    createdBy?: string,
    createdDate?: Moment,
    lastModifiedBy?: string,
    lastModifiedDate?: Moment,
    haccplist?: HACCPMonitoringList[]
}

export type HACCPMonitoringList = {
    id: number,
    haccp_id?: string,
    other: string,
    warning_count: number,
    time: string,
    status: string,
    water_pressure: string,
    nozzles_rinser: string,
    fg: string,
    smell: string,
    activity_control: string,
    take_action: string,
    done_by: string,
    createdBy: string,
    createdDate: Moment,
    lastModifiedBy: string,
    lastModifiedDate: Moment,
    side_wall: string,
    air_pressure: string,
    temperature_preform: string,
    treated_water_pressure: string,
}

export type HACCPMonitoringActivities = {
    id?: number,
    action: string,
    actionBy: string,
    actionDate: Moment,
    line: string,
    haccp_id: string,
    line_id?: number
}