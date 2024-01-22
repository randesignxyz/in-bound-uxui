
export interface AccessoriesDTO{
    id:number;
    name:string;
    brand?:string;
    code?:string;
    description?:string;
    imageLink?:string;
    quantity?:number;
    imageId?:string;
    status?:string;
    key:string;
    selected?: boolean;
}

export interface AccessoriesCreate{
    id?:number;
    name:string;
    brand?:string;
    code?:string;
    description?:string;
    imageId?:string;
    status?:string;
    quantity:number
}


export interface AddVehicleAccessory{
    vehicleId?:string;
    items:List<{
        accessoryId: number,
        quantity: number
    }>
}

export interface AccessoriesSearchParam{
    searchValue?:string;
}
