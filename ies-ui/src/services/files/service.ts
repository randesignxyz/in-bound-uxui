import { RequestActions, ServiceApiType, singleRequest } from "../apiGateway";
import { AttachmentFile } from "../data";

const FilesParams = {
    list: (
     fileIds: string[],
    ): ServiceApiType<{ list: string[] }> => ({
      type: 'LIST_QUERY',
      endpoint: 'FILE',
      actionName: 'list-files-by-ids',
      payload: { list: fileIds },
    }),
  
  };

  export const FileServiceAPI = (requestActions: RequestActions) => {
    return {
      list: (fileIds:  string[]) => singleRequest<AttachmentFile>(FilesParams.list(fileIds))(requestActions) as Promise<AttachmentFile[]>,
    };
  };
  