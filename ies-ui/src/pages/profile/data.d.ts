import { LookupDataItem2 } from "@/services/data";
import moment from "moment";

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
  id: number;
  userId: string;
  empNo: string;
  profileImageId?: string;
  internalName: string;
  firstName: string;
  lastName: string;
  email: string;
  dateJoined?: moment.Moment;
  gender?: string;
  bod?: moment.Moment;
  jobs: JobData[];
  roles: string[];
  contacts: ContactData[]
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

export interface SaveProfileImage {
  employeeId: number;
  imageId: string;
}