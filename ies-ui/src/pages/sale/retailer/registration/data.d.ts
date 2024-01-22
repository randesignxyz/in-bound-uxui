import { CustomerDto } from '../customer/data';

interface RegistrationForm {
  id: string;
  address: string;
  businessName: string;
  businessOwner: string;
  customerNo?: string;
  phone: string;
  remark?: string;
  status: string;
  // createdBy?: string;
  // lastModifiedBy?: string;
  createdDate?: moment.Moment;
  lastModifiedDate?: moment.Moment;
  customer?: CustomerDto;
  // customer?: { id: string; firstName: string; lastName?: string; customerGroupId: string };
}

interface RegistrationAdvanceSearchParams {
  status: 'ALL' | 'pending' | 'approve' | 'reject';
}

export type StatusSuggestion = {
  id: string;
  remark?: string;
  status: string;
  customerNo?: string;
  customerType?: string;
  customerGroupId?: string;
};
