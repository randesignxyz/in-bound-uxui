import { RequestActions, ServiceApiType, singleRequest } from '@/services/apiGateway';
import { AttachmentFilesCreate, AttachmentFilesDTO, LookUpDataDTO, LookUpDataParam } from './data';

const LookupDataAction = {
  listLookupData: (param: LookUpDataParam): ServiceApiType<LookUpDataParam> => ({
    type: 'LIST_QUERY',
    actionName: 'look-up-data-list',
    endpoint: 'FLEET',
    payload: param,
  }),

  saveAttachment: (data: AttachmentFilesCreate): ServiceApiType<AttachmentFilesCreate> => ({
    actionName: 'save-attache-file',
    endpoint: 'FLEET',
    type: 'EXEC',
    payload: data,
  }),

  listAttachemnet: (id: string): ServiceApiType<{ id?: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'FLEET',
    actionName: 'fetch-attach-file',
    payload: { id },
  }),
};

export const LookupDataServiceAPI = (requestActions: RequestActions) => {
  return {
    lookupData: (data: LookUpDataParam) =>
      singleRequest<LookUpDataDTO>(LookupDataAction.listLookupData(data))(
        requestActions,
      ) as Promise<LookUpDataDTO[]>,

    listAttachemnet: (codeType: string) =>
      singleRequest<AttachmentFilesDTO>(LookupDataAction.listAttachemnet(codeType))(
        requestActions,
      ) as Promise<AttachmentFilesDTO[]>,

    saveAttachment: (data: AttachmentFilesCreate) =>
      singleRequest<{ data: string; message: string }>(LookupDataAction.saveAttachment(data))(
        requestActions,
      ),
  };
};
