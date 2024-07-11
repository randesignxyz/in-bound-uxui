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
    orderedQty?: number;
    purchasedQty?: number;
    availableQty?: number;
    uom: string;
    price: number;
}

export const getRelatedItms = (
    itemId: number,
    objectTpe: string,
    isService?: boolean
) => fetchDataListService<RelatedObj, {
    itemId: number,
    objectTpe: string;
    isService?: boolean
}>({
    actionName: 'fetch-related-items',
    endpoint: 'PRO',
    payload: {
        itemId,
        objectTpe,
        isService
    }
})