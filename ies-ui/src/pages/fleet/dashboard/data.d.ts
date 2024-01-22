import moment from "moment";

export interface TruckFuelUsageDTO {
    quantity: number,
    truckNumber: string,
    date?: moment.Moment
}
export interface TruckFuelUsageParam {
    gasType?: number;
    date?: moment.Moment;
}

export interface TruckMaintenanceCostDTO {
    totalCost: number,
    truckNumber: string,
    date?: moment.Moment
}
export interface TruckMaintenanceCostParam {
    status?: string;
    date?: moment.Moment;
}

export interface ServiceTaskMoreMaintenanceDTO {
    count: number,
    serviceName: string,
    date?: moment.Moment
}
export interface ServiceTaskMoreMaintenanceParam {
    status?: string;
    date?: moment.Moment;
}

export interface MonthlyAvgVehicleRepair{
     type?:string,
     value?:number,
     date?: string
}

export interface MonthlyAvgVehicleRepairParam{
    date?:moment.Moment
}

export interface DieselUsageDaysInMonthDTO{
     day:string,
     quantity: number,
}

export interface DieselUsageDaysInMonthParam{
     date?:moment.Moment,
}

export interface InspectionDaysInMonthDTO{
    day:string,
    qty: number,
    title: string,
}