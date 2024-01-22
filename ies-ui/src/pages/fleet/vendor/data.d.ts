import moment from "moment";


export interface DriverDTO{
    id:number;
    firstName:string;
    lastName?:string;
    phone?:string;
    cardId?:string;
    email?:string;
    address?:string;
    driverLicense?:string;
    jobTitle?:string;
    employeeNumber?:string;
    dob?:moment.Moment
    status?:string;
    resign:string;
    createdBy?:string;
    lastModifiedBy:string;
    imageId?:string;
    createdDate:moment.Moment;
}

export interface DriverCreate{
    id?:number;
    firstName:string;
    lastName?:string;
    phone?:string;
    cardId?:string;
    email?:string;
    address?:string;
    driverLicense?:string;
    jobTitle?:string;
    employeeNumber?:string;
    dob?:moment.Moment
    status?:string;
    resign:string;
    imageId?:string;
}


export interface DriverSearchParam{
    searchValue?:string;
    status?:"ALL" | "OUTSOURCE" | "INTERNAL";
}
export interface DriverAdvanceSearch{
    status?:"ALL" | "OUTSOURCE" | "INTERNAL";
}


// ========== vehicle driver ==============
export interface VehicleDriverCreate{
    vehicleId: string;
    driverId: number;
    driverType:string;
    startDate:moment.Moment;
    endDate:moment.Moment;
    reason:string;
    status?:string;

}


export interface VehicleDriverDTO{
    vehicleId: string;
    driverId: DriverDTO;
    driverType:string;
    startDate:moment.Moment;
    endDate:moment.Moment;
    reason:string;
    status?:string;
    createdDate: moment.Moment,
    createdBy:string;
}