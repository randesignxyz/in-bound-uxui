import vital from '@/assets/logo.svg';
import mee from '@/assets/mee.png';
import posm from '@/assets/stock.png';
import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import type {
  ExchangeRate,
  SaleInvoiceLess,
  SalesTeamWorkLess,
  SaveStockControl,
  SettlementLessDto,
  StockDetailItemLess,
} from '@/services/sale/data';
import {
  CrownOutlined,
  EditOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import {
  Button,
  Card,
  Empty,
  Image,
  message,
  Modal,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
import { history, useAccess } from 'umi';
import { SalePaths } from '../..';
import { SuggestionServiceAPI } from '../../suggestion/services';
import HistoryTabItem from '../components/HistoryTabItem';
import InitializeStockControlFormModal from '../components/InitializeStockControl';
import RequestStockControlModal from '../components/RequestStockControlModal';
import SaleInvoiceFormModal from '../components/SaleInvoiceFormModal';
import SaleInvoiceTabItem from '../components/SaleInvoiceTabItem';
import SettlementFormModal from '../components/SettlementFormModal';
import StockControlFormModal from '../components/StockControlFormModal';
import { Model } from '../model';

type Props = {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
};

const StockStoreDetail: React.FC<Props> = ({ id, actionHandlers }) => {
  const { state, actions } = Model();
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [forceHistoryUpdate, setForceHistoryUpdate] = useState<number>(0);

  // const [dataSource, setDataSource] = useState<StockDetailItemSettle[]>([]);

  const [addSettlement, setAddSettlement] = useSetState<{ visible?: boolean }>({});
  const [initNewModal, setInitNewModal] = useSetState<{ visible?: boolean }>({});
  const [addNewModal, setAddNewModal] = useSetState<{ visible?: boolean }>({});
  const [requestStockControl, setRequestStockControl] = useSetState<{
    visible?: boolean;
    stockCategoryId?: number;
    captionName?: string;
  }>({});
  const [saleInvoiceModal, setSaleInvoiceModal] = useSetState<{
    visible: boolean;
    record?: SaleInvoiceLess;
  }>({
    visible: false,
  });

  // CH: 19-11-2022
  const requestActions = simpleRequestActions();
  const suggestionService = SuggestionServiceAPI(requestActions);
  const [dsdExchangeRate, setDsdExchangeRate] = useState<ExchangeRate>();

  //const [stockCategory, setStockCategory] = useState<number>(0);

  const access = useAccess();
  const { Text } = Typography;

  useEffect(() => {
    if (!id) return;
    actions.initData(id);
  }, [id]);

  useEffect(() => {
    (async () => {
      const rs1 = await suggestionService.dsdExchangeRage();
      setDsdExchangeRate(rs1);
    })();
  }, []);

  const displayItems: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Store Name', value: state.data?.detail?.name },
    {
      label: 'Description',
      value: `${state.data?.detail?.description ? state.data?.detail?.description : '-'}`,
    },
    // { label: 'Team Name', value: state.data?.detail?.teamWork?.teamName },
    { label: 'Plate Number', value: state.data?.detail?.vehicle?.plateNumber },
    { label: 'Created Date', value: formatDate(state.data?.detail?.createdDate) },
    // { label: 'Status', value: state.data?.detail?.status },
    { label: 'Initialize Stock', value: state.data?.detail?.isInitialize ? 'TRUE' : 'FALSE' },
  ];

  const calculateTotalAmount = (settlement: SettlementLessDto | undefined): number => {
    return settlement
      ? settlement.amountKH +
      settlement.amount * settlement.exchangeRate +
      settlement.bankAmount * settlement.exchangeRate
      : 0;
    // return numeral(total).format('$ 0,0.00');
  };

  const settlementInfo: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Cashier', value: state.data?.detail?.stockControl?.settlement?.cashierName },

    {
      label: 'Exchange Rate',
      value: `${dsdExchangeRate?.target_symbol} ${numeral(
        state.data?.detail?.stockControl?.settlement?.exchangeRate,
      ).format('0,0')}`,
    },
    {
      label: 'Actual Amount USD',
      value: numeral(state.data?.detail?.stockControl?.settlement?.amount).format('$ 0,0.00'),
    },

    {
      label: 'Settlement Date',
      value: formatDateTime(state.data?.detail?.stockControl?.settlement?.settlementDate),
    },
    {
      label: 'Invoices Amount',
      value: `${dsdExchangeRate?.target_symbol} ${numeral(
        (state.data?.detail?.stockControl?.soldAmount || 0.0) *
        (dsdExchangeRate?.target_amount || 0.0),
      ).format('0,0')}`,
    },

    {
      label: 'Actual Amount KH',
      value: `${dsdExchangeRate?.target_symbol} ${numeral(
        state.data?.detail?.stockControl?.settlement?.amountKH,
      ).format('0,0')}`,
    },
    {
      label: 'Remark',
      value: state.data?.detail?.stockControl?.settlement?.remark,
    },
    {
      label: 'Lost Amount',
      tag: (value) => {
        return <Text type="danger">{value}</Text>;
      },
      value: `${dsdExchangeRate?.target_symbol} ${numeral(
        (state.data?.detail?.stockControl?.settlement?.adjustMentItems?.reduce(
          (acc, it) => acc + (it.originQuantity - it.adjustQuantity) * (it.unitPrice || 0.0),
          0,
        ) || 0.0) * (dsdExchangeRate?.target_amount || 0.0),
      ).format('0,0.00')}`,
    },
    {
      label: 'Bank Transfer Amount',
      value: numeral(state.data?.detail?.stockControl?.settlement?.bankAmount).format('$ 0,0.00'),
      //value: numeral(data.details?.cashOnHand).format('$ 0,0.00'),
    },
    { label: '', value: '' },
    {
      label: 'System Amount KH',
      tag: (value) => {
        return <Text type="success">{value}</Text>;
      },
      value: `${dsdExchangeRate?.target_symbol} ${numeral(
        (state.data?.detail?.stockControl?.settlement?.adjustMentItems?.reduce(
          (acc, it) => acc + (it.originQuantity - it.adjustQuantity) * (it.unitPrice || 0.0),
          (state.data?.detail?.stockControl?.settlement?.bankAmount || 0) +
          (state.data?.detail?.stockControl?.soldAmount || 0),
        ) || 0) * (dsdExchangeRate?.target_amount || 0.0),
      ).format('0,0')}`,
    },
    {
      label: 'Actual Total Amount',
      tag: (value) => {
        return <Text type="success">{value}</Text>;
      },
      value: `${dsdExchangeRate?.target_symbol} ${numeral(
        calculateTotalAmount(state.data?.detail?.stockControl?.settlement),
      ).format('0,0')}`,
    },
  ];

  const stockControlInfo: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Serial Number', value: state.data?.detail?.stockControl?.referenceNo },
    { label: 'Requested Date', value: formatDate(state.data?.detail?.stockControl?.requestDate) },
    {
      label: 'Received By',
      value: state.data?.detail?.stockControl?.receiver
        ? `${state.data?.detail?.stockControl?.receiver.salespersonCode} - ${state.data?.detail?.stockControl?.receiver.salespersonName}`
        : 'N/A',
    },
    { label: 'Status', value: state.data?.detail?.stockControl?.status },
    // { label: '', value: '' },
    {
      label: 'Approved Date',
      value: state.data?.detail?.stockControl?.approvalDate
        ? formatDate(state.data?.detail?.stockControl?.approvalDate)
        : 'N/A',
    },
    {
      label: 'Approved By',
      value: state.data?.detail?.stockControl?.approval
        ? `${state.data?.detail?.stockControl?.approval.salespersonCode} - ${state.data?.detail?.stockControl?.approval.salespersonName}`
        : 'N/A',
    },
    {
      label: 'Stock balance is to be carried Forward',
      value: state.data?.detail?.stockControl?.isKeepForwarding ? 'TRUE' : 'FALSE',
    },
  ];

  const onSaveAddNewStoreActionHandler = (data: SaveStockControl) => {
    const msgTitle = `Create a new Stock Control`;
    Modal.confirm({
      title: msgTitle,
      content: 'Are you sure:',
      onOk: async () => {
        const result = await actions.createStockControl(data);
        if (result && result.message === 'Ok') {
          setAddNewModal({ visible: false });
          message.info(`Your transaction is saved.`);
          setForceUpdate(forceUpdate + 1);
          setForceHistoryUpdate(forceHistoryUpdate + 1);
          actions.initData(id);
          // actionRef.current?.reload();
          // setForce({ update: force.update + 1 });
        }
      },
    });
  };

  const onSaveInitStockControlActionHandler = (data: SaveStockControl) => {
    const msgTitle = `Initial Stock Control`;
    Modal.confirm({
      title: msgTitle,
      content: 'Are you sure:',
      onOk: async () => {
        const result = await actions.initializeStockControl(data);
        if (result && result.message === 'Ok') {
          setInitNewModal({ visible: false });
          message.info(`Your transaction is saved.`);
          setForceUpdate(forceUpdate + 1);
          setForceHistoryUpdate(forceHistoryUpdate + 1);
          actions.initData(id);
        }
      },
    });
  };

  return (
    <PageContainer
      title="Store Info"
      breadcrumb={undefined}
      onBack={actionHandlers?.onBack}
      extra={
        access.canCreateEditStockControl && [
          state.data?.detail?.isInitialize &&
          state.data?.detail?.stockControl?.status === 'closed' && (
            <Button
              type="link"
              htmlType="button"
              icon={<ShopOutlined />}
              onClick={() => {
                setInitNewModal({ visible: true });
              }}
              key="initStockRequest"
            >
              Initial New Stock Request
            </Button>
          ),
          state.data?.detail?.stockControl && state.data.detail.stockControl.status === 'closed' && (
            <Button
              type="link"
              htmlType="button"
              icon={<ShopOutlined />}
              onClick={() => {
                setAddNewModal({ visible: true });
              }}
              key="createNewStockRequest"
            >
              Create New Stock Request
            </Button>
          ),
          state.data?.detail?.stockControl && state.data.detail.stockControl.status === 'open' && (
            <>
              <Button
                type="link"
                htmlType="button"
                icon={<SolutionOutlined />}
                onClick={() => setSaleInvoiceModal({ visible: true, record: undefined })}
                key="createNewInvoice"
              >
                Create New Invoice
              </Button>
              {access.canAccessSettlement && (
                <Button
                  type="link"
                  htmlType="button"
                  icon={<FileDoneOutlined />}
                  onClick={() => setAddSettlement({ visible: true })}
                  key="settlementButton"
                >
                  Settlement
                </Button>
              )}
            </>
          ),
          <Button
            type="link"
            htmlType="button"
            icon={<EditOutlined />}
            onClick={() => history.push(`${SalePaths.store}/edit/${id}`)}
            key="edit"
          >
            Edit
          </Button>,
        ]
      }
    >
      <Card size="small" title="General Info" style={{ marginBottom: 10 }}>
        <DescriptionDisplay data={displayItems} />
      </Card>
      {/* defaultActiveKey="stockControl" */}
      <Tabs>
        {/* <Tabs.TabPane
          tab={
            <Space size={0}>
              <DashboardOutlined /> <span>Dashboard</span>
            </Space>
          }
          key="dashboardTabItem"
        ></Tabs.TabPane> */}

        <Tabs.TabPane
          tab={
            <Space size={0}>
              <ShopOutlined />
              <span>Stock Control</span>
            </Space>
          }
          key="stockControlTabItem"
        >
          <Card
            size="small"
            title={state.data?.detail?.stockControl === null ? 'Stock Detail' : 'Detail'}
            style={{ marginBottom: 10 }}
          >
            {state.data?.detail?.stockControl === null && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No Data</span>}>
                <Button type="primary" onClick={() => setAddNewModal({ visible: true })}>
                  Create New Stock Request
                </Button>
              </Empty>
            )}
            {state.data?.detail?.stockControl !== null && (
              <DescriptionDisplay data={stockControlInfo} column={3} />
            )}
            <Tabs
            // onTabClick={(activeKey) => {
            //   const id = activeKey.split('-').pop();
            //   if (id) setStockCategory(parseInt(id));
            //   console.log(id);
            // }}
            >
              {state.data?.detail?.stockControl &&
                state.data.initData?.types &&
                state.data.initData.types.map((it) => {
                  const items = state.data?.detail?.stockControl?.items.filter(
                    (it1) => it1.itemType === it.id,
                  );
                  const totalQty = items?.reduce(
                    (sum, it1) => sum + (it1.beginningQty + it1.quantity - it1.soldQty),
                    0,
                  );
                  return (
                    items &&
                    items.length > 0 && (
                      <Tabs.TabPane
                        tab={
                          <Space size={0}>
                            <Image
                              preview={false}
                              src={it.id === 131 ? vital : it.id === 132 ? mee : posm}
                              height={30}
                            />
                            &nbsp;&nbsp;{it.name}&nbsp;&nbsp;
                            <Tag color={'processing'}>{totalQty || 0}</Tag>
                          </Space>
                        }
                        key={`${it.code}-product-${it.id}`}
                      >
                        <ProTable<StockDetailItemLess>
                          // headerTitle="Line Items"
                          size="small"
                          sortDirections={['ascend']}
                          showSorterTooltip={false}
                          key="id"
                          // actionRef={actionRef}
                          rowKey={(r) => {
                            return r.id + '-' + r.batchNo;
                          }}
                          pagination={false}
                          search={false}
                          options={{
                            setting: false,
                            density: false,
                            fullScreen: false,
                            reload: false,
                          }}
                          toolBarRender={() => {
                            return state.data?.detail?.stockControl?.status === 'Open'
                              ? [
                                <Button
                                  key={`button - ${state.data?.detail?.stockControl?.id}`}
                                  size="small"
                                  type="link"
                                  htmlType="button"
                                  disabled={state.loading}
                                  onClick={() =>
                                    setRequestStockControl({
                                      visible: true,
                                      stockCategoryId: it.id,
                                      captionName: `Request ${it.name} Stock`,
                                    })
                                  }
                                  icon={<PlusOutlined />}
                                >
                                  {`Request ${it.name} Stock`}
                                </Button>,
                              ]
                              : [];
                          }}
                          dataSource={items}
                          columns={
                            it.id === 132
                              ? [
                                {
                                  title: 'Batch #',
                                  dataIndex: 'batchNo',
                                },
                                // {
                                //   title: 'Code',
                                //   dataIndex: 'itemCode',
                                // },
                                {
                                  title: 'Description',
                                  // dataIndex: 'itemName',
                                  key: 'itemId',
                                  render: (_, r) => {
                                    return `${r.itemCode} - ${r.itemName}`;
                                  },
                                },

                                { title: 'SKU', dataIndex: 'description' },
                                { title: 'UOM', dataIndex: 'uom' },
                                {
                                  title: (
                                    <Space>
                                      {'Total Quantity'}
                                      <Tooltip title="Begin Quantity + Request Quantity">
                                        <QuestionCircleOutlined color={'processing'} />
                                      </Tooltip>
                                    </Space>
                                  ),
                                  align: 'right',
                                  render: (_, r) => {
                                    return r.beginningQty + r.quantity;
                                  },
                                  //dataIndex: 'quantity'
                                },
                                {
                                  title: 'Sold Quantity',
                                  align: 'right',
                                  render: (_, r) => {
                                    return r.soldQty;
                                  },
                                },
                                {
                                  title: 'Current Quantity',
                                  align: 'right',
                                  render: (_, r) => {
                                    return r.beginningQty + r.quantity - r.soldQty;
                                  },
                                },
                                {
                                  title: 'Actural Quantity',
                                  align: 'right',
                                  dataIndex: 'actualQty',
                                },
                                {
                                  title: 'Expired Date',
                                  render: (_, r) => {
                                    return r.expiredDate ? formatDate(r.expiredDate) : '-';
                                  },
                                },
                              ]
                              : [
                                {
                                  title: 'Code',
                                  dataIndex: 'itemCode',
                                },
                                {
                                  title: 'Description',
                                  dataIndex: 'itemName',
                                  key: 'itemId',
                                },

                                { title: 'SKU', dataIndex: 'description' },
                                {
                                  title: 'Quantity',
                                  align: 'right',
                                  render: (_, r) => {
                                    return r.beginningQty + r.quantity;
                                  },
                                },
                                {
                                  title: 'Sold Quantity',
                                  align: 'right',
                                  render: (_, r) => {
                                    return r.soldQty;
                                  },
                                },
                                { title: 'UOM', dataIndex: 'uom' },
                              ]
                          }
                        />
                      </Tabs.TabPane>
                    )
                  );
                })}
            </Tabs>
          </Card>
          {state.data?.detail?.stockControl?.settlement && (
            <Card title="Settlement" size="small" key="settlementInfo">
              <DescriptionDisplay data={settlementInfo} column={3} />
            </Card>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <Space size={0}>
              <SolutionOutlined /> <span>Sale Invoice</span>
            </Space>
          }
          key="saleInvoiceTabItem"
        >
          <SaleInvoiceTabItem
            data={{
              stockStoreId: id,
              stockControlId: state.data?.detail?.stockControl?.id,
              exchangeRate: dsdExchangeRate,
            }}
            forceUpdate={forceUpdate}
            actionHandlers={{
              onEditSaleInvoice: (item) => {
                setSaleInvoiceModal({ visible: true, record: item });
              },
            }}
          />
        </Tabs.TabPane>

        {/* <Tabs.TabPane
          tab={
            <Space size={0}>
              <FileDoneOutlined /> <span>Settlement</span>
            </Space>
          }
          key="settlementTab"
        ></Tabs.TabPane> */}

        <Tabs.TabPane
          tab={
            <Space size={0}>
              <TeamOutlined /> <span>Member</span>
            </Space>
          }
          key="memberTabItem"
        >
          <Card size="small" style={{ marginBottom: 10 }}>
            <ProTable<SalesTeamWorkLess>
              size="small"
              rowKey="id"
              key="salespersonCode"
              pagination={false}
              bordered={false}
              search={false}
              dataSource={state.data?.detail?.members}
              options={{
                setting: false,
                density: false,
                fullScreen: false,
                reload: false,
              }}
              columns={[
                { title: 'Code', dataIndex: 'salespersonCode' },
                { title: 'Full Name', dataIndex: 'salespersonName' },
                { title: 'Phone Number', dataIndex: 'phoneNumber' },
                { title: 'Role', dataIndex: 'role' },
                {
                  title: '',
                  render: (_, r) => {
                    return r.isRequester ? (
                      <Tooltip title="Owner">
                        <CrownOutlined style={{ color: 'blue' }} />
                      </Tooltip>
                    ) : (
                      <UserOutlined />
                    );
                  },
                },
              ]}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <Space size={0}>
              <HistoryOutlined /> <span>Stock Control History</span>
            </Space>
          }
          key="historyTabItem"
        >
          <HistoryTabItem
            data={{ id: id, forceUpdate: forceHistoryUpdate, dsdExchangeRate: dsdExchangeRate }}
          />
        </Tabs.TabPane>
      </Tabs>

      <SaleInvoiceFormModal
        title="Sale Invoice"
        isLoading={state.loading || false}
        open={saleInvoiceModal.visible}
        data={{
          stockControlId: state.data?.detail?.stockControl?.id,
          // saleTypes: data.saleTypes,
          salespersonList: state.data?.members,
          regionList: state.data?.initData?.regionList,
          locations: {
            communeList: state.data?.locations?.communeList,
            districtList: state.data?.locations?.districtList,
            provinceList: state.data?.locations?.provinceList,
            villageList: state.data?.locations?.villageList,
          },
          saleItems:
            state.data?.detail?.stockControl?.items
              ?.filter((it) => it.itemType !== 133)
              .flatMap((it) => {
                return {
                  id: it.itemId,
                  name: it.itemName,
                  code: it.itemCode,
                  qty: it.quantity,
                  price: 3.75,
                };
              }) || [],
          typeProductItems: state.data?.initData?.typeProductItems?.flatMap((it) => {
            return it.value.flatMap((it1) => {
              return { itemId: it1.id, itemType: it.type };
            });
          }),
          detail: saleInvoiceModal.record,
          // selectedSE: state.data?.detail?.owner.code,
          // typeId: addStockModal.typeId,
          // seList: state.data?.initData?.seList,
          // stockCategory: state.data?.initData?.types,
          // typeProductItems: state.data?.initData?.typeProductItems,
        }}
        onCancel={() => setSaleInvoiceModal({ visible: false, record: undefined })}
        actionHandlers={{
          onSubmit: async (item: SaleInvoiceLess) => {
            //actionHandlers.onSaveSaleInvoice(item);

            const result = await actions.saveSaleInvoice(item);
            setSaleInvoiceModal({ visible: false, record: undefined });
            if (result) {
              message.info(result.message);
              setForceUpdate(forceUpdate + 1);
              // reload dashboard
              actions.detail(id);
            }
          },

          onLoadLocations: async (type, isNotClearChild, parentId) => {
            await actions.loadLocations(type, parentId, isNotClearChild);
          },
        }}
      // actionHandlers={{
      //   onAddItem: onSaveSaleItemEvent,

      // }}
      />
      <RequestStockControlModal
        title={requestStockControl.captionName}
        open={requestStockControl.visible}
        onCancel={() =>
          setRequestStockControl({
            visible: false,
            stockCategoryId: undefined,
            captionName: undefined,
          })
        }
        data={{
          selectedSE: state.data?.members?.find((it) => it.isRequester)?.salespersonCode || '',
          typeId: requestStockControl.stockCategoryId,
          stockCategory: state.data?.initData?.types,
          typeProductItems: state.data?.initData?.typeProductItems,
        }}
        isLoading={state.loading || false}
        actionHandlers={{
          onLoadInitData: () => { },
        }}
      />

      <StockControlFormModal
        title="Create Stock Control"
        open={addNewModal.visible}
        onCancel={() => setAddNewModal({ visible: false })}
        data={{
          stockCategory: state.data?.initData?.types,
          stockStoreId: id,
          typeId: 132,
          members: state.data?.detail?.members,
          salespersons: state.data?.initData?.salespersonList,
          isBeginningManual: false,
          typeProductItems: state.data?.initData?.typeProductItems,
          listLastStockControl: state.data?.lsitLastStockControl,
          plateNumber: state.data?.detail?.vehicle?.plateNumber,
        }}
        isLoading={state.loading || false}
        actionHandlers={{
          onLoadInitData: () => { },
          onSave: onSaveAddNewStoreActionHandler,
        }}
      />
      <InitializeStockControlFormModal
        isLoading={state.loading || false}
        title="Initialize Stock Control"
        open={initNewModal.visible}
        data={{
          typeId: 132,
          selectedSE: state.data?.detail?.members?.find((it) => it.isRequester)?.salespersonCode,
          seList: state.data?.initData?.salespersonList,
          stockCategory: state.data?.initData?.types,
          typeProductItems: state.data?.initData?.typeProductItems,
          plateNumber: state.data?.detail?.vehicle?.plateNumber,
          stockStoreId: state.data?.detail?.id,
          //isBeginningManual: state.data?.isBeginningManual,
        }}
        onCancel={() => setInitNewModal({ visible: false })}
        actionHandlers={{
          onLoadInitData: () => { },
          onSave: onSaveInitStockControlActionHandler,
          onSaveVehicle: actions.saveVehicle,
        }}
      />

      <SettlementFormModal
        title="Settlement"
        open={addSettlement.visible}
        onCancel={() => setAddSettlement({ visible: false })}
        isLoading={state.loading || false}
        actionHandlers={{
          onSettlementAction: async (item) => {
            const result = await actions.saveSettlement(item);
            if (result) {
              setAddSettlement({ visible: false });
              message.success('Settlement is successful.');
              setForceUpdate(forceUpdate + 1);
              setForceHistoryUpdate(forceHistoryUpdate + 1);
              actions.initData(id);
            }
          },
        }}
        data={{
          id: state.data?.detail?.stockControl?.id || -1,
          soldAmount: state.data?.detail?.stockControl?.soldAmount,
          salespersonCode: state.data?.members?.find((it) => it.isRequester)?.salespersonCode || '',
          dataSource:
            state.data?.detail?.stockControl?.items.map((it) => {
              const endQty = it.beginningQty + it.quantity - it.soldQty;
              return {
                ...it,
                isSettle: true,
                remark: '',
                totalQty: it.beginningQty + it.quantity,
                endQty: endQty,
                actualQty: endQty,
              };
            }) || [],
        }}
      />
    </PageContainer>
  );
};

export default StockStoreDetail;
