import { MaintenanceCreate } from "../maintenance/data";
import { ServiceReminderCreate, ServiceReminderDTO } from "../servicereminder/data";

export interface ServiceTasksDTO{
    id:number;
    name:string;
    description:string;
    entity?:number;
    reminder?:number;
    program?:string;
    status:string;
    serviceTaskVehicle?:ServiceTaskVehicleDTO,
}

export interface ServiceTasksCreate{
    id?:number;
    name:string;
    description?:string;
    subTasks?:[];
    status:string

}
export interface ServiceTasksAdvansearch{
    status?:"ALL"|"Active"|"Inactive";
    id?:number
}

export interface ServiceTasksSearch{
    status?:"ALL"|"Active"|"Inactive";
    searchValue?:string;
    id?:number;
    advanceSearch?: ServiceTasksAdvansearch;
}


export interface ServiceTaskVehicleDTO{
    id:number;
    vehicleId:string;
    serviceTaskId:number;
}