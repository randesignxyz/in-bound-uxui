import moment from 'moment';

export interface ItemSalesLinePrice {
  id: number? = 0;
  priceType: string;
  code: string;
  itemId: number?;
  variantCode: string?;
  unitOfMeasureId: number? = 1;
  unitOfMeasureCode: string = 'CASE';
  minimumQuantity: number = 1;
  currencyId: number? = 1;
  unitPrice: number;
  unitPriceAfterDiscount: number;
  discountPercentage: number = 0;
  discountAmount: number = 0;
  startingDate: moment.Moment?;
  endingDate: moment.Moment?;
  isActive: boolean;
  refId: number? = null;
}

export interface ItemSalesLinePriceDto {
  id: number? = 0;
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
  searchValue: string | undefined;
  type: 'ALL' | 'ACT-GROUP' | 'DSD-GROUP';
}
