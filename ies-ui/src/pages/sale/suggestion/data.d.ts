
interface SettlementEntry{
    id?:number,
    settlementDate: moment.Moment,
    salespersonCode?: string,
    stockControlId?: number,
    cashierId: number,
    cashierName?: string,
    exchangeRate: number,
    amount: number,
    amountKH: number,
    isKeepForwarding: boolean,
    remark: string,
    storeId?: number,
    stockCountId?: number
    items?: CreateSettlementMethodDto[]
}

interface CreateSettlementMethodDto{}