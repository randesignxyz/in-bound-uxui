

export interface ListJob {
  formNo: number;
  id: number;
  jobNo: string;
  jobTitle: string;
  description: string | null;
  jobDescription: string | null;
  empSegmentId: number | null;
  status: string | null;
  createdBy: string | null;
  createdDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;
  // optional helper fields for UI
  empId?: number;
  empNo?: string;
  empName?: string;
  key?: string;
}

export type JobInfoAdvanceSearchParams = {

  // subStatus?: string;
  searchValue?: string;

};



