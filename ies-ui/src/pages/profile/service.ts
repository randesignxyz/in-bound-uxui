import { execDataService0, fetchDataItemService, fetchDataListService, fetchDataPagingService } from '@/services/apiGateway';
import { LookupDataItem2 } from '@/services/data';
import { request } from 'umi';
import { BasicContactData, BasicProfileData, ContactData, ProfileData, SaveContract, SaveProfileImage } from './data';

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}


export const ProfileServices = {
  fetchProfile: (id: number) =>fetchDataItemService<ProfileData, { id: number }>({
    actionName: 'fetch-profile-by-user',
    endpoint: 'HR',
    payload: { id: id,roleCode:"" }
  }),

  listLookupData: (list: string[]) => fetchDataListService<LookupDataItem2, { list: string[] }>({
    actionName: 'list-lookup-data',
    endpoint: 'HR',
    payload: { list }
  }),

  saveContact: (data: SaveContract,isAdmin:number) => execDataService0<SaveContract>({
    actionName: 'save-contact',
    endpoint: 'HR',
    payload: { ...data,isAdmin:isAdmin }
  }),

  listContact: (id: number) => fetchDataListService<ContactData, { id: number }>({
    actionName: 'list-contact',
    endpoint: 'HR',
    payload: { id }
  }),

  deleteContact: (id: number) => execDataService0<{ id: number }>({
    actionName: 'delete-contact',
    endpoint: "HR",
    payload: { id }

  }),

  saveProfileImage: (data: SaveProfileImage) => execDataService0<SaveProfileImage>({
    actionName: 'upload-employee-image',
    endpoint: "HR",
    payload: data

  }),

  fetchBasicProfile: fetchDataItemService<BasicProfileData>({
    actionName: 'fetch-basic-info',
    endpoint: 'HR'
  }),

  fetchBasicContact: (userId: string) => fetchDataItemService<BasicContactData | undefined, { id: string }>({
    actionName: 'fetch-basic-contact-info',
    endpoint: 'HR',
    payload: { id: userId }
  }),

}