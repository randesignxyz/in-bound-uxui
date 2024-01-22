import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { Tag, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FuelAvanceSearchParam, FuelDTO } from '../../fuel/data';
import { FuelServiceAPI } from '../../fuel/service';
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import Omit from 'omit.js';
import { useModel } from '@umijs/max';

export type Member = {
  date: String;
  qty: number;
  cost: string;
  total: number;
  fuelType: string;
  driver: string;
};

interface Props {
  id: string;
}


export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const [fuel, setFuel] = useState<FuelDTO[]>([]);
  const actionRef = useRef<ActionType>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<FuelAvanceSearchParam>({
    status: 'Posted',
  });

  const onLoadData = useCallback(async () => {
    setFuel(await FuelServiceAPI(requestActions).list(id))
  }, [id])

  useEffect(() => {
    onLoadData()
  }, [id])

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<FuelAvanceSearchParam>) => {
    try {

      return FuelServiceAPI(requestActions).page({
              ...params.criteria, 
              criteria:{
                searchValue: params.criteria?.searchValue, 
                sort:{...params.criteria?.sort},
                advanceSearch: {vehicleId:id}
              },
              pagination:params.pagination
            }).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-fuel',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<FuelDTO>>;


      ;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
      <TableView

        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        displayOnly
        cache
        columns={[
          {
            key: "refilledDate",
            title: "Date",
            valueType: "date",
            dataIndex: "refilledDate",
            sorter: "refilledDate",
          },
         
          {
            key: "driverName",
            title: "Driver",
            sorter: "driverName",
            dataIndex: "driverName"
          },


          {
            key: "pumpBy",
            title: "Pump By",
            dataIndex: "pumpBy",
            sorter: "pumpBy",
          },
          {
            key: "quantity",
            title: "Quantity(L)",
            dataIndex: "quantity",
            sorter: "quantity",
            render: (_, r) => <Tag color='green'>{r.quantity?.toFixed(2)} L</Tag>
          },
          {
            key: "kilometer",
            title: "Odometer",
            sorter: "kilometer",
            render: (_, r) => <Tag color='blue'>{r.kilometer?.toFixed(2)} km</Tag>
          },
          {
            key: "reciept",
            title: "Tank Station",
            render: (_, r) => r.gasStation?.tankName
          },
          {
            key: "type",
            title: "Type",
            render: (_, r) => r.gasType?.name
          },
          {
            key: "reciept",
            title: "Receipt Number",
            dataIndex: "receiptNumber"
          },
          {
            key: "status",
            title: "Consumption Rate",
            dataIndex: "status",
            render: (_, r) => <div style={{ color: r.status != "Normal" ? "#f1c822" : "" }}>{r.status}</div>

          },
       
        ]}
        
        tableProps={{
          actionRef: actionRef,
        }}
        advanceSearch
        actionHandlers={{
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('retailer-customer').then((v) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<FuelDTO>>,
        }}


      />

  );
};


