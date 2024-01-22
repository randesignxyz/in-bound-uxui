import moment from 'moment';
import { ItemsPricing } from '../pricing/data';

interface CustomerGroup {
  id?: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  isDefault: boolean;
  lastModifiedDate: moment.Moment;
  createdBy: string;
  createdDate: moment.Moment;
  lastModifiedBy: string;
  items?: ItemsPricing[];
}

interface CustomerGroupDetail {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  isDefault: boolean;
  lastModifiedDate: moment.Moment;
  createdBy: string;
  createdDate: moment.Moment;
  lastModifiedBy: string;
  // items?: ItemsPricing[];
}

interface GroupCustomer {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type?: string;
  status: string;
  createdDate?: moment.Moment;
  createdBy?: string;
  isDefault: boolean;
}

export type GroupCustomerAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
};

export type CustomerGroupIdParam = {
  ruleId: string;
};

export type GroupCustomerStatus = {
  id: string;
  status: string;
};
