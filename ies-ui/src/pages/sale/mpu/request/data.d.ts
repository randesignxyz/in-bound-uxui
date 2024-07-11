import { ContactData } from "@/services/crm/contact";
import { Address } from "@/services/crm/data";

interface PurchaseRequestDTO {
    id: number;
    purchaseRequestId: number,
    purchaseRequestNo: string,
    referenceNumber?: string,
    purchaseOrderDate: moment.Moment,
    ownerBy: string,
    ownerCode: string,
    distributorId?:number;
    distributorCode?:string;
    distributorName?:string
    distributorPhone?:string;
    latitude?:string;
    longitude?:string;
    status: "pending"|"rejected"|"closed"|"partial",
    grantAmount: number,
    discountAmount: number,
    totalAmount: number,
    createdBy: string?,
    createdDate?: moment.Moment
    lastModifiedBy?: string
    lastModifiedDate?: moment.Moment;
    items:PurchaseRequestItemCreate[];
    assignedToCode?:string;
    assignedTo:string;
}

interface PurchaseRequestCreate {
    id?: number;
    distributor?: DistributorCreate,
    assignedTo?: string,
    assignedToCode?: string,
    totalAmount?: number,
    grantAmount?: number,
    discountAmount?: number,
    items:PurchaseRequestItemCreate[]
}

interface PurchaseRequestItemCreate {
    id: any;
    key: string;
    itemId: number,
    stockCategoryId: number,
    quantity: number,
    pricing: number,
    total: number;

}



interface PurchaseReqeustAdvanceSearch {
    status?: string;
}

interface CustomerInfo {
    code: stirng;
    name: string;
    id: number;
    address?: Address;
    contact?: ContactData
}

interface DistributorCreate {
    id?: number,
    name?: string,
    code?: string,
    phone?: string,
    latitude?: string,
    longitude?: string,
}

interface PurchaseRequestItemCreate {
    itemId: number,
    stockCategoryId: number,
    quantity: number,
    pricing: number,
    code: string,
    uom: string?,
    name: string,
    stockCategoryName: string,
}
