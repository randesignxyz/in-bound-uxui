export type LeadAdvanceSearchParams = {
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  // searchValue?:string;
  empNo?:string;
  isVerified?:Any;
};


interface UpdateCustomerOwnerEntry {
  salePersonId:string;
  customerList?:number[];
}