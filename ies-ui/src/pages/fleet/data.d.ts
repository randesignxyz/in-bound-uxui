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

interface BusnessUnit {
    id:number;
    name:string;
    description:string;
    parentId:number;
}


export interface LookUpDataDTO{
    id: number,
    name: String,
    code: String,
    type: String,
    seq: Number,
    active:Number
}


export interface LookUpDataParam{
    type?:string
}

export interface AttachmentFilesDTO{
    id:number;
    attachedTo:string;
    attachedToId:number;
    fileId:string;
}

export interface AttachmentFilesCreate{
    id?:number;
    attachedTo :string;
    attachedToId:number;
    fileId:string;
}
