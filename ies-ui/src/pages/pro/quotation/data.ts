import { LookupDataItem } from "@/services/data"
import moment, { Moment } from "moment"
import { VendorDetail } from "../vendor/vendor"

export type QuotationListItem = {
    id: number;
    code: string,
    vendor: VendorDetail;
    refNo: string;
    service?: boolean;
    issuedDate: Moment;
    requiredDate: Moment;
    validUntil: Moment;
    deliveryLeadTime?: string;
    buyerId: number;
    ownerId: number;
    buyer?: LookupDataItem,
    owner?: LookupDataItem,
    totalAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    tax?: number;
    paymentDue: number;
    status: string;
    items: QuotationItemtDetail[];
    tradeTerms?: string;
    specifications?: string;
    paymentGroupId?: number;
    paymentGroup?: string;
    leadTime?: string;
    warranty: string;
    postedDate?: Moment;
    integratedDoc?: string;
    integratedStatus?: string;

}

export type QuotationSearchParams = {
    keyword?: string;
    isService?: boolean;
    vendorId?: number;
    status?: string;
    subStatus?: string;
}

export type TemporaryVendor = {
    code?: string;
    name?: string;
    contactPersonId?: number;
    contactPerson?: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    mail?: string;
    address?: string;
    paymentGroupId?: number;
    paymentGroup?: string;
}

export type QuotationItem = {
    id?: number;
    no: number;
    refType: string;
    itemId?: number;
    itemCode: string;
    itemName: string;
    description?: string;
    qty: number;
    uomId: number;
    uomName: string;
    price: number;
    amount: number;
    discountPercentage?: number;
    discountAmount?: number;
    amountAfterDiscount: number;
    remarks?: string;
    prLinked: number[]
}

export type QuotationSavePayload = {
    id?: number,
    vendorId?: number;
    vendor?: TemporaryVendor;
    refNo: string;
    issuedDate: Moment;
    requiredDate: Moment;
    validUntil: Moment;
    leadTime?: string;
    warranty?: string;
    tradeTerms?: string;
    specifications?: string;
    service: boolean;
    ownerId: number;
    buyerId: number;
    items: QuotationItem[];
    totalAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    paymentDue: number;
    tax?: number;
    files: string[];
    remarks?: string;
}

export type QuotationItemtDetail = {
    id: number;
    no: number;
    baseItemId?: number;
    baseType?: string;
    isService: boolean;
    itemId: number;
    refType: 'ITEM' | 'PR',
    itemCode: string;
    itemName: string;
    description?: string;
    service: boolean;
    uomId: number;
    uomName: string;
    qty: number;
    price: number;
    amount: number;
    discountPercentage?: number;
    disCountAmount?: number;
    amountAfterDiscount: number;
    remarks?: string;
    prLinked: number[]
    item: Item,

}

export type QuotationDetail = {
    id: number,
    code: string,
    vendor: VendorDetail;
    vendorName: string;
    contactPersonId?: number;
    contactPerson: string;
    service: boolean;
    phone1: string;
    phone2?: string;
    mail?: string;
    address?: string;
    refNo: string;
    warranty: string;
    tradeTerms?: string;
    specifications?: string;
    paymentGroupId?: number;
    paymentGroup?: string;
    issuedDate: Moment;
    requiredDate: Moment;
    validUntil: Moment;
    leadTime?: string;
    buyerId: number;
    ownerId: number;
    buyer?: LookupDataItem,
    owner?: LookupDataItem,
    totalAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    tax?: number;
    paymentDue: number;
    items: QuotationItemtDetail[];
    remarks?: string;
    attachmentFiles?: string[];
    postedDate?: Moment;
    integratedDoc?: string;
    integratedStatus?: string;
    status?: string;
    voidReason?: string;
    selectRemarks?: string;

}

export const QuotationFormNames = {
    processDefKey: 'quotation_request_process'

}

export type PrItem = {
    prId: number;
    id: number;
    processInstId?: string;
    formNo: string;
    requestedBy: string;
    docNo: string;
    qty: number;
    orderdQty?: number;
    purchaseQty?: number;
    uom: string;
    unitPrice: number;
    amount: number;
    description: string;
    remarks: string;
    default: boolean;
}


export type Item = {
    id: number;
    itemCode: string;
    refType: 'PR' | 'ITEM'
    itemName: string;
    description?: string;
    lastPurchaseCurr?: string;
    lastPurchasePrice?: number;
    uomList: LookupDataItem[];
    prItems?: PrItem[];
}

export type SaveQuotationItem = {
    no?: number;
    id?: number;
    key: string;
    refType: 'PR' | 'ITEM'
    itemId: number;
    itemCode: string;
    itemName: string;
    description?: string;
    remarks?: string;
    qty: number;
    uomId: number;
    uomName: string;
    price: number;
    amount: number;
    discount?: number;
    amountAfterDiscount: number;
    item?: Item;
    prLinked: number[]
}

export type ChangeVendorParams = {
    quotationId: number;
    vendorId: number;
    vendorCode: string;
    vendorName?: string;
    contactPersonId: number;
    contactPerson: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    mail?: string;
    address?: string;

}