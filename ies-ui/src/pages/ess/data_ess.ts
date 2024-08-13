 
export interface OpenEssDataItem {
  id?: number;  
  emp_id : number; 
  open_ess_name : string; 
  start_date    : string;  
  end_date      : string; 
  created_date  : string; 
  created_by    : string; 
  description   : string;  
  status        : Boolean;
}


export type OpenAdvanceSearchParams = {
  status: '0' | '1' | '2' | '3' | '4'; 
};