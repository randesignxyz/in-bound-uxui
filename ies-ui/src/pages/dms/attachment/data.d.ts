

interface Attachment{
    documentId?:number,
    id?:number;
    fileId?:string;
    fileSize?:number;
    fileName?:string;
    fileType?:string;
    fileExtension?:string;
}

interface UploadAttachmentFile{
    documentId?:number;
    attachment?:Attachment[];
}

