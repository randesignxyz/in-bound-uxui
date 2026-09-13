import { Moment } from "moment"

export type DailyPreWaterTreatmentPlant = {
    id: number,
    plant: string
}

export type DailyPreWaterTreatmentControl = {
    id: number,
    control: string,
    plant_id: number,
}


export type DailyPreWaterTreatment = {
    id?:number,
    assign_to?: string,
    time?: string,
    assign_date?: Moment,
    pre_treatment_id: string,
    pre_treatment_type: string,
    remark?: string,
    createdBy?: string,
    createdDate?: Moment,
    lastModifiedBy?: String,
    lastModifiedDate?: Moment,
    pretreatmentlist: DailyPreWaterTreatmentList[],
    length:number
}

export type DailyPreWaterTreatmentList = {
    id: number,
    control: string,
    pre_treatment_id: string,
    pre_treatment_type: string,
    check_by: string,
    sf: string,
    acf: string,
    resin: string,
    um5: string,
    raw_water: string,
    status: string,
    warning_count: number,
    remark: string,
    createdBy: string,
    createdDate: string,
    lastModifiedBy: string,
    lastModifiedDate: Moment,
    sf1: string,
    sf2: string,
    acf1:string,
    acf2:string,
    um101:string,
    um102:string,
    buffer_st002:string,
    action:string,
    assign_to_user:string
}

export type DailyPreWaterTreatmentActivities = {
    id?: number,
    action: string,
    actionBy: string,
    actionDate: Moment,
    pre_treatment_id: string,
    control_id: number,
}