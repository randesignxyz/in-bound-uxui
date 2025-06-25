import { simpleRequestActions } from '@/services/model';
import type { ExchangeRate, SaleInvoiceLess, SaveStockControl } from '@/services/sale/data';
import {
  AuditOutlined,
  DashboardOutlined,
  // FileDoneOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { message, Modal, Space, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useAccess } from 'umi';
import { SuggestionServiceAPI } from '../../suggestion/services';
import DashboardTabItem from '../components/DashboardTabItem';
import SaleInvoiceTabItem from '../components/SaleInvoiceTabItem';
// import SettlementTabItem from '../components/SettlementTabItem';
import StockControlTabItem from '../components/StockControlTabItem';
import { Model } from '../model';
import { StockControlServiceAPI } from '../services';
import StockControlFormModal from '../StockControlFormModal';

type Props = {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
};

const StockControlDetail: React.FC<Props> = ({ id, actionHandlers }) => {
  const { state, actions } = Model();
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const access = useAccess();

  //const [addModal, setAddModal] = useSetState<{ visible?: boolean }>({});
  const [addStockModal, setAddStockModal] = useSetState<{
    visible?: boolean;
    title?: string;
    typeId?: number;
  }>({});

  // CH: 19-11-2022
  const requestActions = simpleRequestActions();
  const suggestionService = SuggestionServiceAPI(requestActions);
  const [dsdExchangeRate, setDsdExchangeRate] = useState<ExchangeRate>();

  // const getPendingQty = (typeId: number) => {
  //   const stockQty = state.data?.detail?.transactions.find((it) => it.itemType === typeId);
  //   return stockQty !== null && stockQty.pendingQty !== null && stockQty.pendingQty > 0
  //     ? `Pending Qty: ${stockQty.pendingQty}`
  //     : ' ';
  // };

  const onSaveAddNewStoreActionHandler = (data: SaveStockControl) => {
    const msgTitle = `Save Transaction`;
    Modal.confirm({
      title: msgTitle,
      content: 'Are you sure:',
      onOk: async () => {
        const result = await actions.initializeStockControl(data);
        if (result && result.message === 'Ok') {
          setAddStockModal({ visible: false, title: undefined, typeId: undefined });
          message.info(`Your transaction is saved.`);
          await actions.detail(id);
          // innerActionRef.current?.reloadAndRest?.();
          setForceUpdate(forceUpdate + 1);
        }
      },
    });
  };

  // const onSaveActionHandler = (data: TopupLess, isView: Boolean) => {
  //   const msgTitle = `Save Transaction`;
  //   Modal.confirm({
  //     title: msgTitle,
  //     content: 'Are you sure:',
  //     onOk: async () => {
  //       const result = await actions.transferMoney(data);
  //       if (result && result.message === 'Ok') {
  //         setAddModal({ visible: false });

  //         message.info(`Your transaction is saved.`);
  //         await actions.detail(id);
  //         // innerActionRef.current?.reloadAndRest?.();
  //         setForceUpdate(forceUpdate + 1);
  //       }
  //     },
  //   });
  // };

  const isOpenStock = (): boolean => {
    return state.data?.detail?.status !== 'closed';
  };

  useEffect(() => {
    (async () => {
      try {
        if (id) {
          await actions.detail(id);
        }
        // id && await actions.detail(id);
        actions.initilizeData(id);
        // state.data?.initData?.saleInvoiceList?.forEach((it) => {
        //   console.log(it);
        // });
        // const t = state.data?.initData?.saleInvoiceList?.reduce((rest, it) => {
        //   rest += it.amount;
        //   return rest;
        // }, 0.0);
        // console.log(t);
      } catch {
        message.error('Failed to load Stock control.');
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      const rs1 = await suggestionService.dsdExchangeRage();
      setDsdExchangeRate(rs1);
    })();
  }, []);

  return (
    <>
      <PageContainer
        title={[
          state.data?.detail?.stockName,
          state.data?.detail?.serialNumber,
          state.data?.detail?.serialNumber,
        ]
          .filter((o) => o)
          .join('-')}
        breadcrumb={undefined}
        onBack={actionHandlers?.onBack}
        // extra={
        //   access.canCreateEditSo &&
        //   isOpenStock() && [
        //     <Button
        //       type="link"
        //       htmlType="button"
        //       icon={<FileDoneOutlined />}
        //       onClick={() => {}}
        //       key="edit"
        //     >
        //       Settlement
        //     </Button>,
        //     <Button
        //       type="link"
        //       htmlType="button"
        //       // icon={<EditOutlined />}
        //       icon={<RetweetOutlined />}
        //       onClick={() => setAddModal({ visible: true })}
        //       key="edit"
        //     >
        //       Deposit Money
        //     </Button>,
        //     <Button
        //       type="link"
        //       htmlType="button"
        //       icon={<PlusOutlined />}
        //       onClick={() =>
        //         setAddStockModal({ visible: true, title: 'Add Request Items', typeId: undefined })
        //       }
        //       key="Add Request"
        //     >
        //       Add Request Items
        //     </Button>,
        //   ]
        // }
      >
        <Tabs defaultActiveKey="stockControl">
          <Tabs.TabPane
            tab={
              <Space size={4}>
                {/* <ScheduleOutlined /> <span>Transaction</span> */}
                <DashboardOutlined /> <span>Transaction</span>
              </Space>
            }
            key="dashboardTabItem"
          >
            <DashboardTabItem
              forceUpdate={forceUpdate}
              data={{
                id: id,
                details: state.data?.detail,
                types: state.data?.initData?.types,
                loading: state.loading,
                stockItems: state.data?.listStockDetailItem,
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <Space size={4}>
                <ShopOutlined /> <span>Stock</span>
              </Space>
            }
            key="stockControl"
          >
            <StockControlTabItem
              forceUpdate={forceUpdate}
              data={{
                id: id,
                isOpen: isOpenStock(),
                details: state.data?.detail,
                types: state.data?.initData?.types,
                // loading: state.loading,
                listStockDetailItem: state.data?.detail?.items ?? [],
              }}
              // actionHandlers={{
              //   onTransferMoney: () => setAddModal({ visible: true }),
              //   onAddItem: (sid: number, name: string) =>
              //     setAddStockModal({
              //       visible: true,
              //       title: `Add Request ${name}`,
              //       typeId: sid,
              //     }),
              // }}
              key="stockControlerDetailTab"
            />
          </Tabs.TabPane>

          {access.canAccessAllMenuDSD && (
            <>
              <Tabs.TabPane
                tab={
                  <Space size={4}>
                    <AuditOutlined /> <span>Sales Invoice</span>
                  </Space>
                }
                key="saleInvoiceTab"
              >
                <SaleInvoiceTabItem
                  forceUpdate={forceUpdate}
                  data={{
                    listStockDetailItem: state.data?.detail?.items,
                    typeProductItems: state.data?.initData?.typeProductItems,
                    id: id,
                    // saleTypes: state.data?.initData?.lookDataList?.filter(
                    //   (it) => it.type === 'SALE_TYPE',
                    // ),
                    owner: state.data?.detail?.owner,
                    exchangeRate: dsdExchangeRate,

                    isOpen: isOpenStock(),
                    //salespersonCode: state.data?.detail?.owner.salespersonCode,
                    salespersonList: state.data?.initData?.salespersonList,
                    loading: state.loading || false,
                    regionList: state.data?.initData?.regionList,
                    locations: {
                      communeList: state.data?.locations?.communeList,
                      districtList: state.data?.locations?.districtList,
                      provinceList: state.data?.locations?.provinceList,
                      villageList: state.data?.locations?.villageList,
                    },
                  }}
                  actionHandlers={{
                    onLoadLocations: async (type, isNotClearChild, parentId) => {
                      await actions.loadLocations(type, parentId, isNotClearChild);
                    },
                    onSaveRemark: async (data) => {
                      await StockControlServiceAPI(requestActions).saveSaleInvoiceRemark(data);
                      message.success('Success!');
                      // await actions.detail(id)
                      setForceUpdate(forceUpdate + 1);
                    },
                    onSaveSaleInvoice: async (item: SaleInvoiceLess) => {
                      const result = await actions.saveSaleInvoice(item);
                      if (result) {
                        message.info(result.message);
                        await actions.detail(id);
                        setForceUpdate(forceUpdate + 1);
                        // await innerActionRef.current?.reloadAndRest?.();
                        // setSaleInvoiceModal({ visible: false });
                      }
                    },
                    onSaveRemark:async(data:any)=>{
                      await StockControlServiceAPI(requestActions).saveSaleInvoiceRemark(data);
                      message.success("Success!")
                      // await actions.detail(id)
                      setForceUpdate(forceUpdate+1)
                    }
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
              >
                <SettlementTabItem
                  forceUpdate={forceUpdate}
                  data={{
                    id: id,
                    isOpen: isOpenStock(),
                    settlementDetail: state.data?.detail?.settlement,
                    salespersonCode: state.data?.detail?.owner.salespersonCode || '',
                    soldAmount: state.data?.detail?.soldAmount,
                    saleInvoiceList: state.data?.initData?.saleInvoiceList,
                    dataSource:
                      state.data?.listStockDetailItem?.flatMap((it) =>
                        it.items
                          .flatMap((it1) => {
                            const endQty = it1.beginningQty + it1.quantity - it1.soldQty;
                            const d: StockDetailItemSettle = {
                              ...it1,
                              isSettle: true,
                              remark: '',
                              totalQty: it1.beginningQty + it1.quantity,
                              endQty: endQty,
                            };
                            return d;
                          }),
                      ) || [],
                  }}
                  actionHandlers={{
                    onSettlementAction: async (item) => {
                      const result = await actions.saveSettlement(item);
                      if (result) {
                        message.success('Settlement is successful.');
                        actions.detail(id);
                      }
                    },
                  }}
                />
              </Tabs.TabPane> */}
            </>
          )}

          {/* <Tabs.TabPane
            tab={
              <Space size={0}>
                <PaperClipOutlined /> <span>Attachment</span>
              </Space>
            }
            key="attachmentTab"
          >
            <AttachementTabItem />
          </Tabs.TabPane> */}
        </Tabs>
      </PageContainer>

      {/* <TransferEntryModal
        title="Deposit Money"
        visible={addModal.visible}
        width={'500px'}
        seList={state.data?.initData?.seList}
        seCode={state.data?.detail?.owner.code}
        onCancel={() => setAddModal({ visible: false })}
        actionHandlers={{
          onSave: onSaveActionHandler,
          // onCancel: () => setAddModal({ visible: false }),
          // onLoadInitData: onInitializationHandler,
        }}
      /> */}

      <StockControlFormModal
        isLoading={state.loading || false}
        title={addStockModal.title}
        open={addStockModal.visible}
        data={{
          selectedSE: state.data?.detail?.owner?.salespersonCode,
          typeId: addStockModal.typeId,
          seList: state.data?.initData?.salespersonList,
          stockCategory: state.data?.initData?.types,
          typeProductItems: state.data?.initData?.typeProductItems,
        }}
        onCancel={() => setAddStockModal({ visible: false, title: undefined, typeId: undefined })}
        actionHandlers={{
          onLoadInitData: () => {},
          onSave: onSaveAddNewStoreActionHandler,
        }}
      />
    </>
  );
};

export default StockControlDetail;
