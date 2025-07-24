export interface allocateSearch {
    searchValue?: string;
    date?: moment.Moment;
}

export interface Allocate {
    id: string,
    so_entry?: string,
    so_num?: string,
    so_date?: string,
    customer_code?: string,
    customer_name?: string,
    total_amount?: string,
    total_order_qty?: string,
    so_status?: string,
    last_sync?: string,
    item_count?: number,
    percentage?:number
}

export interface SOList{
   id: string,
  soNo?: string,
  orderedDate: string,
  poNo?: string,
  province?: string,
  region?: string,
  customerId: string,
  customerCode: string,
  customerName: string,
  salespersonId: string,
  salespersonCode: string,
  salespersonName: string,
  shippingAddress: string,
  amount: string,
  vatAmount: string,
  discountAmount: string,
  totalAmount: string,
  status: string,
  source: string,
  postedBy?: string,
  postedDate?: string,
  docEntryNum: string,
  deliveries: DeliveryList[]
}

export interface DeliveryList{
  id: string,
  soId: string,
  deliveryDate: string,
  shippingAddress?: string,
  priority?:string,
  remarks?:string,
  shift?:string,
  deliveryItems: DeliveryItemList[]
}

export interface DeliveryItemList{
 id: string,
 deliveryId: string,
 itemName: string,
 itemCode: string,
 qty: number,
 saleType: string
 dn:DeliveryDnParams[]
}

export type AllocateAdvanceParams = {
  searchValue?: string;
  so_status: string;
  so_date?: string;
};

export type AllocateSOAdvanceParams = {
  searchValue?: string;
  status: string;
  ordered_date?: string;
};

export type DNDetail = {
  id: number;
  item_code: string;
  item_name: string;
  line_number: string;
  dn_date: string;    // ISO string
  dn_num: string;
  dn_qty: string;
  remark: string;
  salesPlanID: string;
  type: string;
  attachment?: Attachment[];
};


export type DNItemParams = {
  deliveryId:number,
  dn:DNDetail[],
  id:number,
  itemCode:string,
  itemName:string,
  qty:number,
  saleType:string,
  allocateID:string,
  lineNumber:string,
  so_num:string
};

export type DNParams={
  deliveryDate: string,
  deliveryItems: DNItemParams[]
  id: number;
  priority?: string | null;
  remarks?: string | null;
  shift?: string | null;
  shippingAddress?: string | null;
  soId?: number | string | null;
}

export type UpdateRemarkParams={
  id?:number,
  remark?:string,
  attachment?:Attachment[]
}

type Attachment={
  attachment?: string
}

export type DeliveryDnParams={
  key:number,
  id: number,
  item_code: string,
  item_name: string,
  line_number: string,
  dn_num?:string,
  dn_qty?:string,
  dn_date?:string,
  type:string,
  total_plan_qty:string,
  attachment?:Attachment[],
  remark:string
}