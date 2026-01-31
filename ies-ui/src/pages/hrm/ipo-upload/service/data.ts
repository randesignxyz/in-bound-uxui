import { Moment } from 'moment';
import { FieldInfo } from '@/services/shared/data';

export interface EmpISOData {
  id: number;
  employeeId: string;
  fullName: string;
  companyName: string;
  departmentName: string;
  subFunction: string;
  location: string;
  position: string;
  jobLevel: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  appraiser1Id: string;
  appraiser1: string;
  appraiser2Id: string;
  appraiser2: string;
  createdBy: string;
  createdAt: moment.Moment;
  modifiedBy: string;
  modifiedDate: moment.Moment;
  status: string;
}

export type EmpISOSearchParams = {
  searchValue?: string;
}

export type ImportDataItems = {
  id: number
  fieldInfoList: FieldInfo[];
  action?: string;
}
