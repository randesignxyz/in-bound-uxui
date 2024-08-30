import moment from "moment";
import { SaveEssProfile } from "../profile/data.ess";
import { EssOpenData } from "../profile/data";

 
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
  
  profile_draft     : SaveEssProfile;   
  ess         : EssOpenData; 
}


export type OpenAdvanceSearchParams = {
  status: '0' | '1' | '2' | '3' | '4'; 
};