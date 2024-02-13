
interface CompanyEntryCreate{
    id?:number,
    name?:string,
    companyNumber?: string,
    groupId?:string,
    taxId?:string,
    websiteUrl?:string,
    companyType?:string,
    address1?:string,
    address2?:string,
    city?:string,
    state?:string,
    postalCode?:string,
    country?:string,
    phone?:string,
}

interface CompanyDTO{
    id?:number,
    name:string,
    companyNumber: string,
    groupId?:string,
    taxId?:string,
    websiteUrl?:string,
    companyType?:string,
    address1?:string,
    address2?:string,
    city?:string,
    state?:string,
    postalCode?:string,
    country?:string,
    phone?:string,
}
interface CompanyAdvanceSearchParam{
    searchValue?:string
}