import { FormModalProps } from '@/components/FormModal';
import { CrmServiceAPI } from '@/services/crm/services';
import { LookupDataItem } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import {
  MpuStockControlItemLess,
  MpuStockDetailItemLess,
  SalesTeamWorkLess,
  SaveRsmRequestMpu,
  StockDetailLess,
} from '@/services/sale/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { Flex, Modal, message } from 'antd';
import { Button, Card, Col, Empty, Row, Space } from 'antd/lib';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import moment, { Moment } from 'moment';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { SalePaths } from '../..';
import { DistributorCreate } from '../../mpu/request/data';
import { PurChaseRequestAPIService } from '../../mpu/request/service';
import { Model } from '../model';
import { MpuServiceApi } from '../services';
import ItemEntryFormModal from './ItemEntryFormModal';

export interface MpuCreateProps extends FormModalProps {
  type: 'CREATE' | 'EDIT';
  id?: number;
  data?: {
    stockStoreId?: number;
    // selectedSE?: string;
    typeId?: number;
    // typeProductItems?: { type: number; value: LookupDataItem[] }[];
    // listLastStockControl?: StockDetailLess[];
    isBeginningManual?: boolean;
    // seCode?: string;
    // stockCategory?: LookupDataItem[];
    members?: SalesTeamWorkLess[];
    salespersons?: SalesTeamWorkLess[];
    plateNumber?: string;
    listLastMpuStockControl?: MpuStockControlItemLess[];
  };
  isLoading: boolean;
  actionHandlers?: {
    onSave?: null;
    onLoadInitData: () => void;
    onBack?: () => void;
  };
  onView?: (data?: {
    stockStoreId?: number;
    selectedSE?: string;
    typeId?: number;
    typeProductItems?: { type: number; value: LookupDataItem[] }[];
    listLastStockControl?: StockDetailLess[];
    isBeginningManual?: boolean;
    stockCategory?: LookupDataItem[];
    members?: SalesTeamWorkLess[];
    salespersons?: SalesTeamWorkLess[];
    plateNumber?: string;
    listLastMpuStockControl?: MpuStockControlItemLess[];
  }) => void;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 16 },
};

interface Amount {
  grandTotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
}

const MpuCreateForm: React.FC<MpuCreateProps> = ({
  id,
  type,
  data,
  isLoading,
  actionHandlers,
  ...rest
}) => {
  const { state, actions } = Model();
  // const { ref, inView } = useInView({});
  const [form] = useForm<{
    description: string;
    internalId: string;
    isActive: number;
    owner: string;
    plateNumber: string;
    receivedBy: string;
    referenceNo: string;
    // requestedDate: Instant;
    status: string;
    stockName: string;
    storeId: number;
    isKeepForwarding: number;
    stockControlType: string;
    distributorCode: string;
    amount: number;
    empNo: string;
    serialNumber: string;
    requestedDate: Moment;
    approvedBy: string;
    approvedDate: Moment;
    discount: number;
  }>();
  const [dataSource, setDataSource] = useState<MpuStockControlItemLess[]>([]);
  const actionRef = useRef<ActionType>();
  // const actionRefBeginning = useRef<ActionType>();
  const [addNewModal, setAddNewModal] = useSetState<{ visible?: boolean; isFromRequest?: boolean }>(
    {},
  );
  const [addTestNewModal, setTestAddNewModal] = useSetState<{
    visible?: boolean;
    isFromRequest?: boolean;
  }>({});
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [forceHistoryUpdate, setForceHistoryUpdate] = useState<number>(0);

  const [beginningDataSource, setBeginningDataSource] = useState<MpuStockControlItemLess[]>([]);

  const requestActions = simpleRequestActions();
  const [distributor, setDistributor] = useState<DistributorCreate>();
  const [saleperson, setSaleperson] = useState<SalesTeamWorkLess>();
  const [dataSourceItems, setDataSourceItems] = useState<MpuStockDetailItemLess[]>();
  const services = PurChaseRequestAPIService(requestActions);

  // const [dataSources, setDataSources] = useState<RsmRequestMpuDetail>();
  const service = MpuServiceApi(requestActions);
  const loadData = async () => {
    const data = await service.detailRequest(id).then((r) => {
      setDistributor({
        id: r.distributor?.id,
        name: r.distributorName,
        code: r.distributorCode,
        phone: r.distributorPhone,
        latitude: r.latitude,
        longitude: r.longitude,
      });

      setSaleperson({
        id: r.owner?.id,
        salespersonCode: r.owner?.salespersonCode,
        salespersonName: r.owner?.salespersonName,
        phoneNumber: r.owner?.phoneNumber,
        teamType: r.owner?.teamType,
        role: r.owner?.role,
        isRequester: r.owner?.isRequester,
        isApprover: r.owner?.isApprover,
        vehicle: r.owner?.vehicle,
        isActive: r.owner?.isActive,
      });

      console.log('TESTING SET STATE : ', saleperson);

      setDataSourceItems(
        r.poItems.map((po, index) => ({
          ...po,
          total: po.quantity * po.price,
          key: uniqueId().toString() + index,
        })),
      );
    });
    // setDataSources(data);
  };

  useEffect(() => {
    id && loadData();
  }, []);

  useEffect(() => {
    actions.initData(id);
  }, []);

  useEffect(() => {
    if (state.data?.detail) {
      form.setFieldsValue({
        description: state.data.detail.description,
        referenceNo: state.data.detail.referenceNo,
        isActive: state.data.detail.isActive,
        owner: state.data.detail.owner,
        plateNumber: state.data.detail.plateNumber,
        receivedBy: state.data.detail.receivedBy,
        status: state.data.detail.status,
        stockName: state.data.detail.stockName,
        storeId: state.data.detail.storeId,
        isKeepForwarding: state.data.detail.isKeepForwarding,
        stockControlType: state.data.detail.stockControlType,
        distributorCode: state.data.detail.distributorCode,
        discount: state.data.detail.discount,
      });
    }
  }, [state.data?.detail]);

  const onSaveAddNewMpuActionHandler = async (isNew: boolean = false) => {
    const msgTitle = `Create a new Stock Control`;

    const dataForm = await form.validateFields();
    Modal.confirm({
      title: msgTitle,
      content: 'Are you sure:',
      onOk: async () => {
        let items: MpuStockDetailItemLess[] = [];

        items =
          data?.listLastMpuStockControl?.flatMap((it) => {
            return it.items
              .filter((it1) => (it1.actualQty || 0) > 0)
              .flatMap((it1, index) => {
                const item: MpuStockControlItemLess = {
                  itemId: it1.itemId,
                  itemName: it1.itemName,
                  itemCode: it1.itemCode,
                  itemQuantity: 0,
                  itemType: it.typeId,
                  type: '',
                  expiredDate: it1.expiredDate,
                  remark: '',
                  index: index,
                  price: it1.price,
                };
                return item;
              });
          }) || [];

        const mpuStockControl: SaveRsmRequestMpu = {
          description: dataForm.description,
          isActive: 1,
          owner: dataForm.owner,
          plateNumber: dataForm.plateNumber,
          referenceNo: dataForm.referenceNo,
          status: 'pending',
          stockName: dataForm.stockName,
          isKeepForwarding: dataForm.isKeepForwarding == true ? 1 : 0,
          stockControlType: 'MPU',
          distributorCode: dataForm.distributorCode,
          discount: amount.discountAmount,
          item: dataSource,
          salespersonCode: '000277',
          storeId: 9,
        };

        console.log('DISCOUNT % :', mpuStockControl);

        const result = await actions.saveMpuStockRequest(mpuStockControl);

        if (result.message === 'Successful Insert') {
          if (isNew) {
            form.resetFields();
            setDataSource([]);
            setBeginningDataSource([]);
            setAmount({ totalAmount: 0, discountAmount: 0, grandTotalAmount: 0 });
          }
          setAddNewModal({ visible: false });
          message.info(`Your transaction is saved.`);
          setForceUpdate(forceUpdate + 1);
          setForceHistoryUpdate(forceHistoryUpdate + 1);
          actions.initData(id);
        } else {
          setAddNewModal({ visible: false });
          message.error(result.message);
        }
      },
    });
  };

  useEffect(() => {
    if (!rest.open) {
      return;
    }
    actionHandlers?.onLoadInitData?.();
    setDataSource([]);
    setBeginningDataSource([]);
    form.resetFields();
    const requester = data?.members?.find((it) => it.isRequester);

    form.setFieldsValue({
      empNo: requester?.salespersonCode,
      approvedDate: moment(),
      requestedDate: moment(),
    });
    return () => {
      form.resetFields();
    };
  }, [rest.open]);

  let items: MpuStockDetailItemLess[] = [];
  items =
    data?.listLastMpuStockControl?.flatMap((it) => {
      return it.items
        .filter((it1) => (it1.actualQty || 0) > 0)
        .flatMap((it1, index) => {
          const item: MpuStockControlItemLess = {
            itemId: it1.itemId,
            itemName: it1.itemName,
            itemCode: it1.itemCode,
            itemQuantity: 0,
            itemType: it.typeId,
            type: '',
            expiredDate: it1.expiredDate,
            remark: '',
            index: index,
            price: it1.price,
          };
          return item;
        });
    }) || [];

  ///////////////////////////////////
  const [amount, setAmount] = useState<Amount>({
    grandTotalAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
  });

  const calTotalAmount = async () => {
    const result = dataSource
      .map((o) => ({
        totalAmoun1: o.price * o.quantity || 0,
      }))
      .reduce((p, c) => ({ totalAmoun1: p.totalAmoun1 + c.totalAmoun1 }));
    result
      ? setAmount((t) => ({
          ...t,
          totalAmount: result.totalAmoun1,
          grandTotalAmount: result.totalAmoun1,
          discountAmount: 0,
        }))
      : { totalAmount: 0, discountAmount: 0, grandTotalAmount: 0 };
  };

  useEffect(() => {
    dataSource?.length && calTotalAmount?.();
  }, [dataSource]);

  return (
    <PageContainer title="Purchase Order" breadcrumb={undefined} onBack={actionHandlers?.onBack}>
      <ProForm
        form={form}
        style={{ fontWeight: 'border' }}
        layout="vertical"
        {...layout}
        submitter={{
          render: () => (
            // inView ?
            <FooterToolbar portalDom={false}>
              <Button
                onClick={() => {
                  if (type === 'EDIT') history.push(`${SalePaths.purchaseOrder}/detail/${id}`);
                  else history.push(`${SalePaths.purchaseOrder}/list`);
                }}
              >
                Cancel
              </Button>
              {type === 'CREATE' && (
                <Button
                  onClick={() => {
                    actions.clearMember();
                    form.resetFields();
                    setDataSource([]);
                    setAmount({ totalAmount: 0, discountAmount: 0, grandTotalAmount: 0 });
                  }}
                >
                  Clear
                </Button>
              )}

              {type === 'CREATE' ? (
                <Button type="primary" onClick={async () => onSaveAddNewMpuActionHandler(true)}>
                  Save & Add New
                </Button>
              ) : (
                <Button type="primary">Update</Button>
              )}
            </FooterToolbar>
            // : <></>
          ),
        }}
      >
        <Card size="small" title="General" style={{ marginBottom: 10 }}>
          <Row justify={'start'}>
            <Col flex="50%" span={12}>
              {}
              <ProFormSelect
                rules={[{ required: true }]}
                name="owner"
                label="Store Name"
                showSearch
                debounceTime={300}
                // onChange={async (e: string) => {
                //   console.log("TEST",e);
                // const r = await SaleServiceAPI(requestActions).findSaleTeamworkByCode({ code: e });
                // console.log("TESTING DATA EDIT : ",r);
                // setSaleperson({
                //   id: r.id,
                //   salespersonCode: r.salespersonCode,
                //   salespersonName: r.salespersonName,
                //   phoneNumber: r.phoneNumber,
                //   teamType: r.teamType,
                //   role: r.role,
                //   isRequester: r.isRequester,
                //   isApprover: r.isApprover,
                //   vehicle: r.vehicle,
                //   isActive: r.isActive
                // });
                // }}
                // request={async ({ keyWords }) => {
                //   const result = keyWords && (await actions.searchSaleTeamworkByMpu(keyWords));
                //   return result.map((it: { salespersonName: string }) => ({
                //     label: it.salespersonName,
                //     value: it.salespersonCode,
                //   }));
                // }}
                request={async (k: { keyWords: string }) => {
                  const data = await services.salespersonList({
                    searchValue: k.keyWords,
                  });
                  return data
                    .filter((t) => t.isRequester === true)
                    .map((p) => ({
                      value: [p.salespersonCode, p.salespersonName].join(','),
                      label: p.salespersonName,
                    }));
                }}
                placeholder="Please select"
              />
              <ProFormText
                label={'Reference No'}
                name={'referenceNo'}
                width={'md'}
                help={<span />}
              />
            </Col>

            <Col flex="50%" span={12}>
              <ProFormSelect
                showSearch
                debounceTime={500}
                rules={[{ required: true }]}
                name={'distributorCode'}
                onChange={async (s: number) => {
                  const y = await CrmServiceAPI(requestActions).findDetailCustomer({ id: s });
                  setDistributor({
                    code: y.code,
                    id: y.id,
                    name: y.name,
                    phone: y.contacts?.[0].phone1,
                    latitude: y?.addressList?.[0]?.latitude,
                    longitude: y?.addressList?.[0]?.longitude,
                  });
                }}
                label={'Distributor'}
                request={async (k: { keyWords: string }) => {
                  const data = await CrmServiceAPI(requestActions).findAllCustomer({
                    searchValue: k.keyWords,
                  });
                  return data.items.map((p) => ({ value: p.id, label: p.name }));
                }}
              />

              <ProFormTextArea help={<span />} label={'Description'} name={'description'} />
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title={state.data?.listLastStockControl === null ? 'Stock Detail' : 'Detail'}
          style={{ marginBottom: 10 }}
        >
          {state.data?.detailStockStore?.stockControl === null && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No Data</span>}>
              <Button type="primary" onClick={() => setTestAddNewModal({ visible: true })}>
                Create New Stock Request
              </Button>
            </Empty>
          )}
          {/* <ProTable<StockDetailItemLess> */}
          <ProTable<MpuStockDetailItemLess>
            headerTitle="Line Items"
            size="small"
            sortDirections={['ascend']}
            showSorterTooltip={false}
            key="id"
            rowKey="id"
            pagination={false}
            bordered={false}
            search={false}
            dataSource={dataSource}
            actionRef={actionRef}
            options={{
              setting: false,
              density: false,
              fullScreen: false,
              reload: false,
            }}
            toolBarRender={() => [
              <Button
                type="primary"
                size="small"
                disabled={isLoading}
                onClick={() => setTestAddNewModal({ visible: true, isFromRequest: true })}
                icon={<PlusOutlined />}
              />,
            ]}
            columns={[
              {
                title: '#',
                dataIndex: 'index',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.index! - b.index!,
                key: 'itemId',
              },
              { title: 'Description', dataIndex: 'itemName' },
              { title: 'Type', dataIndex: 'type' },
              { title: 'Quantity', align: 'right', dataIndex: 'quantity' },
              { title: 'Price', dataIndex: 'price' },
              { title: 'Remark', dataIndex: 'remark' },
              {
                title: 'Action',
                render: (_, data) => {
                  return (
                    <Space size={0}>
                      {/* <Button size="small" type="link" icon={<EditOutlined />} onClick={(_) => {}} /> */}
                      <Button
                        size="small"
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          let copyArray = dataSource
                            .copyWithin(-1, -1)
                            .filter((it) => it.itemId !== data.itemId);
                          copyArray.forEach((it, index) => {
                            it.index = index + 1;
                          });
                          console.log(copyArray);
                          setDataSource(copyArray);
                          setAmount({ totalAmount: 0, discountAmount: 0, grandTotalAmount: 0 });

                          actionRef.current?.reload();
                        }}
                      />
                    </Space>
                  );
                },
              },
            ]}
          />
          <Flex justify="space-between">
            <div></div>
            <ProDescriptions<Amount>
              column={1}
              editable={{
                onSave: (_, record, originRow) => {
                  const total =
                    (originRow.grandTotalAmount as number) -
                    ((originRow.grandTotalAmount as number) * (record.discountAmount || 0)) / 100;
                  setAmount((c) => ({
                    ...c,
                    ...record,
                    discountAmount: record.discountAmount,
                    totalAmount: total,
                  }));
                  return Promise.resolve({
                    data: record,
                    sucess: true,
                  });
                },
              }}
              style={{
                width: '300px',
              }}
              dataSource={amount}
              labelStyle={{
                width: 150,
              }}
              contentStyle={{
                fontWeight: 500,
              }}
              columns={[
                {
                  title: 'Grand Total',
                  valueType: 'money',
                  editable: false,
                  // dataIndex: "grandTotalAmount",
                  render: (_, r) => `$ ${numeral(r.grandTotalAmount).format('0.00')}`,
                },
                {
                  title: 'Discount',
                  dataIndex: 'discountAmount',
                  valueType: 'percent',
                },
                {
                  title: 'Total',
                  // dataIndex: "totalAmount",
                  valueType: 'money',
                  editable: false,
                  render: (_, r) => `$ ${numeral(r.totalAmount).format('0.00')}`,
                },
              ]}
            />
          </Flex>
        </Card>
      </ProForm>

      <ItemEntryFormModal
        open={addTestNewModal.visible}
        onCancel={() => setTestAddNewModal({ visible: false })}
        loading={isLoading}
        data={{
          typeId: 132,
          seq: (dataSource.length || 0) + 1,
          types: state.data?.initData?.types,
          typeProductItems: state.data?.initData?.typeProductItems,
          keyStr: 'stock-item',
        }}
        actionHandlers={{
          onAddItem: (item) => {
            console.log('DATA SOURCE MODAL : ', item);
            const existing = addTestNewModal.isFromRequest
              ? dataSource.find(
                  (it) =>
                    it.itemType !== 132
                      ? it.itemType === item.itemType && it.itemId === item.itemId
                      : it.itemType === item.itemType &&
                        it.itemId === item.itemId &&
                        it.batchNo === item.batchNo,
                  //item.expiredDate?.isSame(it.expiredDate, 'day'),
                )
              : beginningDataSource.find(
                  (it) =>
                    it.itemType !== 132
                      ? it.itemType === item.itemType && it.itemId === item.itemId
                      : it.itemType === item.itemType &&
                        it.itemId === item.itemId &&
                        it.batchNo === item.batchNo,
                  //item.expiredDate?.isSame(it.expiredDate, 'day'),
                );
            if (existing) {
              let copyArray = addTestNewModal.isFromRequest
                ? dataSource.copyWithin(-1, -1)
                : beginningDataSource.copyWithin(-1, -1);
              copyArray.forEach((it) => {
                if (
                  it.itemType !== 132
                    ? it.itemType === item.itemType && it.itemId === item.itemId
                    : it.itemType === item.itemType &&
                      it.itemId === item.itemId &&
                      it.batchNo === item.batchNo
                  //item.expiredDate?.isSame(it.expiredDate, 'day')
                )
                  it.quantity += item.quantity;
              });
              addTestNewModal.isFromRequest
                ? setDataSource(copyArray)
                : setBeginningDataSource(copyArray);
            } else {
              addTestNewModal.isFromRequest
                ? setDataSource([...dataSource, item])
                : setBeginningDataSource([...beginningDataSource, item]);
            }
            setAddNewModal({ visible: false, isFromRequest: !addTestNewModal.isFromRequest });
          },
        }}
      />
    </PageContainer>
  );
};

export default MpuCreateForm;
