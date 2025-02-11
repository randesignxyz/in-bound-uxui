import moment from 'moment';
import { PurchaseRequestDTO, PurchaseRequestItemCreate } from '../request/data';
import moment from 'moment';
import { PurchaseRequestDTO, PurchaseRequestItemCreate } from '../request/data';

interface PurchaseOrderCreate {
  id?: number;
  purchaseRequestId: number;
  purchaseRequestNo: string;
  referenceNumber?: string;
  purchaseOrderDate: string;
  grantAmount: number;
  discountAmount: number;
  totalAmount: number;

}


interface PurchaseOrderDTO {
  id: number;
  purchaseRequestId: number;
  purchaseRequestNo: string;
  referenceNumber?: string;
  purchaseOrderDate: string;
  // ownerBy:string;
  // ownerCode:string;
  grantAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: "pending" | "rejected" | "paid",
  items?: PurchaseRequestItemCreate[];
  purchaseRequest: PurchaseRequestDTO
}


interface PurchaseOrderItem extends PurchaseRequestItemCreate {
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

interface PurchaseOrderAdvanceSearch {
  status?: string;
  searchValue?: string;
}

interface IdRemarkParam {
  id: number;
  remark?: string;
}

