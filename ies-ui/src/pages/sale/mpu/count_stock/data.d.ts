import { Moment } from "moment";

interface StockCountDto{
    id: number,
    storeId: number,
    storeCode?: string,
    countedNo: string,
    totalQuantity: number,
    soldQuantity: number,
    uselessQuantity: number,
    countedDate: Instant,
    fromDate: moment.Moment,
    endDate: moment.Moment,
    salespersonCode: string,
    salespersonName: string,
    countedInvoices: number,
    soldAmount: number,
    exchangeRete: number,
    remark?: string,
    status:"Pending"|"Rejected"|"Approved"|string;
    items?: StockCountItemDto[];
    comment?:comments[];
}

interface StockCountItemDto{
    id: number,
    stockCountId?: number,
    itemId: number,
    itemName: string,
    itemCode: string,
    itemDescription?: string,
    itemType: string,
    batchNo?: string,
    stockCategoryId: number,
    uom?: string,
    beginQuantity: number,
    requestQuantity: number,
    soldQuantity: number,
    systemQuantity: number,
    actualQuantity: number,
    remark?: string,
    targetType?: string,
    targetCode?: string,
}

interface CountStockAdvanceSearch{
    status:string;
    searchValue?:string
}

interface Comment {
    id?:number;
    referentId?:number;
    referentStringId?:string;
    source?:string;
    description:string;
    type?:string;
    createdBy?: string;
    createdDate?: Moment.moment
}