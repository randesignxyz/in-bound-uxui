import { Comment, StockCountDto } from "../count_stock/data";
import { PurchaseOrderDTO } from "../purchase_order/data";

interface SettlementMethodDetailDTO{
    id:number;
    settlementDate:moment.Moment,
    salespersonCode:string;
    stockControlId:number;
    cashierId:number;
    cashierName:string;
    exchangeRate:number;
    amount:number;
    amountKH:number;
    isKeepForwarding:boolean;
    remark:string;
    storeId?:number;
    stockCountId:number;
    items?:SettlementMethodDto[];
    attachments?:string[];
    status:string |"Completed"|"Pending"|"Rejected";
    comment?:Comment[];
    purchaseOrder?:PurchaseOrderDTO[]
    stockCount?:StockCountDto
}

interface SettlementMethodDto{
     settlementMethod: string,
     currency: string,
     amount: number,
     exchangeRate: number,
     referenceNo?: string,
     bankName?: string,
}

interface SettlementMethodAdvanceSearch{
    searchValue?:string;
    status?:string;
    startDate?:moment.Moment;
    endDate?:moment.Moment;
    type:string
}

interface StatusActionForm{
    id?:number;
    status?:string;
    remark?:string;
}