import RemarkModal from '@/components/remark-modal';
import { formatDate } from '@/pages/utils';
import {
  AssigningDocsResponse,
  DeliveryNoteDetail,
  DeliveryNoteItem,
  Driver,
  InvoiceItem,
  LoadingItemDetail,
  Truck,
} from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, EnvironmentOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProCard, ProFormCheckbox, ProFormDatePicker, ProFormGroup, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { ModalForm, ModalFormProps } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Alert, Button, Checkbox, Col, message, Modal, Row, Space, Spin, Switch, Tooltip, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import _ from 'lodash';
import { Moment } from 'moment';
import { useEffect, useState } from 'react';
import { UiType, ViewController } from './view-controller';
import { shiftList } from './issue-dn';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export interface CollectedInvoice extends InvoiceItem {
  included: boolean;
  remarks?: string;
}

interface Props extends ModalFormProps, ViewController {
  from?: UiType
  // requestActions: SimpleRequestActions,
  // delivery: DeliveryListItem;
  // assigningData: AssigningDocsResponse;
  // loading?: boolean;
  // onRefresh?: () => void;
  // onReload: (
  //   driverId?: number,
  //   licensePlate?: string,
  //   deliveryDate?: Moment,
  //   shift?: string,
  //   remarks?: string
  // ) => void;
  // onRequestChange: (driverId: number, licensePlate: string, deliveryNotes: number[], items: DeliveryNoteItem[], remarks?: string) => void;
}

const errorMessage = 'Quantity mismatched. Please revise delivery note or ask warehouse team to acknowledge the changed quantity'
// const errorMessageSameQty = "Item quantities are the same. Reasigning is not possible"

const AssignedDocModal: React.FC<Props> = ({
  from,
  requestActions,
  actions: { onRefreshDetailData, onRefreshLisViewData },
  data: { itemDetail },
  view: { loading },
  ...rest
}) => {
  const services = DeliveryServiceAPI(requestActions);
  const [assigningData, setAssigningDate] = useState<AssigningDocsResponse>()
  const [invoices, setInvoices] = useState<CollectedInvoice[]>([]);
  const [commentModal, setCommentModal] = useState<{ visible: boolean; item?: CollectedInvoice }>({
    visible: false,
  });

  const [changeLoadingModal, setChangeLoadingModal] = useState(false);
  const [truckChanging, setTruckChanging] = useState(false)
  const [driverList, setDriverList] = useState<Driver[]>()
  const [trucks, setTrucks] = useState<Truck[]>()
  const [showTotalLoadedAmount, setShowTotalLoadedAmount] = useState(true)
  const [form] = useForm<{
    docDate: Moment;
    shift: string;
    driverId: number;
    licensePlate: string;
    allowNoInvoiceCodCust?: boolean;
  }>()
  const [openMap, setOpenMap] = useState(false)

  const reasigning = itemDetail?.delivery?.assignedDocDate !== null
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8', // put your key here
  });

  const onAssigningDocsHandler = async (
    driverId?: number,
    licensePlate?: string,
    deliveryDate?: Moment,
    shift?: string,
    remarks?: string
  ) => {
    if (!itemDetail?.delivery) return;
    try {
      const assigningData = await services.fetchLoadedDetail(itemDetail.delivery.id, driverId, licensePlate, deliveryDate, shift, remarks);
      setAssigningDate(assigningData)
    } catch (error: any) {
      message.error(error.message || 'Failed to load itemDetail.');
    }
  };

  const noInvoiceFormCODCustomerChecks = () => assigningData?.deliveryNotes.filter(it => it.paymentTerm == 'COD' && !it.items.some(i => assigningData.invoices.some(i1 => i1.docEntry == i.invDocEntry)))

  const onChangedRequestHandler = async (
    driverId: number,
    licensePlate: string,
    deliveryNotes: number[],
    items: DeliveryNoteItem[],
    pickedDate?: Moment,
    shift?: string,
    remarks?: string
  ) => {
    Modal.confirm({
      title: 'Loading Change Request',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await DeliveryParams.requestChangeLoading(
            driverId, licensePlate, itemDetail?.id || 0,
            deliveryNotes, items.map(it => ({ itemCode: it.itemCode, qty: it.qty })),
            pickedDate, shift,
            remarks)(requestActions)
          if (from === 'DETAIL') {
            onRefreshDetailData()
          }
          // onRefreshLisViewData() // refresh by we socket
          onHide()
          rest.onOpenChange?.(false)

        } catch (error: any) {
          message.error(error.message || `Failed to make request`);
        }
      },
    });
  }


  const onAssignedDocsHandler = () => {
    const dnList = assigningData?.deliveryNotes?.map(it => it.docEntry)
    if ((dnList || []).length == 0) {
      message.error("No dn found to assign")
      return
    }
    Modal.confirm({
      title: 'Assign delivery notes and invoices',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.assignDocs({
            deliveryId: itemDetail?.delivery?.id || 0,
            deliveryDocEntry: dnList || [],
            collectedInvoices: invoices.map((it) => ({
              docEntry: it.docEntry,
              collected: it.collected || false,
              included: it.included,
              remarks: it.remarks,
            })),
          });
          if (from === 'DETAIL') {
            onRefreshDetailData()
          }
          onRefreshLisViewData()
          rest.onOpenChange?.(false)
        } catch (error: any) {
          message.error(error?.message || 'Failed to assign.');
        }
      },
    });
  };

  useEffect(() => {
    if (!rest.open) return
    onAssigningDocsHandler()
    form.setFieldsValue({
      'docDate': itemDetail?.delivery?.deliveryDate,
      'shift': itemDetail?.delivery?.shift

    })
  }, [rest.open,]);

  useEffect(() => {
    setInvoices(assigningData?.invoices?.map((it) => ({ ...it, included: true })) || []);
  }, [
    assigningData?.invoices
  ])


  useEffect(() => {

    if (trucks?.some(it => it.licensePlate === itemDetail?.delivery?.truck?.licensePlate)) {
      form.setFieldValue("licensePlate", itemDetail?.delivery?.truck?.licensePlate)
    } else {
      form.setFieldValue("licensePlate", trucks?.find(it => it)?.licensePlate)
    }
    if (!trucks) {
      form.resetFields(['licensePlate'])
    }
  }, [trucks])

  const expandedRowRender = (item: DeliveryNoteDetail) => {
    return (
      <ProTable<DeliveryNoteItem>
        search={false}
        size={'small'}
        options={{
          density: false,
          setting: false,
          reload: false,
        }}
        pagination={false}
        dataSource={item.items}
        rowKey="id"
        columns={[
          { title: 'Item Code', dataIndex: 'itemCode' },
          { title: 'Description', dataIndex: 'itemDescription' },
          { title: 'UoM', dataIndex: 'uomCode' },
          { title: 'Qty', dataIndex: 'qty', align: 'right' },
        ]}
      />
    );
  };

  const changeTruckHandler = async (changed: boolean) => {

    setTruckChanging(changed)

    if (changed && (driverList?.length || 0) === 0) {
      const driverList = await DeliveryParams.listActiveDrivers.query(requestActions)
      setDriverList(driverList)
      const driver = driverList.find(it => it.id === itemDetail?.delivery?.driver?.id)
      setTrucks(driver?.trucks)
      form.setFieldValue('driverId', itemDetail?.delivery?.driver?.id || driver?.id)
    }

    if (!changed) {
      onAssigningDocsHandler()
    }

  }

  const onHide = () => {
    setCommentModal({ visible: false })
    setChangeLoadingModal(false)
  };

  const sameAmountCheck = () => {
    const loadedItems = assigningData?.loading.items.map(it => ({ itemCode: it.itemCode, qty: it.loadedQty })) || []

    const deliveryItems = assigningData?.deliveryNotes.flatMap(it => it.items).map(it => ({ itemCode: it.itemCode, qty: it.qty })) || []

    const allItemCodes = _.uniq([...loadedItems.map(it => it.itemCode), ...deliveryItems.map(it => it.itemCode)])

    const checkItems = allItemCodes.map(it => ({ itemCode: it, qty: _.sum(loadedItems.filter(i => i.itemCode === it).map(i => i.qty)) - _.sum(deliveryItems.filter(i => i.itemCode === it).map(i => i.qty)) }))

    return !checkItems.some(it => it.qty !== 0)
  }

  // const checkTruck = () => itemDetail?.delivery?.truck?.licensePlate === (form.getFieldValue('licensePlate') || itemDetail?.delivery?.truck?.licensePlate)


  const getData = async () => {
    if (truckChanging) {
      const formData = await form.validateFields(['driverId', 'licensePlate', 'docDate', 'shift'])
      return {
        driverId: formData.driverId,
        licensePlate: formData.licensePlate,
        docDate: formData.docDate,
        shift: formData.shift
      }
    } else {


    }
  }

  const onReloadHandler = async () => {
    const data = await getData()
    onAssigningDocsHandler(data?.driverId, data?.licensePlate, data?.docDate, data?.shift)
  }

  const defaultCenter = {
    lat: Number(assigningData?.deliveryNotes[0]?.latitude) || 11.562108,
    lng: Number(assigningData?.deliveryNotes[0]?.longitude) || 104.888535,
  };

  return (
    <ModalForm
      title="Assign Docs"
      {...rest}
      form={form}
      onValuesChange={async (valueChanges, values) => {
        const { driverId } = valueChanges
        if ('driverId' in valueChanges) {
          setTrucks(driverList?.find(it => it.id === driverId)?.trucks)
        }

      }}
      onFinish={async (_) => {
        const dataForm = await form.validateFields(['allowNoInvoiceCodCust'])
        if (dataForm.allowNoInvoiceCodCust == false) {
          message.error("Please authorize COD customer without invoice issued from SAP or make sure invoice is issued before trying again.")
          return Promise.reject()
        }
        const sameAmount = sameAmountCheck()

        if (!sameAmount) {
          message.error(
            errorMessage,
          );
          return Promise.reject();
        }
        onAssignedDocsHandler();
        return Promise.resolve();
      }}
    >
      <Spin spinning={requestActions.request?.loading || loading}>
        <ProCard bordered={false} style={{ marginBottom: 5 }}>
          <Row>
            <Col flex={'Auto'}>
              {
                <Checkbox onChange={(e) => changeTruckHandler(e.target.checked)}>
                  <Typography.Text strong type="warning">Change Request</Typography.Text>
                </Checkbox>
              }
            </Col>
            <Col>

            </Col>
            <Col >

              {!truckChanging && <Space>
                <Typography.Text type="warning">  {[itemDetail?.delivery?.driver?.firstName, itemDetail?.delivery?.driver?.lastName].join(" ")}/ {itemDetail?.delivery?.truck?.licensePlate}/{formatDate(itemDetail?.delivery.deliveryDate)}/{itemDetail?.delivery.shift} </Typography.Text>
                <Button type='link' onClick={() => setOpenMap(true)} icon={<EnvironmentOutlined />} />
                <Button type='link' onClick={onReloadHandler} icon={<ReloadOutlined />} />
              </Space>}
            </Col>
          </Row>
        </ProCard>
        {
          truckChanging && <ProCard size='small' boxShadow style={{ marginBottom: 5 }} title="Search" >
            <ProFormGroup >
              <ProFormSelect rules={[{ required: true }]}
                showSearch allowClear={false} label="Driver" name={'driverId'}
                width={'sm'} options={driverList?.map(it => ({
                  label: [it.firstName, it.lastName].join(" "),
                  value: it.id
                }))} />
              <ProFormSelect rules={[{ required: true }]}
                showSearch label="Truck"
                allowClear={false}
                name={'licensePlate'}
                width={180} options={trucks?.map(it => ({
                  label: it.licensePlate,
                  value: it.licensePlate
                }))} />
              <ProFormDatePicker
                width={180}
                label="Shipping Date"
                name={'docDate'}
                rules={[{ required: true }]}
              />
              <ProFormSelect
                allowClear={false}
                rules={[{ required: true }]}
                label="Shift"
                name={'shift'}
                width={120}
                options={shiftList}
              />
              <ProFormText label=".">
                <Button icon={<SearchOutlined />} onClick={async () => {
                  await onReloadHandler()
                }}>
                  Search
                </Button>
              </ProFormText>
            </ProFormGroup>

          </ProCard>
        }
        <Space direction='vertical' style={{ width: '100%' }} >
          {(assigningData?.deliveryNotes.length || 0) === 0 && <Alert type='warning' showIcon closable message="No deivery items available. Please verify with SAP." />}

          {assigningData?.loading.changeRequestPending && <Alert showIcon type='warning' message="Pending change request from warehouse." />}
          {/* {reasigning && sameAmountCheck() && checkTruck() && <Alert showIcon type='error' message={errorMessageSameQty} />} */}
          {!sameAmountCheck() && (assigningData?.deliveryNotes.length || 0) > 0 && <Alert showIcon type='error' message={<Space>
            <div>{errorMessage}</div>
          </Space>} action={<Tooltip title="Change Request (WH)"><Button onClick={() => setChangeLoadingModal(true)}>
            Request Change
          </Button></Tooltip>} />}
        </Space>
        {!openMap && (<>
          <ProCard
            size='small'
            title="Loaded Items"
            bordered
            collapsible
            defaultCollapsed
            onCollapse={collapsed => {
              setShowTotalLoadedAmount(collapsed)
            }}
            extra={showTotalLoadedAmount && <Typography.Text strong>Total: {assigningData?.loading?.items?.map((it) => it.loadedQty || 0).reduce((p, c) => p + c, 0)}</Typography.Text>}
            style={{ marginBottom: 5, marginTop: 5 }} >
            <ProTable<LoadingItemDetail>

              search={false}
              size={'small'}
              options={{
                density: false,
                setting: false,
                reload: false,
              }}

              pagination={false}
              dataSource={assigningData?.loading?.items || []}
              rowKey="id"
              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Description', dataIndex: 'itemDescription' },
                { title: 'UOM', dataIndex: 'uom' },
                { title: 'Qty', dataIndex: 'qty', align: 'right' },
                { title: 'Batch Num', dataIndex: 'batchNum' },
                { title: 'Whs.Code', dataIndex: 'whsCode' },
                { title: 'Loaded Qty', dataIndex: 'loadedQty', align: 'right' },
              ]}
              footer={(data) => (
                <Row>
                  <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                    Total
                  </Col>
                  <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                    {' '}
                    {data.map((it) => it.loadedQty || 0).reduce((p, c) => p + c, 0)}{' '}
                  </Col>
                </Row>
              )}
            />
          </ProCard>

          {(assigningData?.deliveryNotes?.length || 0) > 0 &&
            <ProCard title='Delivery Notes' size='small' bordered style={{ marginBottom: 5 }} >
              <ProTable<DeliveryNoteDetail>
                search={false}
                size={'small'}
                options={{
                  density: false,
                  setting: false,
                  reload: false,
                }}
                pagination={false}
                dataSource={assigningData?.deliveryNotes}
                expandable={{
                  expandedRowRender,
                }}
                rowKey="docEntry"
                columns={[
                  { title: 'DN Num', dataIndex: 'docNum', align: 'left' },
                  { title: 'Customer Code', dataIndex: 'cardCode', align: 'left' },
                  { title: 'Ship to Code', dataIndex: 'shipToCode' },
                  { title: 'Address', dataIndex: 'address' },
                  { title: 'Total Qty', dataIndex: 'qty', align: 'right' },
                ]}
                footer={(data) => (
                  <Row>
                    <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                      Total
                    </Col>
                    <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                      {data.map((it) => it.qty).reduce((p, c) => p + c, 0)}
                    </Col>
                  </Row>
                )}
              />
            </ProCard>}



          {invoices.length > 0 && (
            <ProCard size='small' bordered title='Invoices' style={{ marginBottom: 5 }}
            // extra = {<Space><InvoiceFinder trigger={ <Button icon = {<PlusCircleFilled/>} type='link'>Add Invoice</Button>} /></Space>}
            >
              <ProTable<CollectedInvoice>
                search={false}
                rowKey="docEntry"
                size={'small'}
                options={{
                  density: false,
                  setting: false,
                  reload: false,
                }}
                pagination={false}
                dataSource={invoices}
                columns={[
                  { title: 'Inv Num', dataIndex: 'docNum', width: 100 },
                  { title: 'Doc Date', dataIndex: 'docDate', width: 100 },
                  { title: 'Customer Code', dataIndex: 'cardCode', align: 'left' },
                  { title: 'Payment Term', dataIndex: 'paymentTerm' },
                  { title: 'Collected', align: 'center', dataIndex: 'collected', render: (_, r) => r.collected && <Checkbox checked /> },
                  { title: 'Remarks', dataIndex: 'remarks' },
                  { title: 'Amount', dataIndex: 'amount', align: 'right', width: 100 },
                  {
                    title: 'Included',
                    width: 50,
                    render: (_, r) => (
                      <Switch
                        onChange={(checked) => {
                          if (!checked) {
                            setCommentModal({ visible: true, item: r });
                          } else {
                            setInvoices((v) =>
                              v.map((it) => {
                                if (it.docEntry === r.docEntry) {
                                  return { ...it, included: checked, remarks: undefined };
                                } else {
                                  return it;
                                }
                              }),
                            );
                          }
                        }}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={r.included}
                      />
                    ),
                  },
                ]}
                footer={(data) => (
                  <Row>
                    <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                      Total
                    </Col>
                    <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                      {data.map((it) => it.amount).reduce((p, c) => p + c, 0)}
                    </Col>
                    <Col flex={'70px'} />
                  </Row>
                )}
              />
            </ProCard>



          )}
        </>)}
        {openMap && (<>
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => setOpenMap(false)}
            >
              Back
            </Button>
          </div>
          <GoogleMap
            zoom={12}
            center={defaultCenter}
            mapContainerStyle={{ width: "100%", height: "550px" }}
          >
            {assigningData?.deliveryNotes.map((dn) => (
              <Marker
                key={dn.docEntry}
                position={{ lat: Number(dn.latitude), lng: Number(dn.longitude) }}
                title={`${dn.cardName} - ${dn.docNum}`}
              />
            ))}


          </GoogleMap>
        </>)}
        {(noInvoiceFormCODCustomerChecks()?.length || 0) > 0 && <ProFormCheckbox
          rules={[{ required: true }]}
          name={"allowNoInvoiceCodCust"}>
          <Alert type='warning' message={`Allow COD customer delivery without invoice issued from SAP, customer code : ${noInvoiceFormCODCustomerChecks()?.map(it => it.cardCode).join(", ")}.`} />
        </ProFormCheckbox>}

        <RemarkModal
          title="Change Loading"
          open={changeLoadingModal && rest.open}
          onCancel={onHide}
          onSave={async (_, remarks) => {
            const data = await getData()
            await onChangedRequestHandler(
              data?.driverId || itemDetail?.delivery?.driver?.id!!,
              data?.licensePlate || itemDetail?.delivery?.truck?.licensePlate!!,
              assigningData?.deliveryNotes?.map(it => it.docEntry) || [],
              assigningData?.deliveryNotes?.flatMap(it => it.items) || [],
              data?.docDate,
              data?.shift,
              remarks
            )
          }}
        />

        {/* </Card> */}
        <RemarkModal
          title="Exclude Invoice"
          open={commentModal.visible}
          onCancel={() => {
            onHide();
          }}
          onSave={(_, remarks) => {
            setInvoices((v) =>
              v.map((it) => {
                if (it.docEntry === commentModal.item?.docEntry) {
                  return { ...it, included: false, remarks: remarks };
                } else {
                  return it;
                }
              }),
            );
            onHide();
          }}
        />
      </Spin>
    </ModalForm>
  );
};

export default AssignedDocModal;
