import moment from 'moment';
import { CustomerGroup } from '../groupCustomer/data';

interface CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
  phone: string;
  type: string;
  imageId?: string = null;
  verifyCount: number;
  verifyCode: string;
  status: string;
  groupId?: string;
  address: Address[];
  lastModifiedBy: string;
  lastModifiedDate: moment.Moment;
  suggestion?: SuggestionDTO;
  requestCount: number;
  customerGroup?: CustomerGroup;
}

interface CustomerUpdate {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  customerGroupId?: string;
}

interface CustomerCreate {
  firstName: string;
  lastName: string;
  phone: string;
  userName: string;
  password: string;
  referencePhone: string;
  type: string;
}

interface Address {
  id: string;
  communeId: number;
  districtId: number;
  houseNo: string;
  provinceId: number;
  regionId: number;
  streetName: string;
  streetNo: string;
  villageId: number;
  status: string;
  createdBy: string;
  createdDate: moment.Moment;
  lastModifiedBy: string;
  lastModifiedDate: moment.Moment;
  type: string;
  latitude: string;
  longitude: string;
  address: string;
}

interface CustomerAddressDTO {
  id: string;
  customer: CustomerDto;
  address: Address;
  addressType: strin;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isDefault: boolean;
  address?: Address;
}

export type CustomerAdvanceSearchParams = {
  status: 'ALL' | 'active' | 'inactive' | 'unverified';
  groupId?: string;
};

export type CustomerUpdateGroupIdParam = {
  groupId: string;
  customerIdList: List<string>;
  suggestion?: string;
};

export type SuggestionDTO = {
  id: string;
  createdDate: moment.Moment;
  lastModifiedDate: moment.Moment;
  businessName?: string;
  customerNo?: string;
  remark?: string;
  phone?: string;
  email?: string;
  status?: string;
  address?: string;
  businessOwner?: string;
};

export type CRMDTO = {
  id: number;
  code: string;
  name: string;
  internalName?: string;
  typeId: number;
  defaultCustomerAddressId: number;
  active: string;
  isDistributor: boolean;
  source: string;
};

export type CRMSearch = {
  searchValue?: string;
  advanceSearch?: {
    customerTypeId?: number;
  };
  pageRequest?: {
    page: number;
    pageSize: number;
  };
};

export type StoreListDTO = {
  id: number;
  code: string;
  name: string;
  internalNmae: string;
  source: string;
  deleted: string;
  active: string;
  isDistributor: string;
};
