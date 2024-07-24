
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
}