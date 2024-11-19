import moment from 'moment';

export interface ItemSalesLinePrice {
  id?: number;
  priceType: string;
  code: string;
  itemId?: number;
  variantCode?: string;
  unitOfMeasureId?: number;
  unitOfMeasureCode: string;
  minimumQuantity: number;
  currencyId?: number;
  unitPrice: number;
  unitPriceAfterDiscount: number;
  discountPercentage: number;
  discountAmount: number;
  startingDate?: moment.Moment;
  endingDate?: moment.Moment;
  isActive: boolean;
  refId?: number;
}

export interface ItemSalesLinePriceDto {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  priceType: string;
  unitOfMeasureCode?: string;
  currencyCode?: string;
  unitPrice: number;
  unitPriceAfterDiscount: number;
  discountPercentage: number;
  discountAmount: number;
  startingDate?: moment.Moment;
  endingDate?: moment.Moment;
  isActive: boolean;
}

interface PricingUpdateParam {
  id: number[];
  unitPrice: number;
  unitPriceAfterDiscount: number;
}

export interface ItemSalesLinePriceParam {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  unitPrice: number;
  unitPriceAfterDiscount: number;
  currency: string;
}

export interface PricingAdvanceSearchParam {
  searchValue?: string | undefined;
  // status: 'ALL' | 'ACT-GROUP' | 'DSD-GROUP';
  status: string;
}
