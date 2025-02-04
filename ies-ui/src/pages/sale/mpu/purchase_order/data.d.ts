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
  latitude?: string;
  longitude?: string;
  items?: PurchaseRequestItemCreate[];
  distributorCode?: string;
  distributorName?: string;
  distributorPhone?: string;
  distributorId?: number;
  address?: string;
}

interface PurchaseOrderDTO {
  id: number;
  purchaseOrderCode?: string;
  purchaseRequestId: number;
  requestedCode: string;
  referenceNumber?: string;
  //   purchaseOrderDate: string;

  requestedDate?: moment.Moment;
  purchaseOrderDate?: moment.Moment;
  // ownerBy:string;
  // ownerCode:string;
  requestedBy: string;
  assignedTo?: string;
  assignedToCode?: string;

  grantAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'Pending' | 'Rejected' | 'Paid';
  items?: PurchaseRequestItemCreate[];
  purchaseRequest: PurchaseRequestDTO;
  requestedCode: string;
  distributorCode?: string;
  distributorName?: string;
  distributorPhone?: string;
  distributorId?: number;
  latitude?: string;
  longitude?: string;
  addressId?: number;
  address?: string;
  foc?: { qty: number; itemName: string; itemCode: string; uom?: string }[];
}

type PurchaseOrderItem = PurchaseRequestItemCreate;
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
