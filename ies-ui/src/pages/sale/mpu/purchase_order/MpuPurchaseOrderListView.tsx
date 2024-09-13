import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { Button, Dropdown, MenuProps, Modal, Tag, message } from 'antd';
import { useRef, useState } from 'react';
import { PurchaseOrderServiceAPI } from './services';
import { useModel } from '@umijs/max';
import MpuPurchaseOrderForm from './MpuPurchaseOrderForm';
import { ActionType } from '@ant-design/pro-components';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, EllipsisOutlined, ArrowRightOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { PurchaseOrderAdvanceSearch, PurchaseOrderCreate, PurchaseOrderDTO } from './data';

interface Props {
  onDetail: (id: number) => void
}
export default ({ onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [state, setState] = useState<{
    visible?: {
      name: "MODAL",
      type: "ADD" | "EDIT",
      payloads?: PurchaseOrderDTO
    }
  }>();
  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<PurchaseOrderAdvanceSearch>) => {
    try {
      return services.page(params) as Promise<Paging<PurchaseOrderDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };
  const items = (items: PurchaseOrderDTO): MenuProps["items"] => [
    {
      key: "view",
      label: "View",
      itemIcon: <ArrowRightOutlined />,
      onClick: () => onDetail?.(items.id)
    },
    {
      key: "edit",
      label: "Edit",
      itemIcon: <EditOutlined />,
    },
    {
      type: "divider"
    },
    {
      key: "delete",
      label: "Delete",
      danger: true,
      disabled: items.status != "pending",
      itemIcon: <DeleteOutlined />,
      onClick: () => {
        Modal.confirm({
          title: "Delete Purchase Request",
          content: "are you sure?",
          onOk: () => {
            actionRef.current?.reload?.();
          }
        })
      },
    },
  ]
  return (
    <>
      <TableView<PurchaseOrderDTO, { searchValue?: string }>
        cache
        columns={[
          {
            title: 'Purchase Request No',
            dataIndex: "purchaseRequestNo",
            render: (_, r) => <Button type='link' onClick={() => onDetail?.(r.id)}>{r.purchaseRequestNo}</Button>
          },
          {
            title: 'Distributor Name',
            dataIndex: "distributorName",
            render: (_, r) => r.purchaseRequest?.distributorName
          },
          {
            title: 'Saleperson Name',
            dataIndex: 'ownerBy',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => <Tag
              icon={
                r.status == "pending" ? <SyncOutlined spin />
                  : r.status == "paid" ? <CheckCircleOutlined />
                    : r.status == "rejected" ? <CloseCircleOutlined />
                      : <ExclamationCircleOutlined />
              }
              bordered={false}
              color={
                r.status == "pending"
                  ? "processing"
                  : r.status == "paid" ? "success"
                    : r.status == "rejected" ? "error"
                      : "warning"
              }>{r.status.toUpperCase()}</Tag>
          },
          {
            title: 'Order Date ',
            dataIndex: 'purchaseOrderDate',
            valueType: "date"
          },
          {
            title: 'Grant Amount',
            dataIndex: "grantAmount",
            valueType: "money"
          },
          {
            title: 'Discount Amount',
            dataIndex: "discountAmount",
            valueType: "percent"
          },
          {
            title: 'Total Amount',
            dataIndex: "totalAmount",
            valueType: "money"
          },
          {
            title: 'Action',
            align: "center",
            render: (_, r) => {
              return (
                <Dropdown
                  menu={{
                    items: items(r),
                    style: {
                      width: 200
                    }
                  }}
                >
                  <a><EllipsisOutlined /></a>
                </Dropdown>
              );
            },
          },
        ]}
        tableProps={{
          actionRef: actionRef
        }}
        actionHandlers={{
          onAdd: () => setState({ visible: { name: "MODAL", type: "ADD" } }),
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                // advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('sales-product-item').then((v) => {
              if (v) {
                // setAdvanceSearchParams({
                //   ...v.creteria?.criteria,
                //   status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                // });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    // advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<PurchaseOrderDTO>>,
        }}
      />
      <MpuPurchaseOrderForm
        open={state?.visible?.name === "MODAL"}
        onCancel={() => setState({ visible: undefined })}
        onSave={(data: PurchaseOrderCreate) => {
          Modal.confirm({
            title: "Save Purchase Order",
            content: "are you sure?",
            onOk: async () => {
              services.save(data).then((s) => {
                actionRef.current?.reload?.();
                setState({ visible: undefined });
              });
            }
          })
        }}
      />
    </>
  );
};
