import { ContactType } from "@/pages/crm/contract/model";
import {  LookupDataItem } from "@/services/data";
import moment from "moment";
import { ActionData } from "../process-workflow/data";

export interface ContractData {
    id?: number;
    amended?: boolean;
    contractTypeId: number;
    subContractTypeId: number;
    customerId: number;
    contractDate: moment.Moment;
    effectiveDate: moment.Moment;
    expiryDate: moment.Moment;
    exclusiveProductIds?: number[];
    customerDisplays?: number[];
    displayOfferIds?: number[];
    displayProducts?: ({
        productId: number;
        qty: number;
    } | {})[];
    settlementPlanId: number;
    offerFrequencyId: number;
    sponsorItems?: ({
        itemId: number;
        qty: number;
    } | {})[];
    remarks?: string;
    attachmentFileIds?: string[];
    incentiveSchemeTier1?: string;
    incentiveSchemeTier2?: string;
    incentiveSchemeTier3?: string;
    incentiveSchemeRemarks?: string;
    contractDuration?: string;
   
}

export interface ContractDataView {
    id: number;
    contractType: ContactType;
    contractStatus: string;
    customerId: number;
    contractDate: moment.Moment;
    effectiveDate: moment.Moment;
    expiryDate: moment.Moment;
    settlementPlanId: number;
    offerFrequencyId: number;
    exclusiveProductIds?: number[];
    displayProducts: {
        productId: number;
        qty: number;
    }[];
    sponsorItems: {
        itemId: number;
        qty: number;
    }[];
    optionList: {
        id: number;
        type: 'CUSTOMER_DISPLAY' | 'OFL_OFFER' | 'EXCLUSIVE_PRODUCT';
    }[]
}

export interface SubContractType {
    id: number;
    name: string;
    budgetCode: string;
    incentive: string;
}


export interface ContractLess {
    id: number;
    contractNo?: string;
    contractDate: moment.Moment;
    contractType: string;
    brand: string;
    subContract: SubContract;
    customer: LookupDataItem;
    effectiveDate: moment.Moment;
    expiryDate: moment.Moment;
    terms?: string;
    duration: number;
    daysLeft: number;
    budgetCode: string;
    refNo?: string;
    status?: string;
}


export interface SubContract {
    id: number;
    name: string;
    budgetCode: string;
}

export interface SettlementPlan {
    id: number;
    fromDate: moment.Moment;
    toDate: moment.Moment;
    processDate: moment.Moment;
    contractNo: string;
    businessName: string;
    item: string;
    totalQty: number;
    totalCash: number;
    remark?: string;
    internalRemark?: string;
    status: string;
}

export type OptionType = 'CONTRACT_STATUS'
    | 'SETTLEMENT_PLAN'
    | 'CUSTOMER_TYPE'
    | 'DISPLAY_A'
    | 'DISPLAY_B'
    | 'EXCLUSIVE_PRODUCT'
    | 'CUSTOMER_DISPLAY'
    | 'WEEK_OF_MONTH'
    | 'DAY_OF_WEEK'
    | 'OFL_OFFER'

export interface ContractFull {
    id: number;
    customer: LookupDataItem;
    business: LookupDataItem;
    contractType: LookupDataItem;
    subContractType: LookupDataItem;
    budgetCode: String;
    contractNo: string;
    refNo: string;
    contractDate: moment.Moment;
    effectiveDate: moment.Moment;
    expiryDate: moment.Moment;
    durationInMonths: number;
    daysLeft: number;
    frequencySettlement: string;
    settlementPlan?: string;
    shippingChannel: LookupDataItem;
    offerFrequency: string
    optionList: { value: string, type: OptionType }[];
    contractItemList: ItemView[];
    otherInfo?: string;
}

export interface ItemView {
    item: LookupDataItem;
    quantity: number;
    type: 'PURCHASE_EST' | 'ITEM_SPONSOR' | 'PRODUCT_DISPLAY';
}


export interface SettlementPlanRs {
    id: number,
    scheduledDate: string,
    total: number,
    isSettled: boolean;
    items: { item: { id: number, name: string }, qty: number }[]
}

export interface SettlementPlanItem {
    id?: number;
    date: moment.Moment;
    offers?: SponsorItem[];
    scheme?: string;
    total: number;
    status: 'Claim' | 'Claimed' | 'N/A'
}
export interface SponsorItem {
    id: number;
    item: { id: number, name: string };
    qty: number
}

export interface SubContractType {
    id: number;
    name: string;
    budgetCode: string;
    incentive: string;
}

export interface CompleteContractData {
    formNo: string
    contractId: number
    contractNo: string
    firstCycleDate?: moment.Moment
    firstSponsorItems?:  { itemId: number; qty: number; }[]
    initCommentKh?: String
    initComment?: String
    actionData: ActionData
}