import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { formatter, formatterQty } from '@/pages/utils';
import { fetchDataItemService, singleRequest } from '@/services/apiGateway';
import { DeliveryNoteListItem, Driver, LoadingItem, LoadingItemDetail, Truck } from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { InstanceDetail } from '@/services/delivery/instance.types';
import { LoadingParams } from '@/services/delivery/loading-params';
import { SimpleRequestActions } from '@/services/model';
import { SearchOutlined } from '@ant-design/icons';
import { ProCard, ProFormCheckbox } from '@ant-design/pro-components';
import ProForm, {
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { useAccess } from '@umijs/max';
import { Alert, Button, Checkbox, Col, message, Modal, Row, Spin, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { sum, uniq } from 'lodash';
import moment from 'moment';
import { Moment } from 'moment';
import { useEffect, useState } from 'react';

interface Props extends FormModalProps {
  requestActions: SimpleRequestActions;
  itemDetail?: InstanceDetail
  cb?: () => void
}

export const shiftList = ['Morning', 'Daylignt', 'Evening'];
export const timeFrame = [
  { from: 4, to: 10, shift: 'Morning' },
  { from: 11, to: 15, shift: 'Daylignt' },
  { from: 16, to: 24, shift: 'Evening' },
]

const PickingSlip: React.FC<Props> = ({ cb, requestActions, itemDetail, ...props }) => {

  const access = useAccess()
  const [loadingItem, setLoadingItem] = useState<LoadingItem>();
  const [warehouses, setWarehouses] = useState<string[]>([])
  const [truckChanging, setTruckChanging] = useState(false)
  const [driverList, setDriverList] = useState<Driver[]>()
  const [trucks, setTrucks] = useState<Truck[]>()
  const [showTotalPickedAmount, setShowTotalPickedAmount] = useState(true)
  const [autoSearch, setAutoSearch] = useState(0)

  const sameQty = () => {

    if ((itemDetail?.loadingInfo?.items.length || 0) === 0) {
      return false
    }

    const cItemCode = itemDetail?.loadingInfo?.items.map(it => it.itemCode) || []
    const nItemCode = loadingItem?.pickingItems.map(it => it.itemCode) || []
    const itemCodes = [...cItemCode, ...nItemCode]


    const checkItems = itemCodes.map(it => ({
      itemCode: it,
      qty: sum([...(itemDetail?.loadingInfo?.items.filter(i => i.itemCode === it).map(i => i.qty) || []), ...(loadingItem?.pickingItems.filter(i => i.itemCode === it).map(i => i.qty * -1) || [])])
    }))

    return !checkItems.some(it => it.qty !== 0)
  }

  const [form] = useForm<{
    docDate: Moment;
    driverId: number;
    licensePlate: string;
    whsCode?: string;
    shift: string;
    remarks?: string;
    ownedTruckLoading?: boolean;
  }>();

  const init = async () => {
    const rs = await fetchDataItemService<{ assignedDate: Moment, shift?: string }, { id: number }>({
      actionName: 'fetch-loading-by-id',
      endpoint: 'DELIVERY',
      payload: { id: itemDetail?.id || 0 },
    }).query(requestActions)

    const hour = moment().get('hours')
    form.setFieldsValue({
      docDate: rs.assignedDate || moment(),
      shift: rs.shift || timeFrame.find(it => it.from <= hour && it.to >= hour)?.shift || 'Morning'
    });

    setAutoSearch(v => v + 1)
  }

  useEffect(() => {
    if (!props.open) return;
    init()

  }, [props.open]);

  useEffect(() => {
    if (!truckChanging && autoSearch > 0) {
      search()
    }
  }, [autoSearch])

  const search = async (formValues?: any) => {
    try {
      const formData = formValues || await form.validateFields(['driverId', 'licensePlate', 'docDate', 'shift'])
      const { docDate, shift, driverId, licensePlate } = formData

      const rs = (await singleRequest(
        LoadingParams.searchLoadingItem(itemDetail?.loading?.id || 0, docDate, shift, truckChanging ? driverId : null, truckChanging ? licensePlate : null),

      )(requestActions)) as LoadingItem;
      setLoadingItem(rs)
      const warehouseList = uniq(rs.pickingItems.filter(it => it.whsCode).map(it => it.whsCode || ''))
      setWarehouses(warehouseList)
      form.setFieldValue('whsCode', warehouseList.find(it => it === 'OFL-WH02') || warehouseList.find(it => it))
      form.setFieldValue('ownedTruckLoading', rs.ownedTruckLoading)

    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  const changeTruckHandler = async (changed: boolean) => {
    setLoadingItem(undefined)
    setTruckChanging(changed)
    if (changed && (driverList?.length || 0) === 0) {
      const driverList = await DeliveryParams.listActiveDrivers.query(requestActions)
      setDriverList(driverList)
      const driver = driverList.find(it => it.id === itemDetail?.loading?.driver.id)
      setTrucks(driver?.trucks)
      form.setFieldValue('driverId', itemDetail?.loading?.driver.id || driver?.id)
    }
    setAutoSearch(v => v + 1)
  }

  const assignedPickingSlipHandler = async () => {

    if ((loadingItem?.pickingItems?.length || 0) === 0) {
      message.error('No picking items available');
      return;
    }
    const dataForm = await form.validateFields();

    if (((dataForm.driverId == itemDetail?.loading?.driver.id && dataForm.licensePlate == itemDetail?.loading?.truck.licensePlate) || !truckChanging) && sameQty()) {
      message.error('Cannot assign the same picking amount.');
      return;
    }
    Modal.confirm({
      title: 'Picking Slip Assigning',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(
            LoadingParams.assignedPickingSlip(
              itemDetail?.loading?.id || 0,
              dataForm.docDate,
              dataForm.shift,
              loadingItem?.deliveryNoteListItems.map((it) => it.docEntry) || [],
              loadingItem?.pickingItems.map(it => ({ itemCode: it.itemCode, qty: it.qty })) || [],
              dataForm.whsCode,
              dataForm.remarks,
              dataForm.driverId,
              dataForm.licensePlate,
              itemDetail !== null,
              dataForm.ownedTruckLoading

            ),
          )(requestActions);
          props.onCancel?.();
          cb?.()
          message.success('Picking slip assigned succesfully.');
        } catch (error) {
          message.error(`Failed to assign picking slip`);
        }
      },
    });
  };

  useEffect(() => {

    if (trucks?.some(it => it.licensePlate === itemDetail?.loading?.truck.licensePlate)) {
      form.setFieldValue("licensePlate", itemDetail?.loading?.truck.licensePlate)
    } else {
      form.setFieldValue("licensePlate", trucks?.find(it => it)?.licensePlate)
    }
    if (!trucks) {
      form.resetFields(['licensePlate'])
    }
  }, [trucks])

  return (
    <FormModalComp title="Picking Slip"
      {...props}
      onSubmit={assignedPickingSlipHandler}>
      <Spin spinning={requestActions.request?.loading || false}>
        <ProForm
          onValuesChange={async (valueChanges, values) => {
            const { driverId } = valueChanges
            if ('changeTruck' in valueChanges) {
              return
            }
            if ('driverId' in valueChanges) {
              setTrucks(driverList?.find(it => it.id === driverId)?.trucks)
            }
            if ('docDate' in valueChanges || 'shift' in valueChanges || 'driverId' in valueChanges || 'licensePlate' in valueChanges) {
              setLoadingItem(undefined)
              setAutoSearch(v => v + 1)
            }
          }}
          form={form}
          submitter={false}
        >
          {access.canAccessDeliveryMenuItem && <ProCard style={{ marginBlock: 5 }} boxShadow size="small" title="Searching">
            <ProFormGroup >
              <Checkbox disabled={!access.canAccessDeliveryMenuItem} defaultChecked={false} onChange={e => changeTruckHandler(e.target.checked)} >
                <Typography.Text strong type="warning">Change Truck</Typography.Text>
              </Checkbox>
            </ProFormGroup>
            {truckChanging && <ProFormGroup >
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
                width={200} options={trucks?.map(it => ({
                  label: it.licensePlate,
                  value: it.licensePlate
                }))} />
              <ProFormDatePicker
                width={150}
                label="Shipping Date"
                name={'docDate'}
                rules={[{ required: true }]}
              />
              <ProFormSelect
                allowClear={false}
                rules={[{ required: true }]}
                label="Shift"
                name={'shift'}
                width={100}
                options={shiftList}
              />
              {truckChanging && <ProFormText label=".">
                <Button icon={<SearchOutlined />} onClick={async () => {
                  await search();
                }}>
                  Search
                </Button>
              </ProFormText>}
            </ProFormGroup>}

            {sameQty() && <Alert type='warning' showIcon message="Plicking items are the same." />}
            {(loadingItem?.pickingItems?.length || 0) === 0 && <Alert type='warning' showIcon closable message="No picking item available. Please verify with SAP." />}
          </ProCard>}

          {(itemDetail?.loadingInfo?.items.length || 0) > 0 && < ProCard
            boxShadow collapsible
            defaultCollapsed
            onCollapse={collapsed => {
              setShowTotalPickedAmount(collapsed)
            }}
            title="Current Picking Items" size="small" style={{ marginTop: '5px' }}
            extra={showTotalPickedAmount && <Typography.Text strong>Total: {itemDetail?.loadingInfo?.items?.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}</Typography.Text>}
          >
            <ProTable<LoadingItemDetail>

              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Description', dataIndex: 'itemDescription' },
                { title: 'Wherehouse Code', dataIndex: 'whsCode' },
                { title: 'UoM', dataIndex: 'uomCode' },
                { title: 'Shipped Qty', dataIndex: 'qty', align: 'right', render: (_, r) => formatterQty.format(r.qty) },
              ]}
              style={{ marginBlock: 5 }}
              size="small"
              dataSource={itemDetail?.loadingInfo?.items}
              options={false}
              search={false}
              pagination={false}
              rowKey={'itemCode'}
              footer={(data) => (
                <Row>
                  <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                    Total
                  </Col>
                  <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                    {data.map((it) => (it.qty || 0))?.reduce((p, c) => p + c, 0)}
                  </Col>
                </Row>
              )}
            />



          </ProCard>}

          <ProCard bordered size='small'>
            {warehouses.length > 1 && <ProFormSelect
              name={'whsCode'}
              width={'md'}
              rules={[{ required: true }]}
              label="First loading Warehouse"
              options={warehouses} />
            }
            <ProFormCheckbox name={'ownedTruckLoading'} >Own truck loading</ProFormCheckbox>
          </ProCard>

          {(loadingItem?.pickingItems?.length || 0) > 0 && (
            <ProCard bordered title="Picking Items" size="small" style={{ marginBlock: 5 }}>
              <ProTable
                columns={[
                  { title: 'Item Code', dataIndex: 'itemCode' },
                  { title: 'Description', dataIndex: 'itemDescription' },
                  { title: 'Wherehouse Code', dataIndex: 'whsCode' },
                  { title: 'UoM', dataIndex: 'uomCode' },
                  { title: 'Shipped Qty', dataIndex: 'qty', align: 'right', render: (_, r) => formatterQty.format(r.qty) },
                ]}
                size="small"
                dataSource={loadingItem?.pickingItems}
                options={false}
                search={false}
                pagination={false}
                rowKey={(item) => `${item.itemCode}-${item.qty}`}
                footer={(data) => (
                  <Row>
                    <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                      Total
                    </Col>
                    <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                      {formatterQty.format(data.map((it) => (it.qty || 0))?.reduce((p, c) => p + c, 0))}
                    </Col>
                  </Row>
                )}
              />
            </ProCard>
          )}

          {access.canAccessDeliveryMenuItem && (loadingItem?.deliveryNoteListItems?.length || 0) > 0 && (
            <ProCard bordered collapsible defaultCollapsed title="Delivery Note" size="small" style={{ marginBlock: 5 }}>
              <ProTable<DeliveryNoteListItem>
                columns={[
                  { title: 'Del.Doc Num', dataIndex: 'docNum' },
                  { title: 'Cust. Code', dataIndex: 'cardCode' },
                  { title: 'Cust. Name', dataIndex: 'cardName' },
                  { title: 'P. Term', dataIndex: 'paymentTerm' },
                  { title: 'Shipped To', dataIndex: 'shipToCode' },
                  { title: 'Quantity', dataIndex: 'qty', align: 'right', render: (_, r) => formatterQty.format(r.qty) },
                  { title: 'Invoice', dataIndex: 'invDocNum' },
                  { title: 'Inv.Amount', dataIndex: 'invAmount', align: 'right', render: (_, r) => formatter.format(r.invAmount) },
                ]}
                size="small"
                dataSource={loadingItem?.deliveryNoteListItems}
                options={false}
                search={false}
                pagination={false}
                rowKey={'docNum'}
              />
            </ProCard>
          )}
          {(itemDetail?.loadingInfo?.items.length || 0) > 0 && (
            <ProCard bordered size="small" style={{ marginTop: '5px' }}>
              <ProFormTextArea rules={[{ required: !!itemDetail }]} label="Remarks" name={'remarks'} />
            </ProCard>
          )}
        </ProForm>
      </Spin>
    </FormModalComp>
  );
};

export default PickingSlip;
