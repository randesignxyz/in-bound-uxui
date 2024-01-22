import { List } from "lodash"
import moment from "moment";
import React from "react";
import { InspectParams } from "react-dev-inspector";
import { DriverDTO } from "../driver/data";

export interface InspectionLookup {
    id: number,
    item?: string;
    itemKh?: string;
    active?: number,
    parentId?: number,
    seq?: number,
}

export interface InspectionDTO {
    id: string;
    plateNumber: string;
    rating: number;
    percentage: string;
    checked: number;
    item: number;
    duration: number,
    createdBy: string;
    createdDate: moment.Moment;
    technicianName?:string;
    inspectedBy?:DriverDTO;
    inspectionItem?: InspectionItemCreate[];
    failItem: InspectionItemCreate[],
    vehicle:string;
    status:number;
}


export interface InspectionCreate {
    id?: string;
    vehicle: string;
    inspectionType: string;
    date: moment.Moment;
    duration: number;
    technicianName?:string;
    inspectedBy?:string;
    item: InspectionItemCreate[]
}

export interface InspectionItemCreate {
    item?: string;
    itemKh?: string;
    result?: boolean,
    remark?: remark,
    id?: number;
    key: string;
    itemId?:number;
}

export interface ItemRemark {
    itemId: number,
    text: string
}

export type InspectionAdvanceParams = {
    status?: 'DAILY' | 'WEEKLY' | 'ALL';
    vehicleId?:string;
};


export interface InspectionDeleteOrVoidParam{
    id:string;
    vehicleId:string;
    status?:number;
}