import moment, { Moment } from "moment";

export interface SaveEssProfile {
  id?: number; 
  essProfId: number; 
  openEssId: number; 
  empId:number;
  nameKh: string; 
  nameEn: string; 
  genderId   : number; 
  dateBirth  : moment.Moment;
  
  marriedWith   : boolean; 
  spouseStaffId   : string; 
  
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

  nationalId                : string;  
  nationalIssuedDate      : moment.Moment;
  nationalExpiryDate      : moment.Moment;

  passportNumber            : string;   
  passportIssuedDate      : moment.Moment;
  passportExpiryDate      : moment.Moment;

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
  essProfId: number; 
  openEssId: number; 
  provincePaId?   : number; 
  provincePbId?   : number; 
  provinceCrId?   : number; 
  districtPbId?   : number; 
  districtPaId?   : number; 
  districtCrId?   : number; 
  communePaId?   : number; 
  communePbId?   : number; 
  communeCrId?   : number; 

  homePaNo?   : string; 
  homePbNo?   : string; 
  homeCrNo?   : string; 

  streetPa?   : string; 
  villagePaId?   : string; 
  streetCr?   : string; 
  villageCrId?   : string; 

  empId           : number;
  nameKh          : string; 
  nameEn          : string;  
  genderId        : number; 
  dateBirth       : moment.Moment; 
  placeBirth      : string;  
  maritalStatusId : number;  
  permanentAddress  : string;  
  religionId        : number;  
  currentAddress    : string;  
  marriedWith    : boolean; 
  spouseStaffId    : string; 
  
  nationalId        : string;   
  nationalIssuedDate    : string; 
  nationalExpiryDate    : string;  
  passportNumber    : string;   
  passportIssuedDate    : string; 
  passportExpiryDate    : string; 

  departmentId      : number;  
  status            : Boolean; 
  otherFile         : FilesData[]; 
  step              : number; 
  remark            : string;
  attacheFile       : AttachmentFile[]; 
}  
export interface SaveEmergency {
  id?: number; 
  empId:number;
  isDelete:number;
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
  emergencyContactRelation: number; 
  emergencyContactRelationName: string; 
  emergencyPhone: string; 
  emergencyAddress: string; 
  provinceName: string; 
  districtName: string; 
  communeName: string; 
  homeNo: string; 
  street: string; 
  villageId: string; 
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
  isDelete:number;
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
  languageName: string; 
  levelName: string; 
  levelId: number; 
  description: string;  
  status:Boolean; 
  isDelete:number;
  otherFile  :AttachmentFile[];
}
export interface RelationshipData {
  id?: number; 
  empId:number;
  relationshipId:number; 
  refId:number;
  relationshipName: number; 
  occupationId: string; 
  dateOfBirth: moment.Moment;  
  status:Boolean;  
  isDelete:number;
  type:string; 
}

export interface ProfileRelationshipData { 
  data     : RelationshipData[];  
  oldData     : RelationshipData[];  
  newData     : RelationshipData[]; 
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
  isDelete:number;
  typeId:number;
  duration:string;
  institution: string; 
  trainingCourse: string; 
  year: string; 
  toYear: string; 
  description: string;  
  status:Boolean;
  type:string;
  otherFile  :AttachmentFile[];
}  
export interface TrainingData {
  id?         : number; 
  empId       : number;
  trainingId? : number; 
  trainingCourse: string; 
  institution : string; 
  typeId      : number;
  year        : moment.Moment;
  toYear        : moment.Moment;
  duration    : string;
  description : string;  
  status      : Boolean;
  otherFile   : AttachmentFile[];
}
export interface ProfileTrainingData { 
  data            : TrainingData[];  
  dataCert        : TrainingData[];  
  oldData         : TrainingData[];  
  newData         : TrainingData[];  
  oldDataCert     : TrainingData[];  
  newDataCert     : TrainingData[];  
  fileOldData     : FilesData[];  
  fileNewData     : FilesData[];   
  fileAllData     : FilesData[];   
}

export interface SaveExperience {
  id?: number;   
  empId:number;
  companyName: string; 
  countryId: number; 
  provinceId: number; 
  startPosition: string; 
  endPosition: string; 
  startDate       : moment.Moment;
  endDate         : moment.Moment;
  description: string;  
  status:Boolean;
  type:string;
  otherFile  :AttachmentFile[];
}  
export interface ExperienceData {
  id?: number; 
  experienceId:number;
  empId:number;
  isDelete:number;
  companyName: string; 
  countryId: number; 
  provinceId: number; 
  locationRemark: string; 
  countryName: string; 
  provinceName: string; 

  startPosition   : string; 
  endPosition     : string; 
  experienceDate       : moment.Moment[];
  startDate       : moment.Moment;
  endDate         : moment.Moment;
  description     : string;  
  status          : Boolean;
  type            : string;
  otherFile       : AttachmentFile[];
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
  isDelete:number;
  educationCenter: string; 
  marjorSubject: string;  
  type: string; 
  status:boolean;
  otherFile  :AttachmentFile[];
  degreeName: string; 
  statusName: string; 
  countryEducationCenterName: string; 
}
export interface ProfileEducationData { 
  data        : EducationData[];  
  marjor      : MarjorData[];  
  degree      : EssLookupData[];  
  status      : EssLookupData[];  
  language    : EssLookupData[];  
  coei        : EssLookupData[];  
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
  name: string; 
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
  type: number;  
  title: string;  
  createdBy: string;  
  createdDate: moment.Moment;
} 
export interface MarjorData {
  id?: string;  
  majorName:string;
  description: string;   
  status:number;
} 
export interface EssLookupData {
  id?: string;  
  titleName:string;
  description: string;   
  type:number;
} 

export interface ActivityData {
  id?: string;  
  description: string;  
  step: number;  
  remark: string;   
  createdDate: moment.Moment;
  locatedBy:string;
  createdBy:string;
} 