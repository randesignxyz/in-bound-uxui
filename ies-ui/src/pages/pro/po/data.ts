import { LookupDataItem, LookupDataItem3 } from "@/services/data"
import moment, { Moment } from "moment"


export type PoItemRefType = 'QC' | 'QUOTATION' | 'PR' | 'ITEM';

export type PoRequestListItem = {
    id: number;
    processInstId: string,
    formNo: string;
    isService: boolean;
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    contactPerson: string;
    phone1: string;
    phone2?: string;
    mailAddress?: string;
    address?: string;
    billToAddressId: number;
    billToAddressName: string;
    shipToAddressId: number;
    shipToAddressName: string;
    paymentTerm: string;
    totalAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    tax?: number;
    paymentDue: number;
    workflowStatus: string;
    postedDate: Moment;
    sapDocNo: string;
    integratedStatus?: string;
    requestedBy: string;
    createdDate: Moment
}

export type PoRequestSearchParams = {
    keyword?: string,
    status?: string,
}


export type SavePoItem = {
    id?: number;
    seq: number;
    key: string;
    baseItemId?: number;
    baseType?: string;
    itemId: number;
    itemCode: string;
    itemName: string;
    description?: string;
    price: number;
    uomId?: number;
    uomName?: string;
    qty: number;
    discountPercentage?: number;
    discountAmount?: number;
    amountAfterDiscount: number;
    amount: number;
    item: PoItemSearch,
    combineWith?: PoItemSearch[],
    linkObject: LookupDataItem3[],
    remarks?: string;
}

export type LinkedTo = {
    type: string;
    id: number;
}

export type PoRequestItem = {
    id?: number;
    seq: number;
    itemId: number;
    itemName: string;
    description?: string;
    uomId?: number;
    uomName?: string;
    discountPercentage?: number;
    discountAmount?: number;
    price?: number;
    qty: number;
    amount: number;
    remarks?: string;
    linkedTo?: LinkedTo[]
}


export type PoRequestSavePayload = {
    id?: number,
    requestor: string,
    buId: number
    comment?: string,
    vendorId: number;
    deliveredDate: Moment;
    vendorCode: string;
    vendorName: string;
    contactPersonId: number;
    contactPerson: string;
    phone1: string;
    phone2?: string;
    mailAddress?: string;
    address?: string;

    billToAddressId: number;
    billToAddressName: string;
    billToAddress: string;
    shipToAddressId: number;
    shipToAddressName: string;
    shipToAddress: string;

    paymentTermId?: number;
    paymentTerm?: string;

    totalAmount: number;
    discountPercentage?: number;
    discountAmount?: number;

    tax?: number;
    taxAmount?: number;
    paymentDue: number;
    isService?: boolean;
    remarks?: string;

    items: PoRequestItem[];

    files: string[];

}

export type PoLinkedItem = {
    id: number;
    type: string;
    code: string;
    integratedCode?: string;
    itemId: number;
    itemCode?: string;
    itemName: string;
    description: string;
    uomName?: string;
    discount: number;
    qty: number;
    price: number;
    amount: number;
    amountAfterDiscount: number;
}

export type PoRequestItemDetail = {
    id: number;
    seq: number;
    itemId: number;
    itemName: string;
    uomId: number;
    uomName: string;
    qty: number;
    price: number;
    amount: number;
    discountPercentage?: number;
    disCountAmount?: number;
    amountAfterDiscount: number;
    description: string;
    linkedItems?: PoLinkedItem[];
    remarks: string;

}

export type PoRequestDetail = {
    id: number;
    vendorId: number;
    isService: boolean;
    vendorCode: string;
    vendorName: string;
    contactPerson?: string;
    phone1: string;
    phone2?: string;
    mailAddress?: string;
    address?: string;
    billToAddressId: number;
    billToAddressName: string;
    billToAddress: string;
    shipToAddressId: number;
    shipToAddressName: string;
    shipToAddress: string;
    paymentTerm: string;
    totalAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    tax: number;
    taxAmount: number;
    paymentDue: number;
    remarks: number;
    formNo: string;
    sapDocEntry?: string;
    sapDocNo?: string;
    postedDate: Moment;
    requestedBy: string;
    workflowStatus: string;
    status?: string;
    items: PoRequestItemDetail[];
    deliveredDate?: Moment;
    integratedStatus?: string;
    files?: string[];
}

export const PoRequestFormNames = {
    processDefKey: 'po_request_process'

}

export type CompanyAddress = {
    id: number;
    name: string;
    address: string;
}

export type PoItemSearch = {
    id: number;
    baseItemId?: number;
    baseType?: string;
    refType: PoItemRefType;
    refId: number;
    itemCode: string;
    itemName: string;
    description?: string;
    uomId: number;
    uomName: string;
    price?: number;
    qty?: number;
    orderedQty?: number;
    purchasedQty?: number;
    closed?: boolean;
    amount?: number;
    uomList: LookupDataItem[],
    relatedTo?: LookupDataItem3[]
}