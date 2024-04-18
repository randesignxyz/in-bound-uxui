export interface CustomerPricingParam {
  productName: string;
  productNameEn: string;
  productCode: string;
  pricing: number;
  remark?: remark;
  id: string;
  key: string;
  productId: string;
}

export interface CustomerPricingCreate {
  customerId: string;
  listPricing: { productCode: string; pricing: number }[];
}
