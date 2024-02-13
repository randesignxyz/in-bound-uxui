import { Activity } from "@/services/process-workflow/data";
import moment, { Moment } from "moment"
import { CategoryDTO } from "../setting/components/category/data";
import { FavoriteCreate, FavoriteDTO } from "../favorite/data";
import { FolderDTO } from "../folder/data";
import { LibraryDTO } from "../setting/components/library/data";
import { ContractTermCreate } from "../contract/data";


interface DocumentationDTO{
    id:number;
    folderId:number;
    createdBy:number;
    createdDate:Moment.moment;
    documentation:ContentDTO;
    term:DocTermCreate;
    department?:DepartmentDTO;
    division:"DOC"|"CONTRACT";
    company?:CompanyDTO;
    status?:string,
    category?:CategoryDTO;
    docType?:DocumentTypeDTO;
    buId?:OrgUnitDTO;
    path?:FolderDTO[];
    share:number;
    attachment?:string[];
    favorite?:FavoriteCreate;
    contractType:LookupDataDTO;
    library?:LibraryDTO;
}


interface DocumentationCreate {
    id?:number;
    libraryId?:number;
    folderId?:number;
    division?:string;
    buId?:number;
    term?:ContractTermCreate;
    content:ContentCreate;
    attachment?:Attachment[];
}


interface DocumentationAdvanceSearch{
    status?:string;
    folderId?:number;
    library?:number;
    folderType?:string;
    division?:string;
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
    documentId?:number,
    id?:number;
    fileId?:string;
    fileSize?:number;
    fileName?:string;
    fileType?:string;
    fileExtension?:string;
    createdBy?:string;
    createdDate?:Moment.moment;
}

interface UploadAttachmentFile{
    documentId?:number;
    attachment?:Attachment[];
}

interface ContentCreate{
    id?:number,
    docName?:string,
    docNumber?:string;
    company?:number;
    department?:number;
    docType?:number;
    category?:number;
    vendorName?:string;
    vendorCode?:string;
    location?:string;
    description?:string;
    gratis?:string;
    
  
}

interface ContentDTO{
    id?:number,
    docName?:string,
    docNumber?:string;
    company?:CompanyDTO;
    department?:number;
    docType?:number;
    category?:number;
    vendorName?:string;
    vendorCode?:string;
    location?:string;
    description?:string;
    gratis?:string;
    status:string;
    contractValue?:string;
    purposeValue?:string;

}


interface DocTermCreate{
    id?:numner,
    termType?:string,
    effectiveDate?:Moment.moment,
    expiryDate?:Moment.moment;
    // currentExpDate?:Moment.moment;
    renewalInterval?:number
    noticePeriod?:string
    noticeDate?:Moment.moment,
    noticePeriod:string
}

