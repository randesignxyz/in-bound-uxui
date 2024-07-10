import { fetchDataListService } from "@/services/apiGateway";




export type RelatedObj = {
    id: number;
    type: string;
    code: string;
    description: string;
    deptId?: number;
    requester: string;
    items: RelatedItem[]
}

export type RelatedItem = {
    id: number;
    linkedToId?: number;
    linkedToType?: string;
    itemId: number;
    itemCode: string;
    itemName: string;
    itemDescription?: string;
    qty: number;
    uom: string;
}

export const getRelatedItms = (itemId: number, objectTpe: string) => fetchDataListService<RelatedObj, { itemId: number, objectTpe: string }>({
    actionName: 'fetch-related-items',
    endpoint: 'PRO',
    payload: {
        itemId,
        objectTpe
    }
})