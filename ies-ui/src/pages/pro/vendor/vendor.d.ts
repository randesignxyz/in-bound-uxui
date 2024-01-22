import { Moment } from "moment"

export type VendorListItem = {
    id: number;
    code: string;
    name: string;
    localName?: String,
}

export type VendorSearchParams = {
    keyword?: string,
    vendorId?: number,
    status?: string,
}

export type VendorItem = {
    id: number;
    code: string;
    name: string;
    localName?: String,
}

export type VendorSavePayload = {
    id?: number,
    requestor: string,
    buId: number
}

export type VendorAddress = {
    id: number;
    address: string;
    street?: string;
    block?: string;
    building?: string;
    city?: string;
    county?: string;
    country?: string;
    address2?: string;
    address3?: string;
}

export type VendorContact = {
    id: number;
    contactName: string;
    position?: string;
    phone?: string;
    phone1?: string;
    phone2?: string;
    email?: string;
}
export type VendorDetail = {
    id?: number,
    code?: string;
    name: string;
    contactPerson: stirng;
    phone1: string;
    phone2?: string;
    phone3?: string;
    mail?: string;
    address?: string;
    paymentGroupId?: number;
    paymentGroup?: string;
    billingAddressList: VendorAddress[];
    contactList: VendorContact[];

}