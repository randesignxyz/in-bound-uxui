import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { formatDate } from '@/pages/utils';
import { LookupDataItem } from '@/services/data';
import {
  SalesTeamWorkLess,
  SaveStockControl,
  StockControlItemLess,
  StockDetailItemLess,
  StockDetailLess,
  VehicleLess,
} from '@/services/sale/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ProForm, { ProFormDateTimePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, Card, Col, message, Row, Space, Tabs, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import ItemEntryFormModal from './ItemEntryFormModal';
import { Model } from './model';
import VehicleFormModal from './VehicleFormModal';

export interface StockControlFormModalProps extends FormModalProps {
  data?: {
    selectedSE?: string;
    typeId?: number;
    typeProductItems?: { type: number; value: LookupDataItem[] }[];
    listLastStockControl?: StockDetailLess[];
    isBeginningManual?: boolean;
    // seCode?: string;
    stockCategory?: LookupDataItem[];
    seList?: SalesTeamWorkLess[];
  };

  isLoading: boolean;
  actionHandlers?: {
    onSave?: (data: SaveStockControl, isView: boolean) => void;
    onLoadInitData?: () => void;
    onFetchLastStockControl?: (empNo: string) => void;
    onClearLastStockControl?: () => void;
    onSaveVehicle?: (item: VehicleLess) => void;
    onSearchVehicle?: (text: string) => void;
    onCheckInitializeMenu?: (empNo: string) => void;
  };
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

const StockControlFormModal: React.FC<StockControlFormModalProps> = ({
  actionHandlers,
  data,
  isLoading,
  ...rest
}) => {
  const [dataSource, setDataSource] = useState<StockControlItemLess[]>([]);
  const [beginningDataSource, setBeginningDataSource] = useState<StockControlItemLess[]>([]);

  const [addNewModal, setAddNewModal] = useSetState<{
    visible?: boolean;
    isFromRequest?: boolean;
  }>({});
  const [vehicleModal, setVehicleModal] = useSetState<{ visible?: boolean }>({});

  // const [salesperson, setSalesperson] = useSetState<{ isVanSale?: boolean }>();
  const [form] = useForm<SaveStockControl>();

  const actionRef = useRef<ActionType>();
  const actionRefBeginning = useRef<ActionType>();
  const { actions } = Model();

  const onValuesChange = (changedValues: any, values: any) => {
    const { empNo, isVanSale } = values;
    if ('empNo' in changedValues) {
      // actionHandlers?.onFetchLastStockControl && actionHandlers.onFetchLastStockControl(empNo);
      actionHandlers?.onCheckInitializeMenu && actionHandlers.onCheckInitializeMenu(empNo);
      form.setFieldsValue({ receivedBy: empNo });
    }
    if (empNo === undefined) {
      setBeginningDataSource([]);
      actionHandlers?.onClearLastStockControl && actionHandlers.onClearLastStockControl();
    }
    // if ('isVanSale' in changedValues) {
    //   setSalesperson({ isVanSale: isVanSale });
    //   form.setFieldsValue({ amount: undefined });
    // }
  };

  const onSubmitActionHandler = async (isView: boolean) => {
    try {
      // if (!salesperson.isVanSale && dataSource.length === 0) {
      //   message.error('No line items');
      //   return;
      // }
      const dataForm = await form.validateFields();

      const importNoItemReqeust =
        dataSource.length === 0 &&
        data?.listLastStockControl &&
        data.listLastStockControl.length > 0;
      let items: StockControlItemLess[] = [];
      if (importNoItemReqeust) {
        items =
          data.listLastStockControl?.flatMap((it) => {
            return it.items
              .filter((it1) => (it1.actualQty || 0) > 0)
              .flatMap((it1, index) => {
                const item: StockControlItemLess = {
                  itemId: it1.itemId,
                  itemName: it1.itemName,
                  itemQuantity: 0,
                  itemType: it.typeId,
                  type: '',
                  expiredDate: it1.expiredDate,
                  remark: '',
                  index: index,
                };
                return item;
              });
          }) || [];
      }

      const stockControl: SaveStockControl = {
        empNo: data?.selectedSE ? data?.selectedSE : dataForm.empNo,
        amount: dataForm.amount === undefined ? 0.0 : dataForm.amount,
        items: importNoItemReqeust ? items : dataSource,
        isVanSale: true,
        serialNumber: dataForm.serialNumber,
        plateNumber: dataForm.plateNumber,
        requestedDate: dataForm.requestedDate,
        receivedBy: dataForm.receivedBy,
        approvedBy: dataForm.approvedBy,
        beginningItems: beginningDataSource,
        approvedDate: dataForm.approvedDate,
      };

      actionHandlers?.onSave?.(stockControl, isView);
    } catch (errors) {
      message.error('Invalid data.');
    }
  };

  useEffect(() => {
    if (!rest.open) {
      actionHandlers?.onClearLastStockControl && actionHandlers.onClearLastStockControl();
      return;
    }
    // actionHandlers?.onLoadInitData?.();
    setDataSource([]);
    setBeginningDataSource([]);
    // setSalesperson({ isVanSale: true });
    form.resetFields();
    form.setFieldsValue({
      empNo: data?.selectedSE,
      approvedDate: moment(),
      requestedDate: moment(),
    });
    return () => {
      form.resetFields();
    };
  }, [rest.open]);

  return (
    <FormModalComp
      {...rest}
      width="850px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        !data?.selectedSE && (
          <Button
            key="reset"
            onClick={() => {
              form.resetFields();
              setDataSource([]);
              // setSalesperson({ isVanSale: false });
            }}
          >
            Reset
          </Button>
        ),
        <Button
          loading={rest.confirmLoading}
          disabled={
            rest.disabled ||
            (beginningDataSource.length <= 0 &&
              dataSource.length <= 0 &&
              (data?.listLastStockControl?.length || 0) <= 0)
          }
          key="submit"
          type="primary"
          onClick={async () => await onSubmitActionHandler(false)}
        >
          Submit
        </Button>,
        !data?.selectedSE && (
          <Button
            loading={rest.confirmLoading}
            disabled={
              rest.disabled ||
              (beginningDataSource.length <= 0 &&
                dataSource.length <= 0 &&
                (data?.listLastStockControl?.length || 0) <= 0)
            }
            key="submitView"
            type="primary"
            onClick={async () => await onSubmitActionHandler(true)}
          >
            Submit & Detail
          </Button>
        ),
      ]}
    >
      {/* {!data?.typeId && ( */}
      <Card size="small" title="General Info" style={{ marginBottom: 10 }}>
        <ProForm
          {...layout}
          form={form}
          submitter={false}
          autoFocusFirstInput
          layout="horizontal"
          onValuesChange={onValuesChange}
        >
          <Row gutter={50}>
            <Col flex="1">
              <ProFormSelect
                name="empNo"
                disabled={data?.selectedSE ? true : false}
                rules={[{ required: true }]}
                label="Sales Executive"
                showSearch
                fieldProps={{
                  optionLabelProp: 'label',
                  // dropdownMatchSelectWidth: 400,
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data?.seList
                  ?.filter((it) => it.isRequester)
                  .map((it) => {
                    return {
                      value: it.salespersonCode,
                      label: `${it.salespersonCode} - ${it.salespersonName}`,
                    };
                  })}
              />
              {!data?.selectedSE && (
                <>
                  <ProFormSelect
                    rules={[{ required: true }]}
                    name="plateNumber"
                    label="Plate Number"
                    showSearch
                    debounceTime={300}
                    addonAfter={
                      <Tooltip placement="topLeft" title="Add Vehicle">
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          type="primary"
                          onClick={() => {
                            setVehicleModal({ visible: true });
                          }}
                        />
                      </Tooltip>
                    }
                    request={async ({ keyWords }) => {
                      //setPhoneNumber(keyWords);
                      const result =
                        keyWords &&
                        keyWords.length > 1 &&
                        (await actions.searchVehicleByPlateNumber(keyWords));
                      return result.map((it: { plateNumber: string }) => ({
                        label: it.plateNumber,
                        value: it.plateNumber,
                      }));
                    }}
                    placeholder="Please select plate number"
                  />
                  <ProFormSelect
                    name="receivedBy"
                    disabled={data?.selectedSE ? true : false}
                    rules={[{ required: true }]}
                    label="Received By"
                    showSearch
                    fieldProps={{
                      optionLabelProp: 'label',
                      //dropdownMatchSelectWidth: 400,
                      filterOption: (input, option) =>
                        (option?.label?.toString() || '')
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0,
                    }}
                    options={data?.seList
                      ?.filter((it) => !it.isApprover)
                      .map((it) => {
                        return {
                          value: it.salespersonCode,
                          label: `${it.salespersonCode} - ${it.salespersonName}`,
                        };
                      })}
                  />
                  {/*<ProFormText
                      help={<span />}
                      label="Plate Number"
                      name="plateNumber"
                      rules={[{ required: true }]}
                      // width="md"
                    />
                    <ProFormCheckbox
                      disabled={data?.selectedSE ? true : false}
                      label="Van Sale"
                      name="isVanSale"
                      
                    /> */}
                </>
              )}
            </Col>
            <Col flex="1">
              {!data?.selectedSE && (
                <>
                  <ProFormText
                    label="Serial Number"
                    name="serialNumber"
                    // rules={[{ required: true }]}
                    // width="md"
                  />
                  <ProFormDateTimePicker
                    label="Request Date"
                    name="requestedDate"
                    rules={[{ required: true }]}
                  />
                  <ProFormSelect
                    name="approvedBy"
                    disabled={data?.selectedSE ? true : false}
                    rules={[{ required: true }]}
                    label="Approve By"
                    showSearch
                    fieldProps={{
                      optionLabelProp: 'label',
                      // dropdownMatchSelectWidth: 400,
                      filterOption: (input, option) =>
                        (option?.label?.toString() || '')
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0,
                    }}
                    options={data?.seList
                      ?.filter((it) => it.isApprover)
                      .map((it) => {
                        return {
                          value: it.salespersonCode,
                          label: `${it.salespersonCode} - ${it.salespersonName}`,
                        };
                      })}
                  />
                  <ProFormDateTimePicker
                    label="Approved Date"
                    name="approvedDate"
                    rules={[{ required: true }]}
                  />
                  {/* <ProFormMoney
                      customSymbol="$"
                      help={<span />}
                      label="Amount"
                      name="amount"
                      disabled={salesperson.isVanSale}
                      rules={[{ required: !salesperson.isVanSale }]}
                      locale="en-US"
                      min={0}
                    /> */}
                </>
              )}
            </Col>
          </Row>
        </ProForm>
      </Card>
      {/* )} */}

      {!data?.isBeginningManual &&
        data?.listLastStockControl &&
        data?.listLastStockControl.length > 0 && (
          <Card size="small" style={{ marginBottom: 10 }} title="Begining Stock">
            <Tabs>
              {data.listLastStockControl.map((it) => {
                return (
                  <Tabs.TabPane
                    tab={
                      <Space size={0}>
                        {/* <ScheduleOutlined /> <span>Transaction</span> */}
                        {/*<DashboardOutlined />*/}
                        <span>
                          {it.typeId === 131
                            ? 'Vital'
                            : it.typeId === 132
                            ? 'Mee Chiet'
                            : 'Machandise'}
                        </span>
                      </Space>
                    }
                    key="dashboardTabItem"
                  >
                    <ProTable<StockDetailItemLess>
                      size="small"
                      dataSource={it.items.filter((it) => (it.actualQty || 0) > 0)}
                      rowKey="id"
                      pagination={false}
                      bordered={false}
                      search={false}
                      options={{
                        setting: false,
                        density: false,
                        fullScreen: false,
                        reload: false,
                      }}
                      columns={[
                        { title: 'Batch #', dataIndex: 'batchNo' },
                        { title: 'Code', dataIndex: 'itemCode' },
                        { title: 'Description', dataIndex: 'itemName' },
                        { title: 'Quantity', dataIndex: 'actualQty', align: 'right' },
                        { title: 'UOM', dataIndex: 'uom' },
                        { title: 'Expired Date', render: (_, r) => formatDate(r.expiredDate) },
                      ]}
                    />
                  </Tabs.TabPane>
                );
              })}
            </Tabs>
          </Card>
        )}

      {data?.isBeginningManual && (
        <Card size="small" style={{ marginBottom: 10 }}>
          <ProTable<StockControlItemLess>
            headerTitle={'Initialize Stock'}
            actionRef={actionRefBeginning}
            size="small"
            rowKey="id"
            pagination={false}
            bordered={false}
            search={false}
            dataSource={beginningDataSource}
            toolBarRender={() => [
              <Button
                type="primary"
                size="small"
                disabled={isLoading}
                onClick={() => setAddNewModal({ visible: true, isFromRequest: false })}
                icon={<PlusOutlined />}
              />,
            ]}
            options={{
              setting: false,
              density: false,
              fullScreen: false,
              reload: false,
            }}
            columns={[
              {
                title: '#',
                dataIndex: 'index',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.index! - b.index!,
                key: 'itemId',
              },
              { title: 'Batch #', dataIndex: 'batchNo' },
              { title: 'Description', dataIndex: 'itemName' },
              { title: 'Type', dataIndex: 'type' },
              { title: 'Quantity', align: 'right', dataIndex: 'itemQuantity' },
              { title: 'Remark', dataIndex: 'remark' },
              {
                title: 'Expired Date',
                render: (_, r) => {
                  return formatDate(r.expiredDate);
                },
              },
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
                          const removeWithKey = `${data.itemId}-${data.batchNo}`;
                          let copyArray = beginningDataSource
                            .copyWithin(-1, -1)
                            .filter((it) => `${it.itemId}-${it.batchNo}` !== removeWithKey);
                          copyArray.forEach((it, index) => {
                            it.index = index + 1;
                          });
                          setBeginningDataSource(copyArray);
                          actionRefBeginning.current?.reload();
                        }}
                      />
                    </Space>
                  );
                },
              },
            ]}
          />
        </Card>
      )}

      <Card size="small" title={data?.typeId ? '' : 'Request Items'}>
        <ProTable<StockControlItemLess>
          headerTitle="Line Items"
          size="small"
          sortDirections={['ascend']}
          showSorterTooltip={false}
          rowKey="id"
          pagination={false}
          bordered={false}
          search={false}
          dataSource={dataSource}
          actionRef={actionRef}
          toolBarRender={() => [
            <Button
              type="primary"
              size="small"
              disabled={isLoading}
              onClick={() => setAddNewModal({ visible: true, isFromRequest: true })}
              icon={<PlusOutlined />}
            />,
          ]}
          options={{
            setting: false,
            density: false,
            fullScreen: false,
            reload: false,
          }}
          columns={[
            {
              title: '#',
              dataIndex: 'index',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => a.index! - b.index!,
              key: 'itemId',
            },
            { title: 'Batch #', dataIndex: 'batchNo' },
            { title: 'Description', dataIndex: 'itemName' },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Quantity', align: 'right', dataIndex: 'itemQuantity' },
            { title: 'Remark', dataIndex: 'remark' },
            {
              title: 'Expired Date',
              render: (_, r) => {
                return formatDate(r.expiredDate);
              },
            },
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
                        const removeWithKey = `${data.itemId}-${data.batchNo}`;
                        let copyArray = dataSource
                          .copyWithin(-1, -1)
                          .filter((it) => `${it.itemId}-${it.batchNo}` !== removeWithKey);
                        copyArray.forEach((it, index) => {
                          it.index = index + 1;
                        });
                        console.log(copyArray);
                        setDataSource(copyArray);
                        actionRef.current?.reload();
                      }}
                    />
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>
      <VehicleFormModal
        title="Add New Vehicle"
        open={vehicleModal.visible}
        onCancel={() => setVehicleModal({ visible: false })}
        loading={isLoading}
        actionHandlers={{
          onSave: (item: VehicleLess) => {
            if (actionHandlers && actionHandlers.onSaveVehicle) {
              actionHandlers.onSaveVehicle(item);
              form.setFieldsValue({ plateNumber: item.plateNumber });
            }
            setVehicleModal({ visible: false });
          },
        }}
      />

      <ItemEntryFormModal
        open={addNewModal.visible}
        onCancel={() => setAddNewModal({ visible: false })}
        loading={isLoading}
        data={{
          typeId: data?.typeId,
          seq:
            (addNewModal.isFromRequest ? dataSource.length || 0 : beginningDataSource.length) + 1,
          types: data?.stockCategory,
          typeProductItems: data?.typeProductItems,
          keyStr: addNewModal.isFromRequest ? 'stock-request' : 'stock-init',
        }}
        actionHandlers={{
          onAddItem: (item) => {
            console.log(item);
            const existing = addNewModal.isFromRequest
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
            console.log(existing);
            if (existing) {
              let copyArray = addNewModal.isFromRequest
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
                  it.itemQuantity += item.itemQuantity;
              });
              addNewModal.isFromRequest
                ? setDataSource(copyArray)
                : setBeginningDataSource(copyArray);
            } else {
              addNewModal.isFromRequest
                ? setDataSource([...dataSource, item])
                : setBeginningDataSource([...beginningDataSource, item]);
            }
            setAddNewModal({ visible: false, isFromRequest: !addNewModal.isFromRequest });
          },
        }}
        // actionHandlers={{
        //   onAddItem: (item) => {
        //
        //   },
        // }}
      />
    </FormModalComp>
  );
};

export default StockControlFormModal;
