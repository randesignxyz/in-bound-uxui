import { RequisitionDetailResponse } from "@/services/pro/data";
import { QuotationDetail, QuotationListItem } from "../quotation/data";
import { LookupDataItem } from "@/services/data";
import moment, { Moment } from "moment";
import { SummaryTypes } from "./DataEntryView";

export type PriceComparisonListItem = {
    id: number;
    requisition: LookupDataItem;
    processInstId: string;
    formNo: string;
    remarks: string;
    priceOfferedTime: number;
    justifications?: string;
    quotations?: PriceComparisonItemQuotation[],
    vendorCode: string;
    vendorName: string;
    requestedDate: moment.Moment;
    isService: boolean;
    requestedBy: moment.Moment;
    workflowStatus: string;
    status?: string

}

export type PriceComparisonSearchParams = {
    keyword?: string,
    isService?: boolean;
    quotationIds?: number[];
    type?: string;
    status?: string,
    searchValue?: string;
    workflowStatus?: string;
}

export type PriceComparisonItemQuotation = {
    quotationId: number;
    quotationNo: string;
    vendorId: number;
    vendorCode?: string;
    vendorName: string;
    priceOffer: number;
    selected: boolean;
    price: number;
    integratedStatus?: string;
}

export type PriceComparisonItem = {
    id?: number;
    itemId: number;
    seq: number;
    itemCode?: string;
    itemName: string;
    description?: string;
    targetPrice: number;
    qty: number;
    uomId?: number;
    uomName?: string;
    quotationList: PriceComparisonItemQuotation[]
}

export type PriceComparisonOtherCostItem = {
    vendorId: number;
    priceOffer: number;
    amount?: number;
    text?: string;
    selected: boolean;
}

export type PriceComparisonOtherCost = {
    type: string;
    key?: string;
    providerName: string;
    seq: number;
    items: PriceComparisonOtherCostItem[]

}

export type PriceComparisonSavePayload = {
    id?: number;
    processDef: string;
    formKey: string;
    buId: number;
    requestor: string;
    isService: boolean;
    remarks: string;
    justifications?: string;
    items: PriceComparisonItem[];
    otherCostItems: PriceComparisonOtherCost[];
    files: string[];
    acceptedBy: string;
    acceptedFunctionId: number;
    acceptedFunction: string;
}


export type PriceComparisonQuotationRs1 = {
    id: number;
    quotationId: number;
    quotationNo: string;
    priceOffer: number;
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    price: number;
    selected: boolean;
}

export type PriceComparisonItemRs1 = {
    id: number;
    itemId: number;
    seq: number;
    itemCode: string;
    baseItemId?: number;
    baseType?: string;
    itemName: string;
    description?: string;
    qty: number;
    targetPrice?: number;
    uomId: number;
    uomName: string;
    items: PriceComparisonQuotationRs1[]
}

export type PriceComparisonOtherCostItemRs = {
    id: number;
    priceOffer: number;
    vendorId: number;
    amount?: number;
    selected: boolean;
    text?: string;
}

export type PriceComparisonOtherCostRs = {
    id: number;
    providerName: string;
    type: SummaryTypes;
    seq: number;
    items: PriceComparisonOtherCostItemRs[]
}

export type PriceComparisonDetail = {
    id: number;
    formNo: string,
    justifications?: string,
    status?: string,
    workflowStatus: string;
    createdBy: string,
    createdDate: Moment,
    lastModifiedBy?: string;
    lastModifiedDate?: Moment;
    isService: boolean;
    items: PriceComparisonItemRs1[];
    otherCosts: PriceComparisonOtherCostRs[];
    attachedFiles: string[];
    quotations?: PriceComparisonItemQuotation[],

}

export type PriceComparisonItemDetail = {
    id: number;
}

export interface RequisitionDetailWithQuotatopmResponse extends RequisitionDetailResponse {
    quotationList: QuotationDetail[]
}

export type PriceCompareQuotationItem = {
    id: number;
    quotationId: number;
    quotationNo: string;
    issuedDate: Moment;
    createdBy: string;
    vendor: LookupDataItem;
    description?: string;
    uom: LookupDataItem;
    qty: number;
    price: number;
    amount: number;
    requisitionList: LookupDataItem[];
    offerType?: 'first' | 'last' | undefined;
    singleQuote?: true;
}

export type PriceComparisonItemRs = {
    id?: number;
    itemCode: string;
    itemName: string;
    onRequestQty: number;
    targetPrice?: number;
    uomList: LookupDataItem[];
    quotationItems: PriceCompareQuotationItem[]
}