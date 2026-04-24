import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined } from '@ant-design/icons';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Card, Col, Row, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import moment, { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import {
  ActivitiesItem,
  Item,
  TransferRequest,
  TransferRequestCreate,
  TransferRequestItem,
  Warehouse,
  WarehouseAdvanceParams,
} from '../data';
import { TransferRequestServiceAPI, WarehouseServiceAPI } from '../service';
import SelectItemTab from './SelectItemTab';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ENABLE_FRONTEND_IIO_STATIC_MOCK } from '../../mockConfig';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props extends FormModalProps {
  data?: TransferRequest;
  onSave: (data: TransferRequestCreate) => void;
  actionType?: string;
  id?: string;
}

const TransferRequestModelForm: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<TransferRequestCreate>();
  const [state, setState] = useState(false);
  const [items, setItems] = useState<TransferRequestItem[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const requestActions = simpleRequestActions();
  const warehouseService = WarehouseServiceAPI(requestActions);
  const [warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const [getWarehouse, setGetWarehouse] = useState<Warehouse[]>([]);
  const actionRef = useRef<ActionType>();
  const [getTendency, setGetTendency] = useState('');
  const [getFromWarehouse, setGetFromWarehouse] = useState('');
  const [getToWarehouse, setGetToWarehouse] = useState('');
  const [itemTabVisible, setItemTabVisible] = useState(false);
  const [getqty, setGetQty] = useState<string>('');
  const [dueDate,setDueDate] = useState(moment().format('YYYY-MM-DD'))
  const [postingDate, setPostingDate] = useState(moment().format('YYYY-MM-DD'));
  const [getRemark, setGetRmark] = useState<string | undefined>(undefined);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<WarehouseAdvanceParams>({
    tendency: ENABLE_FRONTEND_IIO_STATIC_MOCK ? 'ALL' : 'NVC',
  });
  const [act, setAct] = useState<ActivitiesItem[]>([
    {
      activities_name: 'Start',
      action: 'Start Request',
    },
  ]);

  const buildTransferRequestItem = (item: Item): TransferRequestItem => ({
    childItem: item.childItem,
    item: item.itemCode,
    quantity: item.childItem
      ? (
          item.childItem.reduce((total, v) => total + parseFloat(v.quantity), 0) *
          parseFloat(getqty || '0')
        ).toString()
      : '0',
    remark: '',
    id: 0,
    itemId: item.id,
    item_code: item.itemCode,
    item_name: item.itemName,
    key: uniqueId().toString(),
    uom: item.inventoryUoM,
    received: '0',
    itemReceive: 0,
    is_receive: '',
    transfer_request: data?.id || '',
    supplier: '',
    oldtotal: '0',
  });

  // const initFormData = () => {

  //   form.setFieldsValue({
  //     items: items,
  //     business_unit: getTendency,
  //     transfer_type: data?.transfer_type || "PM/RM",
  //     item_count: items.length
  //   });
  // };

  useEffect(() => {
    setAct([
      {
        activities_name: 'Start',
        action: 'Start Request',
        remark: getRemark,
      },
    ]);
  }, [state === true, getRemark]);
  
  useEffect(() => {
    // props.open && initFormData();
    form.resetFields();
    setItems([]);
    setWarehouse([]);
    setGetRmark(undefined);
    setGetTendency('');
    setGetFromWarehouse('');
    setGetToWarehouse('');
    setGetQty('');
    setPostingDate(moment().format('YYYY-MM-DD'))
    setDueDate(moment().format('YYYY-MM-DD'))
    setAdvanceSearchParams({
      tendency: ENABLE_FRONTEND_IIO_STATIC_MOCK ? 'ALL' : 'NVC',
    });
    //   setAdvanceSearchParams((v: any) => ({ ...v, tendency: 'NVC' }));
    //   actionRef.current?.reloadAndRest?.();
    // } else if (access.canAccessOFLItem) {
    //   setAdvanceSearchParams((v: any) => ({ ...v, tendency: 'OFL' }));
    //   actionRef.current?.reloadAndRest?.();
    // } else if (access.canAccessOMMItem) {
    //   setAdvanceSearchParams((v: any) => ({ ...v, tendency: 'OMM' }));
    //   actionRef.current?.reloadAndRest?.();
    // } else if (access.canAccessItem) {
    //   setAdvanceSearchParams((v: any) => ({ ...v, tendency: 'ALL' }));
    //   actionRef.current?.reloadAndRest?.();
    // } else {
    //   setAdvanceSearchParams((v: any) => ({ ...v, tendency: 'none' }));
    //   actionRef.current?.reloadAndRest?.();
    // }
  }, [props.open]);

  useEffect(() => {
    setGetWarehouse(warehouse.filter((it) => it.whsCode !== getFromWarehouse));
    form.setFieldValue('business_unit', getTendency);
  }, [getFromWarehouse, getTendency, warehouse, form]);

  const fetchWarehouses = async (searchValue?: string, tendency = advanceSearchParams.tendency) => {
    const data = await warehouseService.page({
      criteria: { searchValue, advanceSearch: { tendency } },
      pagination: { pageSize: 100 },
    });

    return data.items;
  };


  return (
    <FormModalComp
      title="Inventory Inbound Request"
      {...props}
      // width={"400px"}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        if (items.map(v => v.quantity).some(quantity => parseFloat(quantity) === 0)) {
          message.error("Quantity can't be 0");
          return;
        }
        const entity = {
          ...dataForm,
          id: data?.id,
          items: items.map((v) => ({ ...v })),
          item_count: items.length,
          activities: act,
          taxDate: postingDate,
          postingDate:postingDate,
          docDueDate:dueDate
          // fromWarehouse: getFromWarehouse,
          // toWarehouse: getToWarehouse,
          // apiReferenceNo: '20240223-12ddbb1',
          // vendorCode: '',
          // vendorName: '',
          // productionOfficer: 'Test 00e7',
          // comments: getRemark ? getRemark : '',
          // transferRequestDetails: items.map((v) => ({
          //   ...v,
          //   fromWarehouse: getFromWarehouse,
          //   toWarehouse: getToWarehouse,
          //   remark: v.remark === null ? '' : v.remark === undefined ? '' : v.remark,
          // })),
        };

        // const act={
        //   ...dataForm,
        //   transfer_request: data?.id,
        //   activities_name:'Start',
        //   action:'Start Request',
        //   // remark:''
        // }
        onSave(entity);
        // console.log(entity)
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
        <Card size="small">
          <Row gutter={6}>
            <Col span={8}>
              <ProFormSelect
                options={[
                  {
                    value: 'PM/RM',
                    label: 'PM/RM',
                  },
                  {
                    value: 'FG',
                    label: 'FG',
                  },
                ]}
                initialValue="PM/RM"
                name="transfer_type"
                label="Type"
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                // options={[
                //   {
                //     value: 'Line 1',
                //     label: 'Line 1',
                //   },
                //   {
                //     value: 'Line 2',
                //     label: 'Line 2',
                //   },
                //   {
                //     value: 'Line 3',
                //     label: 'Line 3',
                //   },
                //   {
                //     value: 'Line 4',
                //     label: 'Line 4',
                //   },
                //   {
                //     value: 'Line 5',
                //     label: 'Line 5',
                //   },
                //   {
                //     value: 'Line 6',
                //     label: 'Line 6',
                //   },
                // ]}
                request={async () => {
                  const line = await TransferRequestServiceAPI(requestActions).get_line();
                  return line.map((obj) => ({
                    value: obj.prdname,
                    label: obj.prdname,
                  }));
                }}
                // initialValue="PM/RM"
                name="line"
                label="Line"
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                options={[
                  {
                    value: 'S1',
                    label: 'S1',
                  },
                  {
                    value: 'S2',
                    label: 'S2',
                  },
                ]}
                // initialValue="PM/RM"
                name="shift"
                label="Shift"
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                label="From Warehouse"
                name="from_warehouse"
                key={'from_warehouse'}
                rules={[{ required: true }]}
                showSearch
                debounceTime={500}
                request={async ({ keyWords }) => {
                  const data = await fetchWarehouses(keyWords);

                  return data.map((obj) => ({
                    value: obj.id,
                    label: `${obj.whsCode} (${obj.tendency})`,
                  }));
                }}
                fieldProps={{
                  popupMatchSelectWidth: 360,
                  onChange: async (e: number) => {
                    if (!e) {
                      setWarehouse([]);
                      setGetTendency('');
                      setGetFromWarehouse('');
                      setGetToWarehouse('');
                      form.setFieldValue('to_warehouse', undefined);
                      return;
                    }

                    const dataWarehouse = await fetchWarehouses(undefined, 'ALL');
                    setWarehouse(dataWarehouse);
                    setGetToWarehouse('');
                    form.setFieldValue('to_warehouse', undefined);

                    await warehouseService.detail(e).then((it) => {
                      setGetTendency(it.tendency);
                      setGetFromWarehouse(it.whsCode);
                      actionRef.current?.reloadAndRest?.();
                    });
                  },
                }}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                label="To Warehouse"
                name="to_warehouse"
                key={'to_warehouse'}
                rules={[{ required: true }]}
                showSearch
                debounceTime={500}
                options={getWarehouse.map((it) => ({
                  value: it.id,
                  label: `${it.whsCode} (${it.tendency})`,
                }))}
                fieldProps={{
                  popupMatchSelectWidth: 360,
                  onChange: async (e: number) => {
                    if (!e) {
                      setGetToWarehouse('');
                      return;
                    }

                    await warehouseService.detail(e).then((it) => {
                      setGetToWarehouse(it.whsCode);
                      actionRef.current?.reloadAndRest?.();
                    });
                  },
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormDatePicker
                initialValue={postingDate}
                rules={[
                  {
                    required: true,
                    message: 'Posting date is required',
                  },
                ]}
                label="Posting Date"
                name="postingDate"
                fieldProps={{
                  onChange: (_value: Dayjs | null, date: string) => {
                    setPostingDate(date);
                  },
                }}
              />
            </Col>
            {/* <Col span={4} style={{ display: 'none' }}>
              <ProFormDatePicker
                initialValue={moment()}
                rules={[
                  {
                    required: true,
                    // validator: (rules, value) => {
                    //   // if ((value as Moment).startOf('day').isBefore(moment().startOf('day'))) {
                    //   //   return Promise.reject('Request date cannot be back date.');
                    //   // } else {
                    //     return Promise.resolve();
                    //   // }
                    // },
                  },
                ]}
                label="Tax Date"
                name={'taxDate'}
              />
            </Col> */}
            <Col span={4}>
              <ProFormDatePicker
                initialValue={postingDate}
                rules={[
                  {
                    required: true,
                    message: 'Due date is required',
                  },
                  {
                    validator: async (_rule: unknown, value: Dayjs | null) => {
                      // Ensure due date is not before posting date
                      if (value && dayjs(value).startOf('day').isBefore(postingDate)) {
                        return Promise.reject('Due date cannot be before posting date.');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                label="Due Date"
                name="docDueDate"
                fieldProps={{
                  onChange: (_value: Dayjs | null, date: string) => {
                    setDueDate(date);
                  },
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormTextArea
                hasFeedback={false}
                label="Remark"
                name={'remark'}
                fieldProps={{
                  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const value: string = event.target.value;
                    setGetRmark(value);
                    setState(true);
                    // console.log(value)
                  },
                }}
              />
            </Col>
            <Col span={16} style={{ display: 'none' }}>
              <ProFormText
                style={{ display: 'none' }}
                hasFeedback={false}
                label="business_unit"
                name={'business_unit'}
              />
            </Col>
          </Row>
        </Card>
        <Card title="Items" size="small">
          <EditableProTable<TransferRequestItem>
            value={items}
            rowKey="key"
            size="small"
            editableFormRef={editableFormRef}
            editable={{
              type: 'multiple',
              editableKeys: items.map((it) => it.key),
              actionRender: (row) => [
                <Button
                  type="link"
                  key={row.key}
                  onClick={() => {
                    setItems((v) => v.filter((it) => it.key !== row.key));
                  }}
                  size="small"
                  icon={<DeleteOutlined />}
                />,
              ],
              onValuesChange: (_, recordList) => {
                setItems(recordList.map((it) => ({ ...it })));
              },
            }}
            recordCreatorProps={
              getTendency !== ''
                ? {
                  creatorButtonText: 'Add Item ',
                  onClick: () => {
                    setItemTabVisible(true);
                  },
                  record: () => ({} as TransferRequestItem),
                }
                : false
            }
            columns={[
              { title: 'No', width: 50, editable: false, render: (_, __, index) => index + 1 },
              // { title: 'Item', width: 300, editable: false, dataIndex: 'items' },
              {
                title: 'Item Code',
                width: 100,
                dataIndex: 'item_code',
                editable: false,
              },
              {
                title: 'Item Name',
                width: 200,
                dataIndex: 'item_name',
                editable: false,
              },
              {
                title: 'Quantity',
                valueType: 'text',
                dataIndex: 'quantity',
                formItemProps: { rules: [{ required: true }] },
                ellipsis: true,
              },
              {
                title: 'UoM',
                dataIndex: 'uom',
                editable: false,
              },
              {
                title: 'Remarks',
                valueType: 'textarea',
                dataIndex: 'remark',
                fieldProps: { rows: 1 },
                width: 200,
              },
              {
                valueType: 'option',
                width: 50,
                render: () => {
                  return null;
                },
              },
            ]}
          />
        </Card>
      </ProForm>
      {/* <SearchItemList
        width={1200}
        open={searchVisible}
        tendency={getTendency}
        onOpenChange={setSearcVisible}
        addedItems={items?.map((it) => it.itemId)}
        onAddItem={(item) => {
          const itemList = [
            ...items,
            {
              itemId: item.id,
              key: uniqueId().toString(),
              itemCode: item.itemCode,
              itemName: item.itemName,
              uom: item.inventoryUoM
            } as unknown as TransferRequestItem,
          ];

          setItems(itemList);
        }}
      /> */}

      <SelectItemTab
        open={itemTabVisible}
        onOpenChange={setItemTabVisible}
        add={items?.map((it) => it.itemId)}
        tenden={getTendency}
        // onAdd={(item) => {
        //   const itemList = [
        //     ...items,
        //     {
        //       itemId: item.id,
        //       key: uniqueId().toString(),
        //       itemCode: item.itemCode,
        //       itemName: item.itemName,
        //       uom: item.inventoryUoM
        //     } as unknown as TransferRequestItem,
        //   ];

        //   setItems(itemList);
        // }}

        qty={(e) => setGetQty(e)}
        onAdd={(itemList: Item[]) => {
          const updatedItems: TransferRequestItem[] = [
            ...items,
            ...itemList.map((item) => buildTransferRequestItem(item)),
          ];
          setItems(updatedItems);
        }}
      />
    </FormModalComp>
  );
};

export default TransferRequestModelForm;
