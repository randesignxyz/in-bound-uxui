import { Moment } from "moment";
interface HistoryDTO {
    id?: number;
    actionBy: string;
    action: string;
    actionType: string;
    actionDate: Moment.moment;
    instantId?: number;
    remark: string;
}
interface HistorySearchParam {
    actionType?: string;
    instantId?: number;
    source:string;
}
interface HistoryCreate{
    id?:number,
    instantId?:number ,
    actionType:string,
    action:string,
    remark ?:string,
    source:string,
}