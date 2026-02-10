import Moment from 'moment';


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
  startedDate: moment.Moment;
  probationEndDate: moment.Moment;
  appraiser1No: string;
  appraiser1: string;
  appraiser2No: string;
  appraiser2: string;
  appraiser3No: string;
  appraiser3: string;
  appraiser4No: string;
  appraiser4: string;
  appraiser5No: string;
  appraiser5: string;
  remark: string;
  active: string;
}

export type IOSEmployeeSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  searchValue?: string;
  buIds?: number[];
  depIds?: number[];
  subDepIds?: number[];
}

