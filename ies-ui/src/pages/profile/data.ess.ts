
export interface SaveEssProfile {
  id?: number; 
  essProfId?: number; 
  empId:number;
  nameKh: string; 
  nameEn: string; 
  genderId   : number; 
  dateBirth  : string;  
  placeBirth : string;  
  maritalStatusId    : number;  
  provincePbId    : number;  
  districtPbId    : number;   
  communePbId    : number;  
  
  provincePaId    : number;  
  districtPaId    : number;   
  communePaId    : number;  
  homePaNo : string;  
  streetPa : string;  
  villagePaId : string;  

  provinceCrId    : number;  
  districtCrId    : number;   
  communeCrId    : number;  
  homeCrNo : string;  
  streetCr : string;  
  villageCrId : string;  

  permanentAddress : string;  
  religionId    : number;  
  stepId    : number;  
  currentAddress   : string;  
  nationalId : string;  
  passportNumber   : string;   
  departmentId     : number;  
  status      : Boolean;
  step      : number; 
  remark:string;
  attacheFile: AttachmentFile[];
  otherFile  :AttachmentFile[];
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
  nameKh : string; 
  nameEn : string;  
  genderId   : number; 
  dateBirth  : string;  
  placeBirth : string;  
  maritalStatusId    : number;  
  permanentAddress : string;  
  religionId    : number;  
  currentAddress   : string;  
  nationalId : string;    
  passportNumber   : string;   
  departmentId     : number;  
  status      : Boolean; 
  otherFile  :FilesData[];
}  
export interface SaveEmergency {
  id?: number; 
  empId:number;
  emergencyName: string; 
  emergencyContactRelation: string; 
  emergencyPhone: string;  
  
  provinceId: number;
  districtId: number;
  communeId: number;

  homeNo: number;
  street: number;
  villageId: number;

  status:Boolean;
  type:string;
  otherFile  :AttachmentFile[];
}  
export interface EmergencyData {
  id?: number; 
  empId:number;
  emergencyName: string; 
  emergencyContactRelation: string; 
  emergencyPhone: string; 
  emergencyAddress: string; 
  status:Boolean;
  provinceId: number;
  districtId: number;
  communeId : number;
  emergecyId : number;
  otherFile  :AttachmentFile[];
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
  languageId: number; 
  levelName: string; 
  description: string;  
  status:Boolean;
  type:string;
  otherFile  :AttachmentFile[];
}  
export interface LanguageData {
  id?: number; 
  empId:number;
  refId:number;
  languageId: number; 
  languageName: number; 
  levelName: string; 
  description: string;  
  status:Boolean; 
  otherFile  :AttachmentFile[];
}
export interface ProfileLanguageData { 
  data     : LanguageData[];  
  oldData     : LanguageData[];  
  newData     : LanguageData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
  otherFile  :AttachmentFile[];
}   

export interface SaveTraining {
  id?: number;   
  empId:number;
  trainingCourse: string; 
  year: string; 
  description: string;  
  status:Boolean;
  type:string;
  otherFile  :AttachmentFile[];
}  
export interface TrainingData {
  id?: number; 
  trainingId?: number; 
  empId:number;
  trainingCourse: string; 
  year: string; 
  description: string;  
  status:Boolean;
  otherFile  :AttachmentFile[];
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
  companyName: string; 
  location: string; 
  startPosition: string; 
  endPosition: string; 
  startDate: string; 
  endDate: string; 
  description: string;  
  status:Boolean;
  type:string;
  otherFile  :AttachmentFile[];
}  
export interface ExperienceData {
  id?: number; 
  experienceId:number;
  empId:number;
  companyName: string; 
  location: string; 
  startPosition: string; 
  endPosition: string; 
  startDate: string; 
  endDate: string; 
  description: string;  
  status:Boolean;
  otherFile  :AttachmentFile[];
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
  educationId:number;
  refId:number;
  empId:number;
  countryEducationCenter: number; 
  degreeId: number; 
  statusId:number;
  educationCenter: string; 
  marjorSubject: string;  
  type: string; 
  status:boolean;
  otherFile  :AttachmentFile[];
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
  internalName: string; 
  parent: number; 
  type: string; 
  
  provinceId:number;
  districtId:number;
  communeId:number;
  homeNo: string;
  street:string;
  villageId:string;
  typeId:number;
  status:number;
  remark :string;
}

export interface FilesData {
  id?: string;  
  path:string;
  description: string;  
  fileName: string;  
  fileType: string;  
  title: string;  
  createdDate: moment.Moment;
} 

export interface ActivityData {
  id?: string;  
  description: string;  
  step: number;  
  remark: string;   
  createdDate: moment.Moment;
  createdBy:string;
} 