import { Moment } from 'moment';
import { FieldInfo } from '@/services/shared/data';

export interface EmpISOData {
  id: number;
  empNo: string;
  empName: string;
  bu: string;
  dept: string;
  subdept: string;
  location: string;
  position: string;
  jobLevel: string;
  appraiser1: string;
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
