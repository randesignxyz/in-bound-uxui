

import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { Button, message, Tag, Tooltip } from 'antd';
import numeral from 'numeral';
import { useRef, useState } from 'react';
import { PurchaseOrderDTO } from '../mpu/purchase_order/data';
import MpuPoEntryForm from '../mpu/purchase_order/MpuPOEntryForm';
import { PurchaseOrderServiceAPI } from '../mpu/purchase_order/services';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import moment from 'moment';
import POPrintModal from './POPrintModal';
import MpuPoDetail from './MpuPODetail';
import AdvanceSearch from '../mpu/components/AdvanceSearch';
const POMainPage: React.FC = () => {
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [advanceSearch, setAdvanceSearch] = useState<{
    isVisibled: boolean;
    value?: AdvanceSearchParam;
  }>({
    isVisibled: false,
  });
  const [filter, setFilter] = useState<TableViewSearchParams<AdvanceSearchParam>>({
    criteria: { advanceSearch: { status: 'ALL' } },
  });
  const { data, isFetching, refetch } = useQuery(
    ['fetch-po-list', filter],
    () => services.page(filter),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: false,
    },
  );

  const [printModalState, setPrintModalState] = useState<{
    visible?:{name:'Modal',payloads:number}
  }>();

  const onDowloadReportHandler = async (id?:number) => {
    try {
      // const dataForm = await form.validateFields()
      const reportName = 'stock-request-report-form'
      // setLoading(true)
      await downloadGenericReport(requestActions)({
        fileName: `${reportName}-${moment().format()}.pdf`,
        type: 'PDF',
        data: {
          reportName: reportName,
          reportPath: getUrlReporting('sale/forms'),
          data: [
            { key: 'purchaseId', value: id, type: 'string' },
          ]
        }
      }).then((edit) => {
        // setLoading(false)
      })
    } catch (error: any) {
      message.error(error.message || "Failed to generate report.")
      // setLoading(false)
    }
  }

  return (
    <>
      <PageWrapper<PurchaseOrderDTO, AdvanceSearchParam, ''>
        tabRender={(items) => [
          // {
          //   action: 'add',
          //   tabKey: 'add',
          //   panel: ({ onCloseTab, onUpdateTab, key }) => (
          //     <MpuPoEntryForm
          //       type={'CREATE'}
          //       onBack={onCloseTab}
          //       onView={(items) => onUpdateTab('view', items, undefined, key)}
          //     />
          //   ),
          //   tabLabel: 'Add New',
          // },
          {
            action: 'view',
            tabKey: items?.id,
            panel: ({ onAddTab, onUpdateTab, key }) => (
              <MpuPoDetail
                id={items?.id}
                onEdit={() => onUpdateTab?.('edit', undefined, undefined, key)}
                onAdd={() => onAddTab?.('add', undefined, key)}
              />
            ),
            tabLabel: `${items?.purchaseOrderCode}`,
          },
          {
            action: 'edit',
            tabKey: 'edit',
            panel: ({ onUpdateTab, key }) => (
              <MpuPoEntryForm
                type={'EDIT'}
                onView={() => onUpdateTab?.('view', undefined, undefined, key)}
                onBack={() => {
                  onUpdateTab?.('view', undefined, undefined, key);
                  refetch();
                }}
                id={items?.id}
              />
            ),
            tabLabel: `Edit ${items?.purchaseOrderCode}`,
          },
        ]}
        listView={{
          onOpenAdvanceSearch: () => setAdvanceSearch({ isVisibled: true }),
          statuses: [
            { option: { value: 'ALL', label: 'All' } },
            { option: { value: 'Pending', label: 'Pending' } },
            { option: { value: 'Loaded', label: 'Loaded' } },
            { option: { value: 'Rejected', label: 'Rejected' } },
            { option: { value: 'Paid', label: 'Paid' } },
          ],
          type: 'Table',
          title: 'Purchase Order',
          onRefresh: refetch,
          actionButtons: [
            {
              icon: <PlusOutlined />,
              type: 'link',
              addNewTab: true,
            },
          ],
          onFilter(params, page, sort) {
            setFilter(() => ({
              criteria: {
                searchValue: params?.searchValue,
                advanceSearch: {
                  status: params?.status,
                },
              },
              pagination: { ...page },
              sort: sort,
            }));
          },

          props: {
            dataSource: data?.items,
            actionRef: actionRef,
            loading: isFetching,
            pagination: { total: data?.total },
            expandable: {},
            columns: [
              {
                title: 'No',
                dataIndex: 'purchaseRequestNo',
                actionProps: (item) => ({
                  type: 'view',
                  label: item.purchaseOrderCode || 'n/a',
                }),
              },
              {
                title: 'Purchase Date',
                dataIndex: 'purchaseOrderDate',
                valueType: 'date',
              },
              {
                title: 'Assigned To',
                dataIndex: 'assignedTo',
              },

              {
                title: 'Distributor Name',
                dataIndex: 'distributorName',
              },

              {
                title: 'Status',
                dataIndex: 'status',
                render: (_, r) => (
                  <Tag
                    icon={
                      r.status === 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'Paid' ? (
                        <DollarOutlined />
                      ) : r.status === 'Rejected' ? (
                        <CloseCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    bordered={false}
                    color={
                      r.status === 'Pending'
                        ? 'processing'
                        : r.status === 'Paid'
                          ? 'default'
                          : r.status === 'Rejected'
                            ? 'error'
                            : 'success'
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Amount',
                dataIndex: 'grantAmount',
                render: (_, r) => {
                  return `${numeral(r.grantAmount).format('$ 0,000.000')}`;
                },
                align: 'right',
              },
              {
                title: 'Requested By',
                dataIndex: 'requestedBy',
              },
              {
                title: 'Requested Date',
                dataIndex: 'requestedDate',
                valueType: 'date',
              },
              {
                title: 'Action',
                align: 'center',
                render: (_, r) => {
                  return (
                    // <Button
                    //   disabled={r.status !== 'Pending'}
                    //   type="link"
                    //   onClick={() => rejectedAction(r.id)}
                    //   danger
                    //   icon={<DeleteFilled />}
                    // />
                    <Tooltip title="Print Data From Report">
                      <Button
                        icon={<DownloadOutlined />}
                        type='link'
                        onClick={async()=>onDowloadReportHandler(r.id)}
                        // onClick={()=>setPrintModalState({visible:{name:"Modal", payloads:r.id}})}
                      />
                    </Tooltip>

                  );
                },
              },
            ],
          },
        }}
      />
      <POPrintModal
         open={printModalState?.visible?.name=="Modal"}
         id ={printModalState?.visible?.payloads}
         onCancel={()=>setPrintModalState({visible:undefined})}
      />
      <AdvanceSearch
        width={500}
        title="Advance Search"
        open={advanceSearch.isVisibled}
        entity="Purchase Order"
        onOpenChange={(visible) => {
          if (!visible) {
            setAdvanceSearch({ isVisibled: false });
          }
        }}
        onSearch={(data) => {
          setFilter((v) => ({
            ...v,
            criteria: {
              ...v.criteria,
              advanceSearch: {
                ...filter.criteria?.advanceSearch,
                ...data,
              },
            },
          }));
        }}
        onReset={() => {
          setFilter((v) => ({
            ...v,
            criteria: {
              ...filter.criteria,
            },
          }));
          actionRef.current?.reload?.(true);
        }}
        initData={filter.criteria}
      />
    </>
  );
};

export default POMainPage;
