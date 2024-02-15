import { getServiceUrl } from "@/services/ApiUrl";
import { RequestActions } from "@/services/apiGateway";
import { request } from 'umi';

export const getUploadFileObjectUrlV22 = (actions?: RequestActions) => async (fileId: string) => {
    try {
      actions?.start?.();
      const blob = request<Blob>(`${getServiceUrl('FILE')}/file/${fileId}`, {
        responseType: 'blob',
      }).finally(() => {
        actions?.end?.('SUCCESS');
      });
      //.concat(`${(await blob).type}`)
    //   return URL.createObjectURL(await blob);
    return blob
    } catch (error) {
      actions?.end?.('FAILED');
      throw error;
    }
  };