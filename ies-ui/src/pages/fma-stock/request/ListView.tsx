import BaseCrud from "@/components/base-crud"
import { formatDate } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, EyeFilled } from "@ant-design/icons";
import { SearchParams, StockRequestAdvanceSearchParams,StockRequestDetailResponse,StockRequestListItem } from "./data.types";
import { createService } from "./services";
import { history, useModel } from 'umi';
import Status from "@/components/Status";
import { Badge, Button, Flex, Radio, Space, Tooltip, message } from "antd";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import TableView, { FetchPagingParams } from "@/components/DataCrud/TableView";
import { Paging } from '@/services/API';
import { useRef, useState } from "react";
import DataDetailView from "./DataDetailView";

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

  
export default ({ onAdd, onEdit }: Props) => {
  const cacheList = useModel('dataList');
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<StockRequestAdvanceSearchParams>({
      status: 'ALL',
  });

  const [viewDetail, setViewDetail] = useState<{
    visible: boolean;
    data?: StockRequestDetailResponse;
    instId?: string;
    forceRefresh?: number;
  }>({ visible: false });

  const onRequestHandler = async (
      params: FetchPagingParams<SearchParams>,
  ) => {
      try {
          return services.fetchPaging(params).then((it) => {
          return cacheList.cacheDataList({
              type: 'fma-stock-request',
              criteria: params,
              data: it,
          });
          }) as Promise<Paging<StockRequestListItem>>;
      } catch (error: any) {
          message.error(error.message);
          return Promise.reject();
      }
  };
  const onDetailhandler = async (data: StockRequestListItem) => {
    try {
      const detail = await services.detailByProcessFlow(data.instanceId||'');
      setViewDetail(v=> {
        return { 
          visible: true, 
          data: detail, 
          instId: data.instanceId||'',
          forceRefresh: v?.forceRefresh||0 + 1
        }
      });
    } catch (error: any) {
      message.error(error.message || 'Faild to load data.');
    }
  };

  return  <PageContainer onBack={history.back} title="NCM Stock Request">
      <TableView<StockRequestListItem, SearchParams>
        cache
        bordered
        addButtonLabel="New Request"      
        tableProps={{
          actionRef: actionRef
        }}      
        extraFilter={
            <Space size="large">
                <Radio.Group
                    value={advanceSearchParams.status}
                  onChange={(e) => {
                    console.log('status',e.target.value)
                      setAdvanceSearchParams((v) => ({
                          ...v,
                          status: e.target.value
                      }));
                      actionRef.current?.reloadAndRest?.();
                  }}
                >
                    <Radio.Button value="ALL">All</Radio.Button>
                    <Radio.Button value="PENDING">Pending</Radio.Button>                      
                    <Badge size="small" offset={[-20, 0]} count={0}>
                        <Radio.Button value="APPROVED">Approved</Radio.Button>
                    </Badge>
                    <Badge size="small" offset={[-20, 0]} count={0}>
                        <Radio.Button value="REJECTED">Rejected</Radio.Button>
                    </Badge>
                </Radio.Group>
            </Space>
        }
        columns={[
          {
            title: '',
            width: 10,
            render: (_, r) => (
                <Tooltip title="View Data">
                  <Button
                    size="small"
                    type="link"
                    icon={<EyeFilled />}
                    onClick={() => onDetailhandler(r)}
                  />
                </Tooltip>
            ),
          },{
            title: 'Form No',
            sorter: 'formNo',
            width: 100,
            render: (_, r) => (
              <Flex gap={5}>
                <Button
                  size="small"
                  type="link"
                  icon={<ExportOutlined />}
                  onClick={async () => {
                    window.open(`/external/data-form/ncm_stock_request_process/${r.instanceId}`, '_blank')?.focus();
                  }}
                />
                <a
                  onClick={() =>
                    history.push(`/data-form/ncm_stock_request_process/${r.instanceId}`)
                  }
                >
                  {r.formNo}
                </a>
              </Flex>

            ),
          },
          {
            title: 'Expected Dt',
            align: 'right',
            sorter: 'requestedDate',
            width: 130,
            render: (_, r) => formatDate(r.requestedDate),
          },
          {
            title: 'Requested By',
            width: 130,
            sorter: 'requestedBy',
            render: (_, r) => r.requestedBy,
          },
          {
            title: 'Requested Dt',
            align: 'right',
            sorter: 'createdDate',
            width: 130,
            render: (_, r) => formatDate(r.createdDate),
          },
          {
            title: 'Status',
            dataIndex: 'workflowStatus',
            width: 70,
            render: (_, r) => r.workflowStatus && <Status text={r.workflowStatus} />,
          }
        ]}
        actionHandlers={{
            onAdd: onAdd,
            onRequest: (criteria, pagination, sort) =>
              onRequestHandler({
                criteria: {
                  ...criteria,
                  searchValue: criteria?.searchValue ?? '',
                  advanceSearch: advanceSearchParams,
                  // sort,
                },
                sort,
                pagination,
              }),
            onFirstLoad: (criteria, pagination) => cacheList.fetchDataList('fma-stock-request').then((v) => {
                if (v) {
                  console.log('arrived here???',criteria);
                  setAdvanceSearchParams({
                    ...v.creteria?.criteria,
                    searchValue: v.creteria?.criteria?.searchValue ?? '',
                    status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',                        
                  });
                  return v.dataList;
                } else {
                  return onRequestHandler({
                    criteria: {
                      ...criteria,
                      searchValue: criteria?.searchValue ?? '',
                      advanceSearch: advanceSearchParams,
                      // sort,
                    },
                    pagination,
                  });
                }
              }) as Promise<Paging<StockRequestListItem>>,
      }}           
    />
    <DataDetailView
      open={viewDetail.visible}     
      instId= {viewDetail.instId}
      forceRefresh={viewDetail.forceRefresh}
      onOpenChange={(v) => v == false && setViewDetail({ visible: false })}
    /> 
  </PageContainer>
}

