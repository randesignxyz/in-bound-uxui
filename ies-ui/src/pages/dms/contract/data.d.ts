import { Moment } from "moment";



interface ContractEntry{

}

interface ContractRequestEntry{
    companyName:number;
    description:string;
    purpose:string;
    estimateStartDate:Moment.moment;
    address1?:string;
    city?:string;
    postalCode?:string;
    state?:string;
}

interface ContractRequestDTO{
    companyName:Compa
}
interface ContractRequestAdvanceSearch{
    
}

interface ContractDTO {
     id:number,
     contractName:string,
     contractNumber:string,
     companyName?: CompanyDTO,
     department?: Department,
     contractType?:string,
     currency?: LookupDataDTO,
     description?:string,
     gratis?:string,
     loocation:string;
     contractValue:number;
     purposeValue:number;
     contractTerm:ContractTermCreate;
     createdBy:string;
     createdDate:Moment.moment;
     lastModifiedBy?:string;
     lastModifiedDate?:Moment.moment;
     status?:string;
     vendorName?:string;
     vendorCode?:string;
}

interface ContractCreate{
    id?:number,
    contactName?:string,
    contractNumber:string,
    company?: number,
    department?: number,
    contractType?:string,
    currency?: number,
    description?:string,
    gratis?:string,
    location?:string,
    termType?:string,
    renewalInterval?:number;
    originalExpDate?:Moment.moment;
    noticePeriod?:string;
    noticeDate?:Moment.moment
    effectiveDate?:Moment.moment;
    currentExpDate?:Moment.moment;
    purposeValue?:number;
    contractValue?:number;
    vendorName?:string;
    vendorCode?:string;
}

interface ContractTermCreate{
     id?:numner,
     termType?:string,
     effectiveDate?:Moment.moment,
     originalExpDate?:Moment.moment;
     currentExpDate?:Moment.moment;
     renewalInter?:number
     noticePeriod?:string
     noticeDate?:Moment.moment,
}

interface ContractVendorCreate{
     id?:number,
     vendorName?:string,
     vendorCode?:string,
     phone?:string,
}


interface ContractRequestCreate{
     id?: number,
     companyName:number,
     description?:string,
     purpose:string,
     estimateStartDate: Moment.moment,
     requestType :string,
     contract:ContractCreate
}

interface ContractRequestDTO{
    id?: number,
    companyName:number,
    description?:string,
    purpose:string,
    estimateStartDate: Moment.moment,
    requestType :string,
    contract:ContractCreate
}