
export type SupplySource = {
    id: number;
    entity: {
        id: number;
        name: string;
    }
    entityType: {
        id: number;
        name: string;
    }
    distributor: {
        id: number;
        code: string;
        name: string;
    };
    remarks?: string;
}

export type  SaveSupplySourceParams = {
    id?: number;
    entityId: number;
    customerId: number;
    entityTypeId: number;
    distributorId: number;
    remarks?: string;
}


export type SavePosmItemCheckedParams = {
    posmId: number;
    qty: number;
    actualQty: number;
    itemCheckedStatus: number;
    checkedStatus: number;
    remarks?: string;
}