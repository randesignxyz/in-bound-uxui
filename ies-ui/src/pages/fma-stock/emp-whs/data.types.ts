// export type ItemList = {
//     id: number
//     itemCode: string
//     itemAbr: string
//     itemName: string
//     description?: string
//     defaultUoM: string
//     itemGroup: {
//         id: number
//         itemGroupName: string
//     };
// }
// export type ItemDetail = {
//     id: number
//     itemCode: string
//     itemAbr: string
//     itemName: string
//     active:string
//     isActiveY:boolean
//     defaultUoM: string
//     decription: string
//     itemGroup: {
//         id: number
//         itemGroupName: string
//     };
// }

export type SearchItemParams  = {    
    searchValue?: string,
    advanceSearch?: ItemAdvanceSearchParams

}
export type SaveItemData = {
    id: number
    itemCode: string
    itemAbr: string
    itemName: string
    defaultUoM: string
    description?: string
    status:string
    isActiveY:boolean
    groupId: number
}
export type ItemAdvanceSearchParams = {  
    status: 'ALL'| 'Y' | 'N'
    groupIds?: number[];
};
export type UoM = {  
    id: number
    code: string
    name?: string
};
export interface EmployeeList {
    id: number;    
    bu: string;
    department: string;
    employeeCode: string;
    employeeLocalName: string;
    firstName:string;
    lastName: string;
    jobTitle: string;    
    reportTo: string;
    sapId: number;
    status: string;
    userId: number;
}

export type SearchEmpParams  = {    
    searchValue?: string
}
export interface WarehouseList {
    id: number;    
    code: string;
    name: string;
    build?: string;
}
export type SaveEmpWarehouseMappingData = {
    id: number
    empId: number
    empNo: string
    active: string
    isActiveY?: boolean
    whsList: string[]
}
export type EmpWhsMappingList = {
    id: number
    empNo: string
    empId: number
    firstName: string
    lastName: string
    internalName: string
    whsList: string[]
}
export type EmpWhsMappingDetail = {
    id: number
    empNo: string
    empId: number
    firstName: string
    lastName: string
    internalName: string
    isActiveY: boolean
    whsList: {
        id: number;    
        code: string;
        name: string;
        build?: string;
    }[];
}
export type CheckEmpWhsMapping = {
    id: number
    empNo: string
    empId: number
    active: string
}