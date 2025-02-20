import moment from 'moment';
import { PurchaseRequestDTO, PurchaseRequestItemCreate } from '../request/data';

interface PurchaseOrderCreate {
  id?: number;
  assignedTo: string;
  purchaseOrderDate: string;
  latitude?: string;
  longitude?: string;
  items?: PurchaseRequestItemCreate[];
  distributorId: string;
  address?: string;
  addressId?: number;
  addressCode?: string;
  remark?: string;
}

interface PurchaseOrderDtoCreate {
  id?: number;
  assignedTo: string;
  assignedToCode: string;
  purchaseOrderDate: moment.Moment;

  latitude?: string;
  longitude?: string;

  distributorId: string;
  distributorCode: string;
  distributorName: string;
  address?: string;
  addressId?: number;
  addressCode?: string;
  remark?: string;

  grantAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  items?: PurchaseRequestItemCreate[];
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
  addressCode?: string;
  remark?: string;
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
  orderedDate?: string[];
  searchValue?: string;
  salespersonId?: number;
}

interface IdRemarkParam {
  id: number;
  remark?: string;
}
