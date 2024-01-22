import moment from "moment";
import { LookUpDataDTO } from "../lookupData/data";
import { DriverDTO } from "../driver/data";

export interface AccidentDTO {
    id: string;
    vehicleId: string;
    driverName: DriverDTO;
    payment: number;
    accidentDate: moment.Moment;
    accidentType:LookUpDataDTO;
    weather:LookUpDataDTO;
    lightConditions:LookUpDataDTO;
    preAccident:LookUpDataDTO;
    locationAccident:string;
    description:string;
    createdDate:moment.Moment;
    lastModifiedBy:string;
    createdBy:string;
    policeReport: boolean;
    attacheFile?: AttachmentFiles[];
}

export interface AccidentCreate {
    vehicleId?: string;
    driverName: number;
    attacheFile: string[];
    payment: number;
    accidentDate: moment.Moment;
    accidentType:number;
    weather:number;
    lightConditions:number;
    preAccident:number;
    locationAccident:string;
    description:string;
}

export interface AccidentAdvanceSearch{
    status:string;
}

export interface SearchAccidentParam {
    searchValue?: string;
    // status:string,
    // advanceSearch:AccidentAdvanceSearch
}