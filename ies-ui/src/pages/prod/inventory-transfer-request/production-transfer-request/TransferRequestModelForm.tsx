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
import { useAccess } from '@umijs/max';
import { Button, Card, Col, Row } from 'antd';
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
import { WarehouseServiceAPI } from '../service';
import SelectItemTab from './SelectItemTab';

interface Props extends FormModalProps {
  data?: TransferRequest;
  onSave: (data: TransferRequestCreate) => void;
  actionType?: string;
  id?: string;
}

const TransferRequestModelForm: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<TransferRequestCreate>();
  const access = useAccess();
  const [state, setState] = useState(false);
  const [items, setItems] = useState<TransferRequestItem[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const requestActions = simpleRequestActions();
  const [warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const [getWarehouse, setGetWarehouse] = useState<Warehouse[]>([]);
  const actionRef = useRef<ActionType>();
  const [getTendency, setGetTendency] = useState('');
  const [getFromWarehouse, setGetFromWarehouse] = useState('');
  const [getToWarehouse, setGetToWarehouse] = useState('');
  const [itemTabVisible, setItemTabVisible] = useState(false);
  const [getqty, setGetQty] = useState<string>('');
  const [getRemark, setGetRmark] = useState<string | undefined>(undefined);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<WarehouseAdvanceParams>({
    tendency: 'NVC',
  });
  const [act, setAct] = useState<ActivitiesItem[]>([
    {
      activities_name: 'Start',
      action: 'Start Request',
    },
  ]);

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
    setGetQty('');
    // if (access.canAccessNVCItem) {
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
    setGetWarehouse(warehouse.filter((it) => it.tendency === getTendency));
    form.setFieldValue('business_unit', getTendency);
  }, [getTendency, warehouse]);

  return (
    <FormModalComp
      title="Inventory Transfer Request"
      {...props}
      // width={"400px"}
      onSubmit={async () => {
        const dataForm = await form.validateFields();

        const entity = {
          ...dataForm,
          id: data?.id,
          items: items.map((v) => ({ ...v })),
          item_count: items.length,
          activities: act,
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
        console.log(entity);
        // const act={
        //   ...dataForm,
        //   transfer_request: data?.id,
        //   activities_name:'Start',
        //   action:'Start Request',
        //   // remark:''
        // }
        onSave(entity);
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
                options={[
                  {
                    value: 'Line 1',
                    label: 'Line 1',
                  },
                  {
                    value: 'Line 2',
                    label: 'Line 2',
                  },
                  {
                    value: 'Line 3',
                    label: 'Line 3',
                  },
                  {
                    value: 'Line 4',
                    label: 'Line 4',
                  },
                  {
                    value: 'Line 5',
                    label: 'Line 5',
                  },
                  {
                    value: 'Line 6',
                    label: 'Line 6',
                  },
                ]}
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
            <Col span={4}>
              <ProFormSelect
                label="From Warehouse"
                name="from_warehouse"
                key={'from_warehouse'}
                rules={[{ required: true }]}
                showSearch
                debounceTime={500}
                request={async ({ keyWords }) => {
                  const data = await WarehouseServiceAPI(requestActions).page({
                    criteria: { searchValue: keyWords, advanceSearch: advanceSearchParams },
                    pagination: { pageSize: 100 },
                  });

                  return data.items.map((obj) => ({
                    value: obj.id,
                    label: `${obj.whsCode}`,
                  }));
                }}
                fieldProps={{
                  onChange: async (e: number) => {
                    const data_warehouse = await WarehouseServiceAPI(requestActions).page({
                      criteria: { advanceSearch: advanceSearchParams },
                      pagination: { pageSize: 100 },
                    });
                    setWarehouse(data_warehouse.items);
                    await WarehouseServiceAPI(requestActions)
                      .detail(e)
                      .then((it) => {
                        setGetTendency(it.tendency);
                        setGetFromWarehouse(it.whsCode);
                        // setAdvanceSearchParams((v) => ({ ...v, tendency: it.tendency }))
                        actionRef.current?.reloadAndRest?.();
                      });
                  },
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormSelect
                label="To Warehouse"
                name="to_warehouse"
                key={'to_warehouse'}
                rules={[{ required: true }]}
                showSearch
                debounceTime={500}
                options={getWarehouse.map((it) => ({
                  value: it.id,
                  label: `${it.whsCode}`,
                }))}
                fieldProps={{
                  onChange: async (e: number) => {
                    await WarehouseServiceAPI(requestActions)
                      .detail(e)
                      .then((it) => {
                        setGetToWarehouse(it.whsCode);
                        // setAdvanceSearchParams((v) => ({ ...v, tendency: it.tendency }))
                        actionRef.current?.reloadAndRest?.();
                      });
                  },
                }}
              />
            </Col>
            <Col span={4}>
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
                label="Posting Date"
                name={'postingDate'}
              />
            </Col>
            <Col span={4} style={{ display: 'none' }}>
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
            </Col>
            <Col span={4}>
              <ProFormDatePicker
                rules={[
                  {
                    required: true,
                    validator: (rules, value) => {
                      if ((value as Moment).startOf('day').isBefore(moment().startOf('day'))) {
                        return Promise.reject('Due date cannot be back date.');
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                label="Due Date"
                name={'docDueDate'}
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
                dataIndex: 'itemCode',
                editable: false,
              },
              {
                title: 'Item Name',
                width: 200,
                dataIndex: 'itemName',
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
          const updatedItems = [
            ...items,
            ...itemList.map((item) => ({
              itemId: item.id,
              key: uniqueId().toString(),
              itemCode: item.itemCode,
              itemName: item.itemName,
              uom: item.inventoryUoM,
              // quantity: item.childItem.map(v => v.quantity) || 0
              quantity: item.childItem
                ? item.childItem.reduce((total, v) => total + parseFloat(v.quantity), 0) *
                  parseFloat(getqty)
                : 0,
            })),
          ];
          setItems(updatedItems);
        }}
      />
    </FormModalComp>
  );
};

export default TransferRequestModelForm;
