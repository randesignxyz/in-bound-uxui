import { execDataService0,fetchDataItemService,fetchDataListService} from '@/services/apiGateway'; 
import { request } from 'umi';
import { SaveEssProfile,SaveEmergency,SaveLanguage,SaveTraining,SaveExperience,EmergencyData,LanguageData,TrainingData,ExperienceData,LocationData, EducationData, FilesData, ActivityData, ProfileEmergencyData, ProfileEducationData, ProfileLanguageData, ProfileTrainingData, ProfileExperienceData, RelationshipData, ProfileRelationshipData } from './data.ess';
import { AddressData } from '@/services/crm/data';

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}


export const ProfileServicesEss = {  
  saveEssProfile: (data: SaveEssProfile) => execDataService0<SaveEssProfile>({
    actionName: 'save-essprofile',
    endpoint: 'HR',
    payload: { ...data }
  }),
  saveEssProfileAdmin: (data: SaveEssProfile) => execDataService0<SaveEssProfile>({
    actionName: 'save-essprofile-admin',
    endpoint: 'HR',
    payload: { ...data }
  }),
  approvalEssProfile: (data: SaveEssProfile) => execDataService0<SaveEssProfile>({
    actionName: 'approval-essprofile',
    endpoint: 'HR',
    payload: { ...data }
  }),
  
  // emergency
  saveEmergency: (data: SaveEmergency) => execDataService0<SaveEmergency>({
    actionName: 'save-emergency',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  saveEmergencyAdmin: (data: SaveEmergency) => execDataService0<SaveEmergency>({
    actionName: 'save-emergency-admin',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  listEmergency: (id: number,openId:number) => fetchDataItemService<ProfileEmergencyData, { id: number,openId:number }>({
    actionName: 'list-emergency',
    endpoint: 'HR',
    payload: { id,openId }
  }),   
  listEmergencyModify: (id: number,type:number) => fetchDataListService<EmergencyData, { id: number,type: number }>({
    actionName: 'list-emergency-modify',
    endpoint: 'HR',
    payload: { id,type }
  }),  
  // Family Memeber
  saveRelationshipAdmin: (data: RelationshipData) => execDataService0<RelationshipData>({
    actionName: 'save-relationship-admin',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  saveRelationship: (data: RelationshipData) => execDataService0<RelationshipData>({
    actionName: 'save-relationship',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  listRelationship: (id: number,openId:number) => fetchDataItemService<ProfileRelationshipData, { id: number,openId:number }>({
    actionName: 'list-relationship',
    endpoint: 'HR',
    payload: { id,openId }
  }),
  listRelationshipModify: (id: number,type:number) => fetchDataListService<RelationshipData, { id: number,type: number }>({
    actionName: 'list-relationship-modify',
    endpoint: 'HR',
    payload: { id,type }
  }),  

  // language
  saveLanguageAdmin: (data: LanguageData) => execDataService0<LanguageData>({
    actionName: 'save-language-admin',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  saveLanguage: (data: SaveLanguage) => execDataService0<SaveLanguage>({
    actionName: 'save-language',
    endpoint: 'HR',
    payload: { ...data }
  }), 
  listLanguage: (id: number,openId:number) => fetchDataItemService<ProfileLanguageData, { id: number,openId:number }>({
    actionName: 'list-language',
    endpoint: 'HR',
    payload: { id,openId }
  }),
  listlanguageModify: (id: number,type:number) => fetchDataListService<LanguageData, { id: number,type: number }>({
    actionName: 'list-language-modify',
    endpoint: 'HR',
    payload: { id,type }
  }),  

  // training
  saveTrainingAdmin: (data: SaveTraining) => execDataService0<SaveTraining>({
    actionName: 'save-training-admin',
    endpoint: 'HR',
    payload: { ...data }
  }),
  saveTraining: (data: SaveTraining) => execDataService0<SaveTraining>({
    actionName: 'save-training',
    endpoint: 'HR',
    payload: { ...data }
  }),
  
  listTraining: (id: number,openId:number) => fetchDataItemService<ProfileTrainingData, { id: number,openId:number }>({
    actionName: 'list-training',
    endpoint: 'HR',
    payload: { id,openId }
  }), 
  listTrainingModify: (id: number,type:number) => fetchDataListService<TrainingData, { id: number,type: number }>({
    actionName: 'list-training-modify',
    endpoint: 'HR',
    payload: { id,type }
  }),  

  // experience
  saveExperienceAdmin: (data: ExperienceData) => execDataService0<ExperienceData>({
    actionName: 'save-experience-admin',
    endpoint: 'HR',
    payload: { ...data }
  }),
  saveExperience: (data: ExperienceData) => execDataService0<ExperienceData>({
    actionName: 'save-experience',
    endpoint: 'HR',
    payload: { ...data }
  }),
  listExperience: (id: number,openId:number) => fetchDataItemService<ProfileExperienceData, { id: number,openId:number }>({
    actionName: 'list-experience',
    endpoint: 'HR',
    payload: { id,openId }
  }),
  listExperienceModify: (id: number,type:number) => fetchDataListService<ExperienceData, { id: number,type: number }>({
    actionName: 'list-experience-modify',
    endpoint: 'HR',
    payload: { id,type }
  }),  

  // education
  saveEducationAdmin: (data: EducationData) => execDataService0<ExperienceData>({
    actionName: 'save-education-admin',
    endpoint: 'HR',
    payload: { ...data }
  }),  
  saveEducation: (data: EducationData) => execDataService0<ExperienceData>({
    actionName: 'save-education',
    endpoint: 'HR',
    payload: { ...data }
  }),  
  listEducation: (id: number,openId:number) => fetchDataItemService<ProfileEducationData, { id: number,openId:number }>({
    actionName: 'list-education',
    endpoint: 'HR',
    payload: { id,openId }
  }), 
  listEducationModify: (id: number,type:number) => fetchDataListService<EducationData, { id: number,type: number }>({
    actionName: 'list-education-modify',
    endpoint: 'HR',
    payload: { id,type }
  }),  

  listLocation: (id: number) => fetchDataListService<LocationData, { id: number }>({
    actionName: 'list-location',
    endpoint: 'HR',
    payload: { id }
  }),  
  saveEssProfileAdr: (data: LocationData) => execDataService0<LocationData>({
    actionName: 'save-profile-adr',
    endpoint: 'HR',
    payload: { ...data }
  }),
  // image list
  listImageProfile: (id: number,type: number,isNew: number,refId: number) => fetchDataListService<FilesData, { id: number,type: number,isNew: number,refId: number }>({
    actionName: 'list-profile-image',
    endpoint: 'HR',
    payload: { id,type,isNew,refId }
  }),  
  // activity list
  listActivityProfile: (id: number) => fetchDataListService<ActivityData, { id: number }>({
    actionName: 'list-profile-activity',
    endpoint: 'HR',
    payload: { id }
  }),  
  
   


}