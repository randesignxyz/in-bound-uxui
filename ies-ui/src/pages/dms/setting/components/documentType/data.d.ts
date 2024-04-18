

interface DocumentTypeDTO{  
    id?:number;
    name:string;
    status:string;
    description?:string;
    requiredExpire?:boolean;
    restrictFile?:boolean;
    fileExtension?:string[];   
}

interface DocumentTypeCreate{
    id?:number;
    name:string;
    status:string;
    description?:string;
    requiredExpire?:boolean;
    restrictFile?:boolean;
    fileExtension?:string;                            

}

interface DocumentTypeAdvanceSearch{
    searchValue:string
}