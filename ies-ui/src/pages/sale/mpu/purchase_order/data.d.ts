import { PurchaseRequestDTO, PurchaseRequestItemCreate } from "../request/data";


interface PurchaseOrderCreate{
    id?:number;
    purchaseRequestId:number;
    purchaseRequestNo:string;
    referenceNumber?:string;
    purchaseOrderDate:string;
    grantAmount:number;
    discountAmount:number;
    totalAmount:number;
    latitude?:string;
    longitude?:string;
    items?:PurchaseRequestItemCreate[];
    distributorCode?:string;
    distributorName?:string;
    distributorPhone?:string;
    distributorId?:number;
}


interface PurchaseOrderDTO{
    id:number;
    purchaseOrderCode?:string;
    purchaseRequestId:number;
    requestedCode:string;
    referenceNumber?:string;
    purchaseOrderDate:string;
    // ownerBy:string;
    // ownerCode:string;
    requestedBy:string;
    assignedTo?:string;
    assignedToCode?:string;

    
    grantAmount:number;
    discountAmount:number;
    totalAmount:number;
    status: "Pending"|"Rejected"|"Paid",
    items?:PurchaseRequestItemCreate[];
    purchaseRequest:PurchaseRequestDTO;
    requestedCode:string;
    distributorCode?:string;
    distributorName?:string;
    distributorPhone?:string;
    distributorId?:number;
    latitude?:string;
    longitude?:string;
    addressId?:number;
    foc?:{qty:number; itemName:string;itemCode:string; uom?:string}[]
}


interface PurchaseOrderItem extends PurchaseRequestItemCreate{
    // purchaseOrderId:number;
    // map(arg0: (r: any, index: any) => any): import("react").SetStateAction<PurchaseRequestItemCreate[] | undefined>;
}
    // id:number;
    // itemId:number;
    // itemName:string;
    // itemCode:string;
    // stockCategoryId:number;
    // stockCategoryName:string;
    // quantity:number;
    // uom:string;
    // pricing:string;
    // status?:string;


interface PurchaseOrderAdvanceSearch{
    status?:string;
    searchValue?:string;
}

interface IdRemarkParam{
    id:number;
    remark?:string
}