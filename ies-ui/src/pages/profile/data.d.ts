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
  stepId     : number=0;
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
  ess         : EssOpenData; 
  essLocation    : LocationData[];  
  essAttachFill: FilesData[];
  profileTab: ProfileTab;
}
export interface EssOpenData{  
  id?: number;  
  empId : number; 
  stepId : number; 
  openEssName : string; 
  startDate    : Moment;  
  endDate      : Moment; 
  createdDate  : Moment; 
  createdBy    : string; 
  description  : string;  
  status       : Boolean;
  empClosed  : number?=0;
  opening      : number;
  stag      : number;
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
  emergencyName: string; 
  emergencyContactRelation: string; 
  emergencyPhone: string; 
  emergencyAddress: string; 
  status:Boolean;
}
export interface EssProfileData {
  id?             : number; 
  empId           : number;
  nameKh?        : string; 
  nameEn         : string;  
  genderId       : number; 
  dateBirth      : string;  
  placeBirth     : string;  
  maritalStatusId   : number;  
  permanentAddress   : string;  
  religionId         : number;  
  currentAddress     : string;  
  nationalId         : string;  
  departmentId         : number;  
  passportNumber     : string;   
  relationshipId       : number;     
  occupationId       : number;      
  dependDateOfBirth       : string;  
  streetCr       : string;  
  status              : Boolean; 
  step              : number?=0;
  remark       : string;  
}
export interface EssProfileAdrData {
  id?                     : number; 
  provinceName           : string; 
  districtName           : string; 
  communeName            : string; 
  homeNo                 : string; 
  street                  : string; 
  villageId              : string; 
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
  contactInformation?: number;  
  personalInformation:number;
  emergencyContact: number;  
  education: number;  
  languages: number;  
  training: number;  
  workExperiences: number;   
}