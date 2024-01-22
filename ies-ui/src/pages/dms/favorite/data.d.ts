import { Moment } from "moment"
import { Attachment, DocumentDTO as DocumentationDTO } from "../documentation/data";


interface FavoriteDTO{
     id:number;
     documentId?:number;
     userName?:string;
}



interface FavoriteCreate{
     id?:number;
     documentId?:number;
}


interface ReceiveShareAdvanceSearchParam {

}