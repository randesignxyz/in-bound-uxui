import { LookupDataItem } from "@/services/shared/data";
import moment, { Moment } from "moment";

export const SaleStockTranferRequestFormNames = {
    processDefKey: 'stock_transfer_request_process',
    start: 'stock_transfer_request_process',
    supervisorApproval: 'stock_transfer_request_supervisor_approval',
    warehouseTransfer: 'stock_transfer_request_warehouse_transfer',
};


export type StockTransferItem = {
    itemId: number;
    requestItemId: number;
    batchNo?: string,
    expiryDate?: moment.Moment;
    qty: number;
    uom: string,
    remarks?: string
}
export type StockTransfer = {
    requestId: number;
    items: StockTransferItem[]
}

export type StockTransferRequestItem = {
    id: number;
    itemId: number;
    itemCode: string;
    itemName: string;
    description?: string;
    description2?: string;
    description3?: string;
    categoryId: number;
    categoryName: String;
    qty: number;
    uom: string;
    remarks?: string;
}

export type StockTransferRequest = {
    id: number,
    storeName: string,
    stockController: string,
    truckNo: string,
    stockControlDate: Moment,
    salespersonList: LookupDataItem[],
    status: String,
    requestedBy: String,
    requestedDate: Moment,
    remarks?: string,
    items: StockTransferRequestItem[]
}