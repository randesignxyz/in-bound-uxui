import type { RequestConfig, RequestOptions } from '@umijs/max';
import { message, notification } from 'antd';
import { offlineToken } from '../src/pages/utils';

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

const header = (headers?: any): any => {
  const token = localStorage.getItem('accessToken') || offlineToken();
  return {
    ...headers, ...token && {
      Authorization: `Bearer ${token}`,
    }
  };
};


/**
 * @name 
 * pro 
 * @doc https://umijs.org/docs/max/request#
 */
export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; //
      }
    },

    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              // message.warning(errorMessage);
              notification.warning({ message: errorMessage })
              break;
            case ErrorShowType.ERROR_MESSAGE:
              notification.warning({ message: errorMessage })
              // message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              notification.error({ message: errorMessage })
            // message.error(errorMessage);
          }
        }
      } else if (error.response) {
        const { response: { status, data } } = error;
        const { response: { data: { message } } } = error;
        const errorMessage = message || error.response.message
        if (status === 500 || data?.status === 550 || status === 505) {
          throw { error, message: errorMessage }
        } else if (status == 404) {
          // message.error("Services not responding.");
          notification.error({ message: 'Services not responding.', key: "404", description: errorMessage.error, role: 'alert' })
          return
        }
        notification.error({ message: ` Response status:${error.response.status}` });
      } else if (error.request) {
        // message.error('None response! Please retry.');
        notification.error({ message: 'None response! Please retry.' })
      } else {
        // message.error('Request error, please retry.');
        notification.error({ message: 'Request error, please retry.' })
      }
    },
  },
  requestInterceptors: [
    async (config: RequestOptions) => {
      const url = config?.url
      const matchs = ['/api/', '/services/']
      const requiredToken = matchs.some(it => config.url?.startsWith(it))

      const hd = requiredToken ? await header(config.headers) : config.headers
      return { ...config, headers: hd, url };
    },
  ],

  responseInterceptors: [
    (response) => {
      const { data } = response as unknown as ResponseStructure;
      if (data?.success === false) {
        notification.error({ message: 'Failed to request.' })

      }
      return response;
    },
  ],
};
