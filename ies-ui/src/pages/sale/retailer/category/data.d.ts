export type CategoryDto = {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  lastModifiedBy?: string;
  lastModifiedDate?: moment.Moment;
};

export type CategoryCreate = {
  id?: string;
  name: string;
  code: string;
  description?: string;
};

export type CategoryAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
};
