import { LookupDataItem2 } from "@/services/data";
import moment from "moment";
import { LocationData } from "./data.ess";

export type AdvancedOperation1 = {
  key: string;
  type: string;
  name: string;
  status: string;
  updatedAt: string;
  memo: string;
};

export type AdvancedOperation2 = {
  key: string;
  type: string;
  name: string;
  status: string;
  updatedAt: string;
  memo: string;
};

export type AdvancedOperation3 = {
  key: string;
  type: string;
  name: string;
  status: string;
  updatedAt: string;
  memo: string;
};

export interface AdvancedProfileData {
  advancedOperation1?: AdvancedOperation1[];
  advancedOperation2?: AdvancedOperation2[];
  advancedOperation3?: AdvancedOperation3[];
}


export interface BasicProfileData {
  id: number;
  hasPhone: Boolean;
  imageId?: string;
}

export interface ProfileData {
  id      : number;
  userId  : string;
  empNo   : string;
  profileImageId?: string;
  internalName: string;
  firstName   : string;
  lastName    : string;
  company     : string;
  location    : string;
  functions   : string;
  position    : string; 
  email       : string;
  dateJoined? : moment.Moment;
  gender?     : string;
  step_id     : number=0;
  bod?        : moment.Moment;
  jobs        : JobData[];
  roles       : string[];
  emergency   : EmergencyData[]; 
  profile     : EssProfileData;  
  profile_draft     : SaveEssProfile;  
  profile_adr_pb     : EssProfileAdrData;  
  profile_adr_pm     : EssProfileAdrData;  
  profile_adr_ct     : EssProfileAdrData;   
  contacts    : ContactData[];  
  ess         : EssOpenData[]; 
  essLocation    : LocationData[];  
  essAttachFill: FilesData[];
  profileTab: ProfileTab;
}
export interface EssOpenData{  
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
 


export interface BasicContactData {
  id: number;
  empNo: string;
  mail: string;
  profileImageId?: string;
  internalName: string;
  firstName: string;
  lastName: string;
  dateJoined?: moment.Moment;
  contacts: ContactData[]
}


export interface SaveContract {
  id?: number;
  typeId: number;
  empId: number;
  contact: string;
  isMain?: boolean;
}

export interface ContactData {
  id: number;
  type: LookupDataItem2;
  value: string;
  isMain: boolean;
}

export interface JobData {
  jobTitle: string;
  department: string;
  buName: string;
  reportTo : string;
}
export interface EmergencyData {
  id?: number; 
  empId:number;
  emergency_name: string; 
  emergency_contact_relation: string; 
  emergency_phone: string; 
  emergency_address: string; 
  status:Boolean;
}
export interface EssProfileData {
  id?             : number; 
  empId           : number;
  name_kh?        : string; 
  name_en         : string;  
  gender_id       : number; 
  date_birth      : string;  
  place_birth     : string;  
  marital_status_id   : number;  
  permanent_address   : string;  
  religion_id         : number;  
  current_address     : string;  
  national_id         : string;  
  department_id         : number;  
  passport_number     : string;   
  relationship_id       : number;     
  occupation_id       : number;     
  depend_date_of_birth       : string;  
  street_cr       : string;  
  status              : Boolean; 
  step              : number?=0;
  remark       : string;  
}
export interface EssProfileAdrData {
  id?                     : number; 
  province_name           : string; 
  district_name           : string; 
  commune_name            : string; 
  home_no                 : string; 
  street                  : string; 
  village_id              : string; 
  remark                  : string; 
}
export interface SaveProfileImage {
  employeeId: number;
  imageId: string;
}
// export interface FilesData {
//   id?: string;  
//   path:string;
//   fileName: string;  
// }
export interface ProfileTab {
  contact_information?: number;  
  personal_information:number;
  emergency_contact: number;  
  education: number;  
  languages: number;  
  training: number;  
  work_experiences: number;   
}