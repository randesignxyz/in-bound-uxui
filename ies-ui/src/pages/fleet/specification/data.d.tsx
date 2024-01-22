

// ================= Model Tire item apply for each vehicle ====================
export interface TireVehicleDTO{
    id:number;
    axleType: string;
    tirePosition:string;
    tireWidth:number;
    vehicleId:string;
    wheelDiameter:number;
    brand:string;
    code:string;
    model:string;
    purchaseDate:moment.Moment;
    durability:string;
    status:string;
    createdBy:string;
    lastModifiedBy:string;
    lastModifiedDate:moment.Moment
}

export interface TireVehicleCreate{
    id?:number;
    axleType: string;
    tirePosition:string;
    vehicleId:string;
    tireWidth:number;
    wheelDiameter:number;
    brand?:string;
    code?:string;
    model?:string;
    purchaseDate:moment.Moment;
    durability:string;
    status:string;
}
// ====================== END =====================




// ================= Model Battery item apply for each vehicle ====================
export interface BatteryVehicleDTO{
    id:number;
    vehicleId:string;
    brand:string;
    code:string;
    quantity:number;
    purchaseDate:moment.Moment;
    durability:string;
    status:string;
    power:string;
    createdBy:string;
    lastModifiedBy:string;
    lastModifiedDate:moment.Moment;
}

export interface BatteryVehicleCreate{
    id?:number;
    vehicleId:string;
    brand?:string;
    code?:string;
    purchaseDate:moment.Moment;
    durability:string;
    status:string;
    power:string;
    quantity:number;

}
// ====================== END =====================


// ================= Norm Consupmtion Specification Vehicle  ====================
export interface NormFuelConsumptionCreate{
    id?:number;
    vehicleId:string;
    kilometer:number;
    tankCapacity:number;
    usage:number;
    usageRate:number;
    remark?:string;
}

export interface NormFuelConsumptionDTO{
    id:number;
    vehicleId:string;
    kilometer:number;
    tankCapacity:number;
    usage:number;
    usageRate:number;
    string?:string;
}
// ====================== END =====================