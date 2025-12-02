import Moment from 'moment';

export interface ListJob {
  jobNo: number;
  id: number;
  jobTitle: string;
  description: string | null;
  jobDescription: string | null;
  empSegmentId: number | null;
  status: string | null;
  createdBy: string | null;
  createdDate: Moment.Moment | null;
  lastModifiedBy: string | null;
  lastModifiedDate: Moment.Moment | null;
}
export type JobInfoAdvanceSearchParams = {
  searchValue?: string;
};



