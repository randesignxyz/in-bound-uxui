import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime, formatter } from '@/pages/utils';
import { singleRequest } from '@/services/apiGateway';
import {
  CashCollectionListItem,
  CheckoutListItem,
  SettlementDetail,
  SettlementItem,
  SettlementSummaryStatus,
} from '@/services/delivery/data';
import { InstanceSrvParams } from '@/services/delivery/instance-service-params';
import { InstanceDetail } from '@/services/delivery/instance.types';
import { DeliveryCashCollectionParams } from '@/services/delivery/req-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleTwoTone, EyeFilled, PrinterTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, FloatButton, message, Modal, Radio, Space, Spin, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { history, useAccess } from 'umi';
import styles from './style.less';
import Settlement from './settlement-modal';
import ViewData from './view-data';
import { ReceiptPrint } from './ReceiptPrint';
import ViewSettlementModal from './view-settlement-modal';

export default () => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const [printing, setPrinting] = useState(0)
  const componentRef = useRef();
  const [forcePrint, setForcePrint] = useState(0)
  const [summary, setSummary] = useState<SettlementSummaryStatus>();

  const access = useAccess();

  const [state, setState] = useState<{
    visible?:
    | {
      type: 'SETTLEMENT';
      payload: {
        delivery: CashCollectionListItem;
        items: CheckoutListItem[];
      };
    }
    | {
      type: 'VIEW';
      payload: SettlementDetail;
    } | {
      type: 'PRINT';
      payload: { detail: SettlementDetail, selectedItem: CashCollectionListItem };
    }
    | {
      type: 'DELIVERY_VIEW';
      payload: InstanceDetail;
    };
  }>();

  const [searchParams, setSearchParams] = useState<DeliveryCashCollectionParams>({
    status: 'UN_SETTLED',
  });

  const actionRef = useRef<ActionType>();

  const hideModal = (visible?: boolean) => !visible && setState({ visible: undefined });

  const onRequestHandler = async (params: TableViewSearchParams<DeliveryCashCollectionParams>) => {
    try {
      services.settlementSummaryStatus().then(setSummary).catch(console.error);
      return await services.listCashCollection(params);
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
      return Promise.reject();
    }
  };

  const onDetailHandler = async (data: CashCollectionListItem) => {
    if (data.settled) {
      const rs = await services.fetchSettlementDetail(data.id);
      setState((v) => ({ ...v, visible: { type: 'VIEW', payload: rs } }));
    } else {
      const rs = (await singleRequest(InstanceSrvParams.fetch(data.instanceId))(
        requestActions,
      )) as InstanceDetail;
      setState((v) => ({ ...v, visible: { type: 'DELIVERY_VIEW', payload: rs } }));
    }
  };


  const onSettleHandler = async (data: CashCollectionListItem) => {
    if (!access.canAccessSetttlemnetFn) {
      message.error('No permission.');
      return;
    }


    const checkoutList = await services.listCheckout(data.id);
    setState({
      visible: {
        type: 'SETTLEMENT',
        payload: {
          delivery: data,
          items: checkoutList,
        },
      },
    });
  };

  const onSubmitHandler = (items: SettlementItem[], remarks?: string) => {
    Modal.confirm({
      title: 'Confirmation',
      content: 'Are you sure to submit.',
      onOk: async () => {
        try {
          state?.visible?.type === 'SETTLEMENT' &&
            (await services.saveSettlement({
              deliveryId: state?.visible?.payload.delivery.id,
              items: items,
              remarks: remarks,
            }));
          message.success('Submitted successfully');
          hideModal();
          state?.visible?.type === 'SETTLEMENT' && !state?.visible?.payload.items.flatMap(it => it.cashCollections).every(it => it.paymentMethod == 'NONE') && await printHandler(state?.visible?.payload.delivery)
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error?.message || 'Failed to submit.');
        }
      },
    });
  };

  const printHandler = async (item: CashCollectionListItem) => {
    const rs = await services.fetchSettlementDetail(item.id);

    if (rs.checkoutList.flatMap(it => it.cashCollections).every(it => it.paymentMethod == 'NONE')) {
      message.error("No payment to print.")
      return
    }
    // setSelectedItem(rs)
    setState((v) => ({
      ...v, visible: {
        type: 'PRINT', payload: {
          detail: rs,
          selectedItem: item
        }
      }
    }));
    setPrinting(rs.id)
    setForcePrint(v => v + 1)
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current as any,
    bodyClass: styles.print
  });

  useEffect(() => {
    if (state?.visible?.type == 'PRINT' && state.visible.payload.detail.id == printing) {
      handlePrint()
      setPrinting(0)
    }
  }, [forcePrint])


  return (
    <PageContainer breadcrumb={undefined} title={'Cash Collection'} onBack={history.back}>
      <Spin spinning={requestActions.request?.loading}>
        <TableView<CashCollectionListItem, { searchValue?: string }>
          extraFilter={
            <Space size="large">
              <Radio.Group
                value={searchParams.status}
                onChange={(e) => {
                  setSearchParams((v) => ({
                    ...v,
                    status: e.target.value,
                  }));

                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">All</Radio.Button>
                <Badge size="small" offset={[-20, 0]} count={(summary?.unsettled || 0) - (summary?.hold || 0)}>
                  <Radio.Button value="UN_SETTLED">Un settled</Radio.Button>
                </Badge>
                <Badge size="small" offset={[-20, 0]} count={summary?.hold || 0}>
                  <Radio.Button value="HOLD">Hold</Radio.Button>
                </Badge>
                <Radio.Button value="SETTLED">Settled</Radio.Button>
              </Radio.Group>
            </Space>
          }
          displayOnly
          columns={[
            {
              width: 50,
              render: (_, r) => r.settled && (
                <Tooltip title="View">
                  <Button type="link" icon={<EyeFilled />} onClick={() => onDetailHandler(r)} />
                </Tooltip>
              ),
            },
            {
              title: 'Driver',
              sorter: 'driver',
              render: (_, r) => [r.delivery.driver.firstName, r.delivery.driver.lastName].join(' '),
            },
            {
              title: 'License Plate',
              sorter: 'licensePlate',
              render: (_, r) => r.delivery.truck.licensePlate,
            },
            {
              title: 'Delivered Date',
              sorter: 'deliveredDate',
              align: 'left',
              render: (_, r) => formatDateTime(r.delivery.startedDate),
            },
            { title: 'Invoice Amount',  align: 'left', render: (_,r) => formatter.format(r.amount) },
            { title: 'Collected Amount',  align: 'left',render: (_,r) => formatter.format(r.collectedAmount) },
            { title: 'Settled By', sorter: 'settledBy', dataIndex: 'settledBy' },
            {
              title: 'Settled Date',
              sorter: 'settledDate',
              render: (_, r) => r.settledDate && formatDateTime(r.settledDate),
            },
            {
              title: 'Status',
              hideInTable: searchParams.status !== 'ALL',
              render: (_, r) => (r.hold ? "Hold" : r.settled ? 'Settled' : 'Unsettled'),
            },
            {
              // hideInTable: searchParams.status === 'SETTLED',
              title: 'Action',
              render: (_, r) => {
                if (r.hold) {
                  return <ViewSettlementModal deliveryId={r.id} trigger={<Button
                    type="link"
                    icon={<EyeFilled />}
                  >View</Button>} />
                }
                if (!r.settled && access.canAccessSetttlemnetFn) {
                  return <Tooltip title="Settle">
                    <Button
                      type="link"
                      icon={<CheckCircleTwoTone />}
                      onClick={() => onSettleHandler(r)}
                    >Settle</Button>
                  </Tooltip>
                }

                if (r.settled && access.canAccessSetttlemnetFn) {
                  return <Tooltip title="Print receipt">
                    <Button
                      type="link"
                      icon={<PrinterTwoTone />}
                      onClick={() => printHandler(r)}
                    >Print</Button>
                  </Tooltip>
                }
              }

            },
          ]}
          tableProps={{
            actionRef: actionRef,
          }}
          actionHandlers={{
            onRequest: (criteria, pagination, sort) =>
              onRequestHandler({
                criteria: {
                  ...criteria,
                  advanceSearch: searchParams,
                  sort,
                },
                pagination,
              }),
          }}
        />
        {state?.visible?.type === 'SETTLEMENT' && (
          <Settlement
            data={state.visible.payload.items}
            deliveryId={state.visible.payload.delivery.id}
            open={state?.visible?.type === 'SETTLEMENT'}
            onCancel={hideModal}
            onReload={async (freightId) => {
              const checkoutList = await services.listCheckout(freightId);
              state && state?.visible && state?.visible?.type === 'SETTLEMENT' && setState({
                ...state, visible: {
                  type: 'SETTLEMENT',
                  payload: {
                    delivery: state.visible.payload.delivery,
                    items: checkoutList
                  }
                }
              })
            }}
            onSave={onSubmitHandler}
          />
        )}

        {state?.visible?.type === 'VIEW' && (
          <ViewData
            width={1000}
            data={state.visible.payload}
            title="Settlement Detail"
            open={state.visible.type === 'VIEW'}
            onOpenChange={hideModal}
          />
        )}
      </Spin>
      <FloatButton.BackTop />
      {state?.visible?.type == 'PRINT' && state.visible.payload.detail.id == printing && <ReceiptPrint {...state.visible.payload} ref={componentRef} />}
    </PageContainer>
  );
};
