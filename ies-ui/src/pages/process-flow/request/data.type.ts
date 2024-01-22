import { Moment } from "moment";

export type ProcessRequestItem = {
    id: string;
    key: string;
    requestName: string;
    shortName: string;
    bu: string[];
    path?: string;
    departments: string[];
    description?: string;
    tag: string[];
    startFormInNewPage?: boolean,
    liveDate?: Moment,
    announcementDays?: number
}