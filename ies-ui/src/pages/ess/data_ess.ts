 
export interface OpenEssDataItem {
  id?: number;  
  empId : number;  
  openTitle : string; 
  startDate    : string;  
  endDate      : string; 
  createdDate  : string; 
  createdBy    : string; 
  description   : string;  
  status        : Boolean;
}


export type OpenAdvanceSearchParams = {
  status: '0' | '1' | '2' | '3' | '4'; 
};