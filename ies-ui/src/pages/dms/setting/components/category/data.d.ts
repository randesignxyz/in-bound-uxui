import { Moment } from "moment";

 interface CategoryCreate{
    id?:number;
    name:string;
    description?:string;
    status?:string;
 }

 interface CategoryDTO{
    id:number;
    name:string;
    description:string;
    status?:string;
    createdBy?:string;
    createdDate?:Moment.moment;
    lastModifiedby?:string;
    lastModifiedDate?:Moment.moment;
    
 }

 interface CategorySearchParam{
    
 }