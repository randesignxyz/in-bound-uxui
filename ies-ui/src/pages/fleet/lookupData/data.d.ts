
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

