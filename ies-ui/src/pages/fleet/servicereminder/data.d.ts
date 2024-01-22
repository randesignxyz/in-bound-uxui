import moment from "moment";
import { ServiceTasksDTO } from "../serviceTask/data";
import { MeterHistoryDTO, VehicleListItem } from "../vehicle/data";


export interface ServiceReminderDTO {
    id: number,
    dueSoonMeterThreshold?: number,
    dueSoonTimeThresholdFrequency: "days" | "months" | "weeks" | "years",
    dueSoonTimeThresholdInterval?: number,
    meterInterval: number,
    nextDueAt: moment.Moment,
    nextDueMeter: number,
    serviceTask: ServiceTasksDTO?,
    timeFrequency: string,
    timeInterval: number,
    vehicleId: VehicleListItem,
    watcher?: string,
    meterHistory?: MeterHistory
    createdBy: string?;
    lastModifiedDate?: moment.Moment,
    status: string;
    statusCount: StatusCount;
    scheduleType: string;
}

export interface StatusCount {
    overdue: number;
    dueSoon: number;
    upcoming: number;
}

export interface ServiceReminderCreate {
    id?: number;
    dueSoonMeterThreshold?: number,
    dueSoonTimeThresholdFrequency: string,
    dueSoonTimeThresholdInterval?: number,
    meterInterval: number,
    nextDueAt: moment.Moment,
    nextDueMeter: number,
    serviceTaskId?: number,
    timeFrequency: string,
    timeInterval: number,
    vehicleId?: string,
    watcher?: string,
    type?: string,
    scheduleType: string;
}

export interface ServiceReminderSearchParam {
    status: "ALL" | "Upcoming" | "Duesoon" | "Overdue"

}

export interface ServiceReminderMaintenance {
    id?: number,
    dueSoonMeterThreshold?: number,
    dueSoonTimeThresholdFrequency?: string,
    dueSoonTimeThresholdInterval?: number,
    meterInterval?: number,
    nextDueAt?: moment.Moment,
    nextDueMeter?: number,
    serviceTaskId?: number,
    timeFrequency?: string,
    timeInterval?: number,
}


export interface ReminderHistory {
    remark: string;
    source: string;
    status: string;
    reminderId: number;
    reminderDTO?: ServiceReminderDTO;
}

export interface ReminderHistorySearch {
    searchValue?: string
    reminderId: number;
}