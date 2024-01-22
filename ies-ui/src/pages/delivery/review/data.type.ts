import { Moment } from "moment";

export type ReviewReport = {
    reportType: string,
    dateType: string,
    drivers?: number[],
    date?: Moment,
    dateRage?: Moment[];
}