

namespace domain.delivery {

    export interface Outsource {
        id: number;
        name: string;
        gender?: string;
        phone?: string;
    }

    export interface DeliveryItem {
        id: int;
        outsourceId: number;
        outsource: string;
        settledOn: number;
        settledCode: string;
        createdDate: number;
        preparedBy: string;
        amount: number;
        status: string;
        completedBy?: string;
        completedDate?: string;
        completedRemarks?: string;
        submittedBy?: string;
        submittedDate?: string;
        submittedRemarks?: string;
        docRef?:string;
        reconcile?:boolean;
    }

    export interface DeliveryInitLookupData {
        outsource?: LookupData[];
    }

    export interface AddInventory {
        outsourceId: number;
        settledOn: number;
    }

    export interface DeliveryInvoice {
        id: number;
        invoiceNo: string;
        issuedDate: number;
        receivedDate: number;
        createdDate: number;
        modifiedDate?: number;
        amount: number;
        comment?: string;
    }

    export interface DeliveryDetail {
        item: DeliveryItem,
        invoiceList: DeliveryInvoice[]
    }


    export interface InvoiceDetail {
        item: DeliveryInvoice,
        invoiceItemList: DeliveryNote[]
    }

    export interface SaveInvoice {
        id?: number;
        deliveryId: number,
        invoiceNo: string, 
        receivedDate: moment.Moment, 
        issuedDate: moment.Moment, 
        comment?: string
        invoiceItems: SaveInvoiceItem[] 
    }

    export interface SaveInvoiceItem {
        id?: number;
        docEntry: number;
        qty: number;
        amount: number;
        comment?: string;
    }

    export interface DeliveryNote {
        id?: number;
        docEntry: number;
        docNo: string;
        deliveryDate: number;
        customerNo: string;
        customerName: string;
        qty: number;
        amount: number;
        checkedAmount: number;
        comment?: string;
        baseCurrAmount: number;
        itemList:  DeliveryCostItem[];
    }

    export interface DeliveryCostResult {
        item: DeliveryCost;
        itemList:  DeliveryCostItem[];
    }

    export interface DeliveryCost {
        docEntry: number;
        docNo: string;
        docDate: number;
        customerNo: string;
        customerName: string;
        province: string;
        district: string;
        commune: string;
        place: string;
        qty: number;
        baseCurrAmount?:number;
        settledCode: string?;
        invoiceNo: string?;
        modifiedBy: number?,
        modifiedDate: number?,
        itemList:  DeliveryCostItem[];
    }

    export interface DeliveryCostItem {
        itemNo: string;
        itemName: string;
        qty: number;
        unit: number?;
        uom: string?;
        price: number?;
        amount: number?;
        baseCurrAmount:number?;
    }

    export interface DeliveryDest {
        id: number,
        province: string,
        place: string
    }

    export interface OutsourcePrice {
        id: number;
        destCode: string;
        province: string;
        place?: string;
        description : string;
        uom: string;
        type: string;
        productTypeId: number,
        productTypeName: string,
        effectiveDate: number;
        expiryDate?: number;
        priceItems: OutsourcePriceItem[];
    }

    export interface OutsourcePriceItem {
        id: number;
        itemCode: string;
        itemName: string;
        shortName: string;
        unit: number;
        price: number;
        currency: string;
    }

    export interface PricePlace {
        id: number;
        code: string;
        province: string;
        place?: string;
        description: string;

    }

    export interface DeliveryItem {
        id: number,
        code: string,
        name: string,
        shortName: string
    }
    export interface Activity {
        id: string;       
        action: string;
        actionBy: string;
        actionDate: moment.Moment;
        comment?: string;
        deliverySettlemntId?: number;
      }

}
//End domain
export interface DeliveryCost {
    docEntry: number;
    docNo: string;
    docDate: moment.Moment;
    customerNo: string;
    customerName: string;
    province: string;
    district: string;
    commune: string;
    place: string;
    qty: number;
    baseCurrAmount?:number;
    settledCode: string?;
    invoiceNo: string?;
    modifiedBy: number?,
    modifiedDate: number?,
    itemList:  DeliveryCostItem[];
    cancelled?:string;
}
export interface DeliveryNoteFinder {
    docEntry: number;
    docNo: string;
    docDate: moment.Moment;
    customerNo: string;
    customerName: string;
    province: string;
    district: string;
    commune: string;
    place: string;
    qty: number;
    baseCurrAmount?:number;
    settledCode?: string;
    invoiceNo?: string;
    modifiedBy?: number,
    modifiedDate?: number,
    itemList:  DeliveryCostItem[];
    cancelled?:string;
    settleStatus?:string;
    claimedBy?: string,
    claimedDate?: moment.Moment;
    settledOn?:string;
    settledId?:number;
    outsourceId?:number;
    outsourceName?:string;
}

export interface DeliveryCostItem {
    itemNo: string;
    itemName: string;
    qty: number;
    unit: number?;
    uom: string?;
    price: number?;
    amount: number?;
    baseCurrAmount:number?;
}

export interface DeliveryDetail {
    item: DeliveryItem,
    invoiceList: DeliveryInvoice[]
}

export interface SaveInvoiceItem {
    id?: number;
    docEntry: number;
    qty: number;
    amount: number;
    comment?: string;
}

export interface DeliveryInvoiceItem{
    id: number;
    invoiceId?:number;
    docEntry?: number;
    qty: number;
    amount: number;
    comment?: string;
    createdBy?: string;
    createdDate?: moment.Moment;
}
export interface DeliverySettlementActivity{
    id: number;
    action?:string;
    actionBy?: string;
    actionDate?: moment.Moment;
    comment?: string;
    diliverySettlmentId?:number;
}