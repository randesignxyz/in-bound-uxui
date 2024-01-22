

interface DepartmentDTO{
    id:number;
    name:string;
    description:string;
    status?:string;
    createdBy?:string;
    createdDate?:Moment.moment;
    lastModifiedby?:string;
    lastModifiedDate?:Moment.moment;
    buId:OrgUnitDTO;
    users?:UserDataDTO[];
}

interface DeparmentCreate{
    id?:number;
    name:string;
    description?:string;
    status?:string;
    buId:number;
}
interface DepartmentAdvanceSearchParam{
 
}

interface AssignDepartment {
    department?:number ,
    departmentName?: string,
    userId:List<number>,
}