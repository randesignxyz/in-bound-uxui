
export interface SaveEssProfile {
  id?: number; 
  ess_prof_id?: number; 
  empId:number;
  name_kh: string; 
  name_en: string; 
  gender_id   : number; 
  date_birth  : string;  
  place_birth : string;  
  marital_status_id    : number;  
  province_pb_id    : number;  
  district_pb_id    : number;   
  commune_pb_id    : number;  
  
  province_pa_id    : number;  
  district_pa_id    : number;   
  commune_pa_id    : number;  
  home_pa_no : string;  
  street_pa : string;  
  village_pa_id : string;  

  province_cr_id    : number;  
  district_cr_id    : number;   
  commune_cr_id    : number;  
  home_cr_no : string;  
  street_cr : string;  
  village_cr_id : string;  

  permanent_address : string;  
  religion_id    : number;  
  step_id    : number;  
  current_address   : string;  
  national_id : string;  
  passport_number   : string;   
  department_id     : number;  
  status      : Boolean;
  step      : number; 
  remark:string;
  attacheFile: AttachmentFile[];
  other_file  :AttachmentFile[];
}
export interface AttachmentFile {
  uri: any;
  id: string;
  title?: string;
  description?: string;
  fileName: string;
  fileType: string;
  createdBy?: string;
  createdDate: moment.Moment;
} 
export interface EssProfileData {
  id?   : number; 
  empId :number;
  name_kh : string; 
  name_en : string;  
  gender_id   : number; 
  date_birth  : string;  
  place_birth : string;  
  marital_status_id    : number;  
  permanent_address : string;  
  religion_id    : number;  
  current_address   : string;  
  national_id : string;    
  passport_number   : string;   
  department_id     : number;  
  status      : Boolean; 
  other_file  :FilesData[];
}  
export interface SaveEmergency {
  id?: number; 
  empId:number;
  emergency_name: string; 
  emergency_contact_relation: string; 
  emergency_phone: string;  
  
  province_id: number;
  district_id: number;
  commune_id: number;

  home_no: number;
  street: number;
  village_id: number;

  status:Boolean;
  type:string;
  other_file  :AttachmentFile[];
}  
export interface EmergencyData {
  id?: number; 
  empId:number;
  emergency_name: string; 
  emergency_contact_relation: string; 
  emergency_phone: string; 
  emergency_address: string; 
  status:Boolean;
  province_id: number;
  district_id: number;
  commune_id : number;
  emergecy_id : number;
  other_file  :AttachmentFile[];
}
// 
export interface ProfileEmergencyData { 
  data     : EmergencyData[];  
  oldData     : EmergencyData[];  
  newData     : EmergencyData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
}

export interface SaveLanguage {
  id?: number; 
  empId:number;
  language_id: number; 
  level_name: string; 
  description: string;  
  status:Boolean;
  type:string;
  other_file  :AttachmentFile[];
}  
export interface LanguageData {
  id?: number; 
  empId:number;
  ref_id:number;
  language_id: number; 
  language_name: number; 
  level_name: string; 
  description: string;  
  status:Boolean; 
  other_file  :AttachmentFile[];
}
export interface ProfileLanguageData { 
  data     : LanguageData[];  
  oldData     : LanguageData[];  
  newData     : LanguageData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
  other_file  :AttachmentFile[];
}   

export interface SaveTraining {
  id?: number;   
  empId:number;
  training_course: string; 
  year: string; 
  description: string;  
  status:Boolean;
  type:string;
  other_file  :AttachmentFile[];
}  
export interface TrainingData {
  id?: number; 
  training_id?: number; 
  empId:number;
  training_course: string; 
  year: string; 
  description: string;  
  status:Boolean;
  other_file  :AttachmentFile[];
}
export interface ProfileTrainingData { 
  data     : TrainingData[];  
  oldData     : TrainingData[];  
  newData     : TrainingData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
}

export interface SaveExperience {
  id?: number;   
  empId:number;
  company_name: string; 
  location: string; 
  start_position: string; 
  end_position: string; 
  start_date: string; 
  end_date: string; 
  description: string;  
  status:Boolean;
  type:string;
  other_file  :AttachmentFile[];
}  
export interface ExperienceData {
  id?: number; 
  experience_id:number;
  empId:number;
  company_name: string; 
  location: string; 
  start_position: string; 
  end_position: string; 
  start_date: string; 
  end_date: string; 
  description: string;  
  status:Boolean;
  other_file  :AttachmentFile[];
}
export interface ProfileExperienceData { 
  data     : ExperienceData[];  
  oldData     : ExperienceData[];  
  newData     : ExperienceData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
}
// education
export interface EducationData {
  id?: number; 
  education_id:number;
  ref_id:number;
  empId:number;
  country_education_center: number; 
  degree_id: number; 
  status_id:number;
  education_center: string; 
  marjor_subject: string;  
  type: string; 
  status:boolean;
  other_file  :AttachmentFile[];
}
export interface ProfileEducationData { 
  data     : EducationData[];  
  oldData     : EducationData[];  
  newData     : EducationData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
}

export interface LocationData {
  id?: number; 
  empId:number;
  code:string;
  internal_name: string; 
  parent: number; 
  type: string; 
  
  province_id:number;
  district_id:number;
  commune_id:number;
  home_no: string;
  street:string;
  village_id:string;
  type_id:number;
  status:number;
  remark :string;
}

export interface FilesData {
  id?: string;  
  path:string;
  description: string;  
  file_name: string;  
  file_type: string;  
  title: string;  
  created_date: moment.Moment;
} 

export interface ActivityData {
  id?: string;  
  description: string;  
  step: number;  
  remark: string;   
  created_date: moment.Moment;
  created_by:string;
} 