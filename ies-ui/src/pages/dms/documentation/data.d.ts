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
    accountant?:DocAccountant;
    department?:DepartmentDTO;
    division:"DOC"|"CONTRACT";
    company?:CompanyDTO;
    status?:string,
    category?:string;
    docType?:DocumentTypeDTO;
    buId?:OrgUnitDTO;
    path?:FolderDTO[];
    share:number;
    attachment?:string[];
    favorite?:FavoriteCreate;
    contractType:LookupDataDTO;
    library?:LibraryDTO;
    termType?:LookupDataDTO,
    vendor?:VendorsDTO,
    currency?:LookupDataDTO,
    opCo?:OrgUnitDTO,
    owner:boolean
    
}

interface DocumentationCreate {
    id?:number;
    libraryId?:number;
    folderId?:number;
    division?:string;
    buId?:number;
    category?:string;
    term?:ContractTermCreate;
    content:ContentCreate;
    attachment?:Attachment[];
    accountant?:DocAccountant;
}

interface DocumentationAdvanceSearch{
    status?:string;
    folderId?:number;
    libraryId?:number;
    folderType?:string;
    division?:string;
    searchValue?:string;
    subStatus?:string;
    expired?:string;
    shared?:string[];
    isDeleted?:boolean;
    filterType:"ADMIN"|"USER" |undefined;
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
    vendorName?:number;
    vendorCode?:string;
    location?:string;
    description?:string;
    gratis?:string;
    opCo?:string;
    contractCategory?:number;
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
    contractCategory?:string;
    institute?:string;
}

interface DocTermCreate{
    id?:numner,
    type?:number,
    effectiveDate?:Moment.moment,
    expiryDate?:Moment.moment;
    renewalInterval?:number
    noticePeriod?:string;
    noticePeriodDay?:number;
    noticeDate?:Moment.moment,
    noticePeriod?:string;
    sendEmail?:boolean;
    warranty?:string;
    penaltyClause?:string;
    termPayment?:string;
    issuedDate?:Moment.moment
}

interface DocAccountant{
    id?:number;
    totalAmount?:number;
    finalAmount?:number;
    po?:string;
    paid?:number;
    balance?:number;
    updateComment?:string;
}

interface MoveDocParams{
    docId?:number;
    folderId?:number;
}
