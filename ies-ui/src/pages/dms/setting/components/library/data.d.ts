import { FolderDTO } from "@/pages/dms/folder/data";
import { Moment } from "moment";


interface LibraryDTO{
    id:number;
    name:string;
    location:string;
    status:string;
    type:string;
    createdBy?:string;
    createdDate?:Moment.moment;
    lastModifiedBy?:string;
    lastModifiesDate?:Moment.moment;
    totalFolder:number;
    folder?:FolderDTO[];
    department:DepartmentDTO
}
interface LibraryCreate{
    id?:number;
    name:string;
    location:string;
    type?:string;
    description?:string;
    departmentId?:number;
}

interface LibraryAdvanceSearchParam{
    searchValue?:string;
    isAdmin?:boolean=false;
}