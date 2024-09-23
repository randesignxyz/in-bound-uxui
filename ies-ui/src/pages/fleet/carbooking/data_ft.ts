import moment from "moment";

export interface OpenEssDataItem {
  id: number;  
  empId : number;  
  stepId : number;  
  empClosed : number;  
  openTitle : string; 
  firstName    : string;  
  lastName    : string;  
  startDate    : moment.Moment;  
  endDate      : moment.Moment;  
  createdDate  : string; 
  createdBy    : string; 
  description   : string;  
  status        : Boolean;
   
}


export type OpenAdvanceSearchParams = {
  status: '0' | '1' | '2' | '3' | '4'; 
};