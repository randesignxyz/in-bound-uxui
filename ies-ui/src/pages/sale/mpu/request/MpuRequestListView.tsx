import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';

import { useModel } from '@umijs/max';
import { Button, Dropdown, MenuProps, message, Modal, Tag } from 'antd';
import { useRef } from 'react';
import { PurChaseRequestAPIService } from './service';
import { PurchaseRequestDTO, PurchaseReqeustAdvanceSearch } from './data';

interface Props {
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  onDetail?: (id: number) => void;
}

export default ({ onAdd, onDetail, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = PurChaseRequestAPIService(requestActions);
  const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<PurchaseReqeustAdvanceSearch>) => {
    try {
      return services.page(params) as Promise<Paging<PurchaseRequestDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const items = (items: PurchaseRequestDTO): MenuProps["items"] => [
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
      onClick: () => onEdit?.(items.id)
    },
    {
      type:"divider"
    },  
    {
      key: "delete",
      label: "Delete",
      danger:true,
      disabled:items.status !="pending",
      itemIcon: <DeleteOutlined />,
      onClick: () => {
        Modal.confirm({
          title:"Delete Purchase Request",
          content:"are you sure?",
          onOk:async()=>{
            await services.delete(items.id);
            actionRef.current?.reload?.();
          }
        })
      },

    },
  ];
  return (
    <>
      <TableView<PurchaseRequestDTO, { searchValue?: string }>
        cache
        hasCriteria
        columns={[
          {
            title: 'No',
            dataIndex: "purchaseRequestNo",
            render: (_, r) => <Button type='link' onClick={() => onDetail?.(r.id)}>{r.purchaseRequestNo}</Button>
          },
          {
            title: 'Requester',
            dataIndex: "requestedBy"
          },
          {
            title: 'Distributor Name',
            dataIndex: 'distributorName',
          },
          {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => <Tag
              icon={
                r.status == "pending" ? <SyncOutlined spin />
                  : r.status == "closed" ? <CheckCircleOutlined />
                    : r.status == "rejected" ? <CloseCircleOutlined />
                      : <ExclamationCircleOutlined />
              }
              bordered={false}
              color={
                r.status == "pending"
                  ? "processing"
                  : r.status == "closed" ? "success"
                    : r.status == "rejected" ? "error"
                      : "warning"
              }>{r.status.toUpperCase()}</Tag>
          },
          {
            title: 'GrantAmount',
            dataIndex: 'grantAmount',
            valueType:"money",
          },
          {
            title: 'Total Amount',
            dataIndex: "totalAmount",
            valueType: "money"
          },
          {
            title: 'Requested Date',
            dataIndex: "requestedDate",
            valueType: "date"
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
        actionHandlers={{
          onAdd: onAdd,
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                //advanceSearch: advanceSearchParams,
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
            }) as Promise<Paging<PurchaseRequestDTO>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
    </>
  );
};