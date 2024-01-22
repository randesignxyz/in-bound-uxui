
interface VendorDTO{
    id:number,
    name:string,
    phone?:string,
    address?: string,
    lateLong?: string,
    type?: string,
    referTo: string,
    group?:string;
    latinName?:string;
    code:string?,
    phone1:string?,
    specialist:string?,
    
}


interface VendorCreate{
    id?:number,
    name:string,
    phone?:string,
    address?: string,
    lateLong?: string,
    type?: string,
    referTo: string,
}


interface SearchVendorParam{
    searchValue?: string
}



