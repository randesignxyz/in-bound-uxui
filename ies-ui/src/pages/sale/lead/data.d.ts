export type LeadAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  searchValue?:string;
  empNo?:string
};


interface UpdateCustomerOwnerEntry {
  salePersonId:string;
  customerList?:number[];
}