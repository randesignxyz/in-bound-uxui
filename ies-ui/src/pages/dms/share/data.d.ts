import { Moment } from "moment"
import { Attachment,  DocumentationDTO } from "../documentation/data";

interface ShareDTO{
     id:number,
     recipient:string,
     expirationDate?: Moment.moment,
     effectiveDate?: Moment.moment,
     downloaded?:number,
     createdBy?:String;
     createdDate?:Moment.moment;
     lastModifiedDate?:Moment.moment;
     document:DocumentationDTO;
     attachment:Attachment[];
     createdDate?:Moment.moment;
     type?:string;
     description?:string;
     accessible?:string;
     isOwner?:boolean;
}
interface ShareCreate{
     id?:number;
     recipient?:string;
     documentId?:number;
     expirationDate?: Moment.moment;
     effectiveDate?: Moment.moment;
     description?:string;
     teamId?:number;
     accessible:string;
}
interface ReceiveShareAdvanceSearchParam {

}