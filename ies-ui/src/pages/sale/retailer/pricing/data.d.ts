import moment from 'moment';
import { CustomerDto, GroupCustomer } from '../customer/data';
import { ProductDto } from '../product/data';

interface PricingRule {
  id: string;
  name: string;
  description?: string;
  status?: string;
  expireDate?: moment.Moment;
  effectiveDate?: moment.Moment;
  customerGroupId?: string;
  customerGroupName?: string;
  items?: ItemsPricing[];
}

interface ItemsPricing {
  id: string;
  code?: string;
  status?: string;
  pricingType: string;
  unitPrice: number;
  discountPrice?: number;
  productId: string;
  productName?: string;
  productCode?: string;
  referenceId?: string;
  referenceName?: string;
  lastModifiedDate?: moment.Moment;
  effectiveDate?: moment.Moment;
  expiredDate?: moment.Moment;
  createdBy?: string;
  lastModifiedBy?: string;
  createdDate?: moment.Moment;
}

export type PricingGroupDTO = {
  id: string;
  name: string;
  description: string;
  code: string;
  status?: string;
  pricingItems: number;
  lastModifiedDate: moment.Moment;
  expireDate: moment.Moment;
  effectiveDate: moment.Moment;
  createdBy?: string;
  isDefault: boolean;
};

export type PricingGroupCreate = {
  id?: string;
  name: string;
  description: string;
  status: true;
  product?: string;
  unitPrice?: number;
  customer?: string;
  isDefault?: boolean;
  expireDate: moment.Moment;
  effectiveDate: moment.Moment;
};

export type PricingRuleItems = {
  id: number;
  product: ProductDto;
  unitPrice: number;
  codeId: string;
  status: string;
  sequence: number;
  groupCustomer: GroupCustomer;
  customer: CustomerDto;
};

export type PricingCreate = {
  id?: string;
  cost: number;
  pricing: number;
  isDefault: boolean;
};

export type PricingAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
};

export type PricingRuleView = {
  id: string;
  name: string;
  status: boolean;
  description: string;
  lastModifiedDate: moment.Moment;
  pricingRuleHandler: PricingRuleItems[];
  createdBy: string;
};
