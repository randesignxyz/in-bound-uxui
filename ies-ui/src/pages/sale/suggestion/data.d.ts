

interface SettleMethod{
    key?:React.Key,
    settlementMethod: string,
    currency: string,
    amount: number,
    exchangeRate?: number,
    referenceNo?: string,
    bankName?: string,
    attachments?: string[] 
}

interface SettlementEntry {
    id?: number = 0,
    settlementDate: moment.Moment,
    salespersonCode?: string,
    stockControlId?: number,
    cashierId?: number,
    cashierName?: string,
    exchangeRate?: number,
    amount: number,
    amountKH: number,
    isKeepForwarding?: boolean,
    remark?: string,
    storeId?: number,
    stockCountId?: number,
    items?: SettleMethod[] 
}