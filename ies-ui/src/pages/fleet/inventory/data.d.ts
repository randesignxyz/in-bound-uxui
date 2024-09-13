

interface InventoryCreate {
    id?:number;
    partNumber:string;
    name:string;
    category?:number;
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
}


interface InventoryDTO {
    id?:number;
    partNumber:string;
    name:string;
    category?:number;
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
}

interface InventorySearchParam{

}