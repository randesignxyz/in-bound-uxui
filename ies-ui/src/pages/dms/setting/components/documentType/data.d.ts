

interface DocumentTypeDTO{  
    id?:number;
    name:string;
    status:string;
    description?:string;
    requiredExpire?:boolean;
}

interface DocumentTypeCreate{
    id?:number;
    name:string;
    status:string;
    description?:string;
    requiredExpire?:boolean;
}

interface DocumentTypeAdvanceSearch{
    searchValue:string
}