import { LookupDataItem } from "@/services/data";
import { Moment } from "moment";

export type OperatorCheckIn =  {
    id: number;
    type: string;
    checkedInDate: Moment;
    checkInRemarks?: string;
}

export type OperatorCheckInInfo =  {
    id: number;
    type: string;
    checkedInDate: Moment;
    checkInRemarks?: string;
    transportSources?: LookupDataItem[];
    loadingCapacities?: LookupDataItem[];
    loadingDocks?: LookupDataItem[];
}