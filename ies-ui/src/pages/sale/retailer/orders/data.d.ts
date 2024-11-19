import type moment from 'moment';

// export class StoreType {
//   static WHOLESALER: string = 'wholesaler';
//   static MPU: string = 'mpu';
//   static MOBILE_SALE: string = 'mobile';
// }

// export type StoreType = {
//   WHOLESALER: string = 'wholesaler';
// };

export interface OrderPayload {
  orderId: string;
  status: 'new' | 'update';
  customerName: string;
}

export interface CustomerDistance {
  id: number;
  addressId: number;
  code: string;
  name: string;
  internalName: string;
  phone1: string;
  phone2: string;
  phone3: string;
  latitude: string;
  longitude: string;
  distance: number;
}

export type PurchaseOrderDto = {
  id: string;
  referenceNo: stringl;
  orderedDate: moment.Moment;
  orderedStatus: string;
  remark?: string;
  discount: number;
  vatAmount?: number;
  amount: number;
  totalAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  customerFirstName?: string;
  customerLastName?: string;
  contactName?: string;
  contactPhone?: string;
  contactLatitude?: number;
  contactLongitude?: number;
  contactAddress?: string;
  contactLabel?: string;
  referenceCode?: string;
  referencePhone?: string;
  storeType?: string;
  createdDateHistory?: moment.Moment;
  createdByHistory?: string;
  remarkHistory?: string;
  customerId: string;
};

export type OrderDto = {
  id: string;
  referenceNo: string;
  orderedDate: moment.Moment;
  // canceledDate?: moment.Moment;
  orderedStatus: string;
  remark: string;
  discount: number;
  vatAmount: number;
  amount: number;
  totalAmount: number;
  customerId: string;
  customerFullName: string;
  customerPhone: string;
  // customer: CustomerDto;
  vatId: string;
  orderStatusHistory?: OrderStatusHistory[];
  // storeId?: StoreDTO;
  items?: OrderItems[];
  paymentStatus?: string;
  paymentMethod?: string;
  contactName?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactLatitude?: number;
  contactLongitude?: number;
  // shippingTo: {
  //   firstName: string;
  //   lastName?: string;
  //   phoneNumber: string;
  //   label: string;
  //   address: string;
  //   latitude?: number;
  //   longitude?: number;
  // };
  delivery?: {
    id: string;
    storeType: string;
    referenceCode: string;
    referencePhone?: string;
    comment?: string;
  };
  tracking: [
    {
      entity: string;
      entityId: string;
      createdBy: string;
      createdDated: moment.Moment;
      reason: string;
    },
  ];
};

export type OrderItems = {
  id: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  // product: ProductDto;
  status: string;
  // orderId: string;
  productName: string;
  productCode: string;
  // productDescription: string;
  sequence: number;
};

export type CountOrder = {
  pending?: number;
  accepted?: number;
  assigned?: number;
  ontheway?: number;
  delivered?: number;
  acceptDelivered?: number;
  canceled?: number;
  rejected?: number;
};

export type OrderAdvanceParams = {
  status?:
  | 'pending'
  | 'accepted'
  | 'ALL'
  | 'ontheway'
  | 'accept_delivered'
  | 'delivered'
  | 'rejected'
  | 'canceled'
  | 'assigned';
};

export type OrderStatusHistory = {
  previousStatus: string;
  currentStatus: string;
  createdBy: string;
  remark?: string;
  createdDate: moment.Moment;
};

export type OrderStatusHistoryCreate = {
  id: string;
  status?: string;
  remark?: string;
  assignTo?:
  | {
    storeType: string;
    referenceCode: string;
    referencePhone?: string;
    comment?: string;
  }
  | undefined;
};

export type OrderDeliveryParam = {
  id: string;
  orderId: string;
  status: string;
  remark: string;
};

export type DeleteOrderItemParam = {
  orderId: string;
  orderItemId: string;
  reason: string;
};

export type DeliveryCreate = {
  storeId: string;
  orderId: string;
  deliveryBoyId: string;
  remark: string;
};

export type GoogleEntity = {
  visible: boolean;
  id: string;
  lat: number;
  lng: number;
  name: string;
  internalName: string;
  phone: string;
};
