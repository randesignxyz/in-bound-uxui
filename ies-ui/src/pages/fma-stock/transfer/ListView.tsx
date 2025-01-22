import { formatDate } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, EyeFilled, UploadOutlined } from "@ant-design/icons";
import { SearchParams, TransferRequestAdvanceSearchParams,TransferRequestDetailResponse,TransferRequestListItem } from "./data.types";
import { createService } from "./services";
import { history, useModel, useAccess } from 'umi';
import Status from "@/components/Status";
import { Badge, Button, Flex, Modal, Radio, Space, Tooltip, message } from "antd";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import TableView, { FetchPagingParams } from "@/components/DataCrud/TableView";
import { Paging } from '@/services/API';
import { useEffect, useRef, useState } from "react";
import DataDetailView from "./DataDetailView";
import { TransferRequestFormNames } from "./process-flow";


interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

  
export default ({ onAdd, onEdit }: Props) => {
  const access = useAccess();
  const cacheList = useModel('dataList');
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const [selectedStatus, setSelectedSatus] = useState<string>('ALL');
  const [selectedPostStatus, setSelectedPostStatus] = useState<string>('ALL');
  const [forceReload, setForceReload] = useState(0)
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferRequestAdvanceSearchParams & {integratedStatus: 'ALL'|'POSTED'|'FAILED'}>({
      status: 'ALL',
      integratedStatus: 'ALL'
  });

  const [viewDetail, setViewDetail] = useState<{
    visible: boolean;
    data?: TransferRequestDetailResponse;
    instId?: string;
    forceRefresh?: number;
  }>({ visible: false });

  useEffect(() => {
    if (forceReload && forceReload > 1) {
      actionRef.current?.reloadAndRest?.()
    }
  }, [forceReload])

  const onRequestHandler = async (
      params: FetchPagingParams<SearchParams>,
  ) => {
      try {
          return services.fetchPaging(params).then((it) => {
          return cacheList.cacheDataList({
              type: 'whh-inventory-transfer-request',
              criteria: params,
              data: it,
          });
          }) as Promise<Paging<TransferRequestListItem>>;
      } catch (error: any) {
          message.error(error.message);
          return Promise.reject();
      }
  };
  const onDetailhandler = async (data: TransferRequestListItem) => {
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

  const onPostHandler = (transfer: TransferRequestListItem) => {
    Modal.confirm({
      title: 'Post Inventory Transfer to SAP',
      content: "Are you sure?",
      onOk: async () => {
        try {          
          await services.postInventoryTransfer(transfer.id)
          message.success("Successfully posted.")
          setForceReload(v => v + 1)
        } catch (error: any) {
          message.error(error.message || "Failed to post.")
          setForceReload(v => v + 1)
        }

      }
    })
  }

  return  <PageContainer onBack={history.back} title="Transfer Request List">
      <TableView<TransferRequestListItem, SearchParams> 
        cache       
        bordered={true}       
        addButtonLabel="New Request"      
        tableProps={{
          actionRef: actionRef
        }}      
        extraFilter={
            <Space size="small">
                <Radio.Group
                    value={advanceSearchParams.status}
                  onChange={(e) => {
                      setSelectedSatus(e.target.value)
                      setSelectedPostStatus('ALL')
                      setAdvanceSearchParams((v) => ({
                          ...v,
                          status: e.target.value,
                          integratedStatus: 'ALL'
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
                {['ALL', 'APPROVED'].some((it) => it == selectedStatus) &&<Radio.Group
                    value={advanceSearchParams.integratedStatus}
                  onChange={(e) => {
                      setSelectedPostStatus(e.target.value)
                      setAdvanceSearchParams((v) => ({
                          ...v,
                          integratedStatus: e.target.value
                      }));
                      actionRef.current?.reloadAndRest?.();
                  }}
                >
                    <Radio.Button value="ALL">All</Radio.Button>
                    <Radio.Button value="POSTED">Posted</Radio.Button>                      
                    <Badge size="small" offset={[-20, 0]} count={0}>
                        <Radio.Button value="FAILED">Failed</Radio.Button>
                    </Badge>                   
                </Radio.Group>}
            </Space>
        }
        columns={[
          {
            title: 'Transfer Information',           
            children: [{
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
                width: 120,
                render: (_, r) => (
                  <Flex gap={5}>
                    <Button
                      size="small"
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={async () => {
                        window.open(`/external/data-form/${TransferRequestFormNames.processDefKey}/${r.instanceId}`, '_blank')?.focus();
                      }}
                    />
                    <a
                      onClick={() =>
                        history.push(`/data-form/${TransferRequestFormNames.processDefKey}/${r.instanceId}`)
                      }
                    >
                      {r.formNo}
                    </a>
                  </Flex>
    
                ),
              },
              {
                title: 'Expected Date',
                align: 'right',
                sorter: 'requestedDate',
                width: 130,
                render: (_, r) => formatDate(r.requestedDate),
              },
              {
                title: 'Requested By',
                // width: 130,
                sorter: 'requestedBy',
                render: (_, r) => r.requestedBy,
              },
              {
                title: 'From Warehouse',
                // width: 130,
                sorter: 'warehouseFrom',
                render: (_, r) => r.warehouseFrom,
              },
              {
                title: 'To Warehouse',
                // width: 130,
                sorter: 'warehouseTo',
                render: (_, r) => r.warehouseTo,
              },
              {
                title: 'Requested Date',
                align: 'right',
                sorter: 'createdDate',
                width: 140,
                render: (_, r) => formatDate(r.createdDate),
              },
              {
                title: 'Status',
                dataIndex: 'workflowStatus',
                // align: 'center',
                // width: 70,
                render: (_, r) => r.workflowStatus && <Status text={r.workflowStatus} />,
              },
            ]
          },          
          {
            title: 'SAP Information',
            width: '150px',
            hideInTable: !['ALL', 'APPROVED'].some((it) => it == selectedStatus),
            children: [
              { title: 'Posted Date', width: 130, sorter: "postedDate", render: (_, r) => r.postedDate && formatDate(r.postedDate) },
              { title: 'Doc Num', sorter: "sapDocNo", width: 100, render: (_, r) => r.sapDocNo },
              { title: 'Status', 
                width: 80,
                render: (_, r) => r.integratedStatus && <Status text={(r.integratedStatus || 'FAILED')}/>
              },{
                width: 1,
                render: (_, r) =>                 
                  access.canPostedInventoryTransferSAP && 
                (['APPROVED'].some(it => it == r.workflowStatus)  && (r.integratedStatus || 'FAILED') == 'FAILED') &&
                <Button title='Post inventory transfer to SAP' type="link" danger  onClick={() => onPostHandler(r)} icon={<UploadOutlined />}/>
                
              },
            ],
          },          
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
            onFirstLoad: (criteria, pagination) => cacheList.fetchDataList('whh-inventory-transfer-request').then((v) => {
                if (v) {
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
              }) as Promise<Paging<TransferRequestListItem>>,
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

