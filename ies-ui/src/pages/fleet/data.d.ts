import { Moment } from "moment";


interface ActivityLogDTO{
    id:number;
    activity:string;
    referenceStringId:string?;
    referenceIntId:number?;
    createdBy:string;
    createdDate:Moment.moment,
    remark:string?;
    source:string?;
}
interface ActivityLogAdvanceSearchParam{
    referenceIntId?:number;
    referenceStringId?:string;
    source:"ACCESSORY"|"FLEET"|"VEHICLE";
}