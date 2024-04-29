import { ActivityLogDTO } from "../data";

export interface AccessoriesDTO{
    imageLink: any;
    id:number;
    partNumber:string;
    name:string;
    category?:CategoryDTO;
    brand?:string;
    model?:string;
    serialNumber?:string;
    qty:number;
    unitCost:number;
    unitType:string;
    warehouse?:string;
    vendor?:string;
    manufacturer?:string;
    description?:string;
    imageId?:string;
    status:string,
    activityLog:List<ActivityLogDTO>
}

export interface AccessoriesCreate{
    id?:number;
    partNumber?:string;
    name?:string;
    category?:number;
    brand?:string;
    model?:string;
    serialNumber?:string;
    qty:number;
    unitCost?:number;
    unitType?:string;
    warehouse?:string;
    vendor?:string;
    manufacturer?:string;
    description?:string;
    imageId?:string;
    status?:string;
}


export interface AddVehicleAccessory{
    vehicleId?:string;
    items:List<{
        accessoryId: number,
        quantity: number
    }>
}

export interface AccessoriesSearchParam{
    status:string
}

// interface AccessoryDeductQTY{
//     qty:number;
//     unitCost:string;
//     id:number;
// }

interface CategoryDTO{
    id:number;
    name:string;
    description:string;
}