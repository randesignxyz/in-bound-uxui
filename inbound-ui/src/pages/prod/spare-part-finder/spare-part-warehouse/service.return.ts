import { ServiceApiType, RequestActions, singleRequest } from "@/services/apiGateway";
import { Paging } from "@/services/API";

// ─── Item type for confirm-return ──────────────────────────────────────────────
export interface WarehouseConfirmReturnItem {
    returnItemId: number;
    receivedProductId?: string;
    receivedQty: number;
    goodQty: number;
    damagedQty: number;
    remark?: string;
    damageMessages?: string;
    damageImage?: string[];
}

const SparePartReturnAction = {
    paga_fetch_spare_parts_return_by_status_approved: (
        page: number = 0,
        pageSize: number = 20,
        returnDateFrom?: string,
        returnDateTo?: string,
        status?: string,
    ): ServiceApiType<any> => ({
        type: "PAGING_QUERY",
        actionName: "fetch-spare-parts-return-by-status-approved",
        endpoint: "PROD",
        payload: {
            returnDateFrom,
            returnDateTo,
            status: mapReturnStatusFilter(status),
        },
        pagination: { page, pageSize },
    }),
    warehouse_confirm_return: (
        returnId: number,
        remark: string,
        items: WarehouseConfirmReturnItem[]
    ): ServiceApiType<any> => ({
        type: "EXEC",
        actionName: "warehouse-confirm-return",
        endpoint: "PROD",
        payload: {
            returnId,
            remark,
            items,
        },
    }),
    update_damage_images_return: (
        returnItemIds: number[],
        images: string[],
    ): ServiceApiType<any> => ({
        type: "EXEC",
        actionName: "update-damages-images-return",
        endpoint: "PROD",
        payload: {
            returnItemIds,
            images,
        },
    }),
    delete_damage_images_return: (
        returnItemIds: number[],
        images: string[],
    ): ServiceApiType<any> => ({
        type: "EXEC",
        actionName: "delete-damages-images-return",
        endpoint: "PROD",
        payload: {
            returnItemIds,
            images,
        },
    }),
};

const SparePartWarehouseReturnAPI = (requestAction: RequestActions) => {
    return {
        paga_fetch_spare_parts_return_by_status_approved: async (
            page: number = 0,
            pageSize: number = 20,
            returnDateFrom?: string,
            returnDateTo?: string,
            status?: string,
        ): Promise<Paging<any>> => {
            const res = await singleRequest<any>(
                SparePartReturnAction.paga_fetch_spare_parts_return_by_status_approved(page, pageSize, returnDateFrom, returnDateTo, status)
            )(requestAction);
            return res as Paging<any>;
        },
        warehouse_confirm_return: async (
            returnId: number,
            remark: string,
            items: WarehouseConfirmReturnItem[]
        ): Promise<any> => {
            const res = await singleRequest<any>(
                SparePartReturnAction.warehouse_confirm_return(returnId, remark, items)
            )(requestAction);
            return res;
        },
        update_damage_images_return: async (
            returnItemIds: number[],
            images: string[],
        ): Promise<any> => {
            const res = await singleRequest<any>(
                SparePartReturnAction.update_damage_images_return(returnItemIds, images)
            )(requestAction);
            return res;
        },
        delete_damage_images_return: async (
            returnItemIds: number[],
            images: string[],
        ): Promise<any> => {
            const res = await singleRequest<any>(
                SparePartReturnAction.delete_damage_images_return(returnItemIds, images)
            )(requestAction);
            return res;
        },
    };
};

const mapReturnStatusFilter = (status?: string) => {
    const normalized = String(status || '').trim().toUpperCase();
    if (!normalized || normalized === 'ALL') return undefined;
    if (normalized === 'COMPLETED') return 'COMPLETE';
    return normalized;
};

export { SparePartWarehouseReturnAPI };
