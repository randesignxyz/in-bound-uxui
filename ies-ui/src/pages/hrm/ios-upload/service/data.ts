import { Moment } from 'moment';
import { FieldInfo } from '@/services/shared/data';

export interface EmpISOData {
  id: number;
  empNo: string;
  empName: string;
  buName: string;
  location: string;
  deptName: string;
  subDeptName: string;
  jobTitle: string;
  jobLevel: string;
  appraiser1: string;
  appraiser2: string;
  status: string;
}

export type IOSEmployeeSearchParams = {
  searchValue: string;
  appraisalPeriodId?: number;
}
