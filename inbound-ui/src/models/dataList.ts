import { useState } from 'react';
import { Paging } from '../services/API';
import { TransferRequest } from '@/pages/prod/inventory-transfer-request/data';

type DataList =
  | {
      type: 'transfer-request-list';
      criteria?: any;
      data: Paging<TransferRequest>;
    }
  | {
      type: 'whh-inventory-transfer-request';
      criteria?: any;
      data: Paging<any>;
    }
  | {
      type: 'transfer-request-final-list';
      criteria?: any;
      data: Paging<any>;
    }
  | {
      type: string;
      criteria?: any;
      data: any;
    };

export type MomainType =
  | 'transfer-request-list'
  | 'whh-inventory-transfer-request'
  | 'transfer-request-final-list'
  | string;

export default () => {
  const [cacheData, seCacheData] = useState<DataList>();

  const cacheDataList = (data: DataList) => {
    seCacheData(data);
    return data.data;
  };

  const fetchDataList = (type: MomainType) => {
    if (type !== cacheData?.type) {
      seCacheData(undefined);
      return Promise.resolve(undefined);
    }
    return Promise.resolve({ dataList: cacheData?.data, creteria: cacheData.criteria });
  };

  return {
    cacheDataList: cacheDataList,
    fetchDataList: fetchDataList,
  };
};
