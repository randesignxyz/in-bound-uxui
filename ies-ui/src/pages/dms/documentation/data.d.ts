import { Activity } from "@/services/process-workflow/data";
import moment, { Moment } from "moment"
import { CategoryDTO } from "../setting/components/category/data";
import { FavoriteCreate, FavoriteDTO } from "../favorite/data";

interface DocumentationDTO {
    id: number,
    documentCode: string,
    title: string,
    status: string,
    fileId: string,
    effectiveDate?: Moment.moment,
    expirationDate?: Moment.moment,
    description?: string,
    createdBy?: string,
    createdDate?: Moment.moment,
    lastModifiedBy?: string,
    lastModifiedDate?: Moment.moment,
    fileSize:number;
    fileType:string;
    history:List<HistoryDTO>,
    category?:CategoryDTO,
    department?:DepartmentDTO,
    attachment:Attachment,
    share:number;
    documentType?:DocumentTypeDTO;
    orgUnit?:OrgUnitDTO;
    periodDays?:number;
    favorite?:FavoriteCreate;
    isOwner:boolean;
}



interface DocumentationCreate {
    id?: number;
    title?: string,
    description?: string,
    status?: string,
    effectiveDate?: Moment.moment,
    expirationDate?: Moment.moment,
    fileId: string,
    documentCode?: string
    fileSize?: number;
    fileType?:string;
    fileName?:string;
    departmentId?:number;
    documentTypeId?:number;
    orgUnitId?:number;
    isAlert:boolean;
    periodDays?:number;
    libraryId?:number;
}


interface DocumentationAdvanceSearch{
    status?:string;
    folderId?:number;
    folderType?:string;
}
interface DocumentationSearchByFolder{
    folderId?:number;
    folderType?:string;
}

interface HistoryDTO{
    id:number;
    action:string;
    actionBy:string;
    actionDate:Moment.moment;
    actionType:string;
    instantId?:number;
    remark:string;
}

interface Attachment{
    documentId:number,
    id:number;
    fileId:string;
    fileSize:number;
    fileName:string;
    fileType:string;
}