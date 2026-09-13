import { Moment } from "moment"

export type DailyWaterTreatmentMachine = {
    id: number,
    name: string
}

export type AssignDailyWaterTreatment = {
    assign_to: string,
    shift: string,
    treatment_id: string
    remark: string,
    length: number,
    assign_date: Moment,
    treatmentlist: DailyWaterTreatmentItem[]
    createdBy: string,
    createdDate: Moment
}

export type DailyWaterTreatmentItem = {
    id: number,
    check_by: string,
    air_release: number,
    odor: number,
    ph: string,
    press_drain: string,
    press_inlet: string,
    press_treat: string,
    pressure: string,
    taste: number,
    tds: string,
    temperature: string
    treatment_id: string,
    other: string,
    machine: string,
    status: string,
    warning_count: number,
    lastModifiedDate: Moment,
    action?:string,
    assign_to_user?:string
}

export type GetTreatmentByDateAssignParam = {
    created_date: string
}

export type ActivitiesParams={
    treatment_id: string,
}

export type DailyWaterTreatmentActivities = {
    id?: number,
    action: string,
    actionBy: string,
    actionDate: Moment,
    treatment_id: string,
    machine_id: number,
}