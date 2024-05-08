import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { Button, Modal, Radio, Select, Space, Tag, message } from 'antd';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import ApproveRemarkFormModal from '../../ApproveRemarkFormModal';
import RemarkFormModal from '../../RemarkFormModal';
import DetailView from '../DetailView';
import { AddSupplierParams, TransferRequest, TransferRequestAdvanceParams } from '../data';
import { ItemServiceAPI, TransferRequestServiceAPI } from '../service';
import FormModal from './FormModal';
// import InventoryModelForm from "./InventoryModelForm";

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  data?: string;
}

export default ({ onAdd }: Props) => {
  const requestActions = simpleRequestActions();
  const access = useAccess();
  const services = TransferRequestServiceAPI(requestActions);
  // const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferRequestAdvanceParams>({
    business_unit: 'ALL',
    state: 'in-progress',
  });
  const actionRef = useRef<ActionType>();
  const [commentModal, setCommentModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });
  const [approveModel, setApproveModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });
  const [Model, setModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
    data?: TransferRequest;
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });

  const cacheList = useModel('dataList');
  const [viewDetail, setViewDetail] = useState<{
    visible: boolean;
    data?: TransferRequest;
  }>({ visible: false });

  const onRequestHandler = async (params: TableViewSearchParams<TransferRequestAdvanceParams>) => {
    try {
      return services.page_warehouse(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'transfer-request-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<TransferRequest>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onDetailhandler = async (data: TransferRequest) => {
    try {
      const detail = await services.detail(data.id);
      setViewDetail({ visible: true, data: detail });
    } catch (error: any) {
      message.error(error.message || 'Faild to load data.');
    }
  };

  // const onSaveActionHandler = (data: TransferRequestCreate) => {
  //   Modal.confirm({
  //     title: 'Save Transfer Request record',
  //     content: 'are you sure',
  //     onOk: async () => {
  //       const response = (await services.save(data)) as {
  //         data: string;
  //         message: string;
  //       };
  //       // await services.save_activites(activities)
  //       setStateOpen((v) => ({ ...v, visible: undefined }));
  //       actionRef.current?.reloadAndRest?.();
  //       message.success(response.data);
  //     },
  //   });
  // };

  useEffect(() => {
    if (access.canAccessNVCItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'NVC' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessOFLItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'OFL' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessOMMItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'OMM' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'ALL' }));
      actionRef.current?.reloadAndRest?.();
    } else {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'none' }));
      actionRef.current?.reloadAndRest?.();
    }
  }, []);

  return (
    <>
      <TableView
        hasCriteria={Object.values(Omit(advanceSearchParams, ['business_unit'])).some((v) => v)}
        cache
        displayOnly
        extraFilter={
          <Space size="large">
            {access.canAccessItem ? (
              <Radio.Group
                value={advanceSearchParams.business_unit}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    business_unit: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">All</Radio.Button>
                <Radio.Button value="NVC">NVC</Radio.Button>
                <Radio.Button value="OFL">OFL</Radio.Button>
                <Radio.Button value="OMM">OMM</Radio.Button>
              </Radio.Group>
            ) : (
              ''
            )}
            <Select
              defaultValue="in-progress"
              style={{ width: 120 }}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  state: e,
                }));
                actionRef.current?.reloadAndRest?.();
              }}
              options={[
                { value: 'in-progress', label: 'In Progress' },
                { value: 'rejected', label: 'Rejectetd' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
        }}
        columns={[
          {
            key: 'id',
            title: 'ID',
            dataIndex: 'id',
            render: (_, r) => (
              <a onClick={() => onDetailhandler(r)}>PDR-{String(r.id).padStart(6, '0')}</a>
            ),
          },
          {
            key: 'transfer_type',
            title: 'Type',
            dataIndex: 'transfer_type',
          },
          {
            width: 80,
            key: 'line',
            title: 'Line',
            dataIndex: 'line',
          },
          {
            width: 80,
            key: 'shift',
            title: 'Shift',
            dataIndex: 'shift',
          },
          {
            width: 150,
            key: 'from_warehouse',
            title: 'From Warehouse',
            dataIndex: 'from_warehouse',
            render: (_, r) => r.from_warehouse.map((w) => w.whsCode),
          },
          {
            width: 150,
            key: 'to_warehouse',
            title: 'To Warehouse',
            dataIndex: 'to_warehouse',
            render: (_, r) => r.to_warehouse.map((w) => w.whsCode),
          },
          {
            key: 'tendency',
            title: 'Business Unit',
            dataIndex: 'tendency',
            render: (_, r) => r.from_warehouse.map((w) => w.tendency),
          },
          {
            key: 'createdBy',
            title: 'Created By',
            dataIndex: 'createdBy',
          },
          {
            key: 'date',
            title: 'Created Date',
            valueType: 'date',
            dataIndex: 'createdDate',
            sorter: 'createdDate',
          },
          {
            key: 'status',
            title: 'Status',
            render: (_, r) =>
              r.state === 'in-progress' ? (
                <Tag color="processing" bordered={false}>
                  Pending
                </Tag>
              ) : r.state === 'rejected' ? (
                <Tag color="error" bordered={false}>
                  Rejected
                </Tag>
              ) : r.state === 'completed' ? (
                <Tag color="success" bordered={false}>
                  Completed
                </Tag>
              ) : (
                ''
              ),
          },
          {
            render: (_, r) => (
              <>
                {r.status === 'request-production-approve' ? (
                  <>
                    <Button
                      style={{ width: '30%' }}
                      onClick={() => {
                        // setApproveModal({ visible: true, id: r.id, transfer_id: r.transfer_id });
                        setModal({ visible: true, id: r.id, transfer_id: r.transfer_id, data: r });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      style={{ width: '30%', marginLeft: 10, marginRight: 10 }}
                      onClick={() => {
                        setCommentModal({ visible: true, id: r.id, transfer_id: r.transfer_id });
                      }}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  ''
                )}
              </>
            ),
          },
        ]}
        actionHandlers={{
          onAdd: () => onAdd?.(),
          // onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
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
            cacheList.fetchDataList('paging-testing').then((v: any) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  // status: v.creteria?.criteria?.advanceSearch?.status ?? '',
                  // searchValue:''
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<TransferRequest>>,
        }}
      />
      <DetailView
        open={viewDetail.visible}
        data={viewDetail.data}
        onVisibleChange={(v) => v === false && setViewDetail({ visible: false })}
      />

      <RemarkFormModal
        title="Reject Form"
        open={commentModal.visible}
        onCancel={() => {
          setCommentModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark, transfer_id) => {
          const response: { data: string; message: string } = (await services.status_change({
            id: id,
            remark: remark,
            statusChange: 'transfer-request-warehouse-reject',
            state: 'rejected',
          })) as { data: string; message: string };
          await services.save_activites({
            activities_name: 'Warehouse Approval',
            action: 'Rejected',
            remark: remark,
            transfer_request: transfer_id,
          });
          setCommentModal({ visible: false, id: undefined });
          message.info(response.message);
          actionRef.current?.reload();
        }}
        id={commentModal.id ?? ''}
        transfer_id={commentModal.transfer_id ?? ''}
      />
      <ApproveRemarkFormModal
        title="Approve Form"
        open={approveModel.visible}
        onCancel={() => {
          setApproveModal({ visible: false, id: undefined });
        } }
        onSave={async (id, remark, transfer_id) => {
          const response: { data: string; message: string; } = (await services.status_change({
            id: id,
            remark: remark,
            statusChange: 'request-warehouse-approve',
            state: 'in-progress',
          })) as { data: string; message: string; };
          await services.save_activites({
            activities_name: 'Warehouse Approval',
            action: 'Approved',
            remark: remark,
            transfer_request: transfer_id,
          });
          setApproveModal({ visible: false, id: undefined });
          message.info(response.message);
          actionRef.current?.reload();
        } }
        id={approveModel.id ?? ''}
        transfer_id={approveModel.transfer_id ?? ''} data={undefined}      />
      <FormModal
        title="Approve Form"
        open={Model.visible}
        onCancel={() => {
          setModal({ visible: false, id: undefined });
        }}
        onSave={async (data: AddSupplierParams, id, remark, transfer_id) => {
          // const response: { data: string; message: string } =
          //   (await services.status_change({
          //     id: id,
          //     remark: remark,
          //     status: "request-warehouse-approve",
          //     state:"in-progress"
          //   })) as { data: string; message: string };
          //   await services.save_activites({
          //     activities_name: 'Warehouse Approval',
          //     action: 'Approved',
          //     remark: remark,
          //     transfer_request: transfer_id
          //   });
          Modal.confirm({
            title: 'Save Transfer Request record',
            content: 'are you sure',
            onOk: async () => {
              console.log(data)
              await services.provided({item:data,transfer_request:transfer_id})
              for (let i = 0; i < data.length; i++) {
                await ItemServiceAPI(requestActions).add_supplier(data[i]);
              }

              // const response = (await services.status_change({
              //   id: id,
              //   remark: remark,
              //   statusChange: 'request-warehouse-approve',
              //   state: 'in-progress',
              // })) as { data: string; message: string };
              // await services.save_activites({
              //   activities_name: 'Warehouse Approval',
              //   action: 'Approved',
              //   remark: remark,
              //   transfer_request: transfer_id,
              // });
              setModal({ visible: false, id: undefined });
              actionRef.current?.reloadAndRest?.();
              message.success('Success');
            },
          });
          // console.log(id, remark, transfer_id)

          // message.info(response.message);
          actionRef.current?.reload();
        }}
        id={Model.id ?? ''}
        transfer_id={Model.transfer_id ?? ''}
        data={Model.data ?? undefined}
      />
    </>
  );
};
