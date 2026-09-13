import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
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
import { Card, Col, Modal, Row, Typography, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import {
  ReceiveStatusChange,
  Transfer,
  TransferAdvanceParams,
  TransferCreate,
  TransferItem,
} from './data';
import { TransferServiceAPI } from './service';

interface Props extends FormModalProps {
  data?: Transfer;
  onSave: (data: TransferCreate, receive: ReceiveStatusChange) => void;
  actionType?: string;
  id?: string;
  close: () => void;
}

const ModelForm: React.FC<Props> = ({ onSave, data, close, ...props }) => {
  const [form] = useForm<TransferCreate>();
  const { Text } = Typography;
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [getToWarehouse, setGetToWarehouse] = useState<number[]>([]);
  const [getFromWarehouse, setGetFromWarehouse] = useState<number[]>([]);
  const [getTransfer, setGetTransfer] = useState<Transfer>();
  const requestActions = simpleRequestActions();
  const services = TransferServiceAPI(requestActions);
  const [updateStatus, setUpdateStatus] = useState('');
  const [gettotal, setGetTotal] = useState<{ code: string; total: number }>({
    code: '',
    total: 0,
  });
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferAdvanceParams>({
    transfer_type: 'ALL',
    business_unit: 'ALL',
  });
  const editableFormRef = useRef<EditableFormInstance>();
  const [items, setItems] = useState<TransferItem[]>([]);

  useEffect(() => {
    if (access.canAccessTransferWarehouseItem) {
      setAdvanceSearchParams((v) => ({ ...v, transfer_type: 'FG', business_unit: 'ALL' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessTransferProductionItem) {
      setAdvanceSearchParams((v) => ({ ...v, transfer_type: 'PM/RM', business_unit: 'ALL' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessAll) {
      setAdvanceSearchParams((v) => ({ ...v, transfer_type: 'ALL', business_unit: 'ALL' }));
      actionRef.current?.reloadAndRest?.();
    } else {
      setAdvanceSearchParams((v) => ({ ...v, transfer_type: 'none', business_unit: 'none' }));
      actionRef.current?.reloadAndRest?.();
    }
  }, []);

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setItems([]);
      setGetTransfer(undefined);
    }
  }, [props.open]);

  useEffect(() => {
    const updatedItems = getTransfer?.item.map((it) => {
      const oldtotal = gettotal[it.item_code] || 0;
      const received = it.itemReceive || 0;
      const quantity = parseFloat(it.quantity) || 0;
      const total = oldtotal + received;
      const itemReceive = 0;

      let is_receive;
      if (received == 0) {
        is_receive = '';
      } else {
        if (oldtotal + received == quantity) {
          is_receive = 'True';
        } else {
          is_receive = 'False';
        }
      }
      return { ...it, oldtotal, is_receive, total, itemReceive };
    });
    setItems(updatedItems);
  }, [getTransfer]);

  // useEffect(() => {
  //   let falseCount = 0;
  //   let trueCount = 0;
  //   let emptyStringCount = 0;
  //   const it = items?.map((i) => i.is_receive);
  //   it?.forEach((x) => {
  //     if (x == 'False') {
  //       falseCount++;
  //     } else if (x == '') {
  //       emptyStringCount++;
  //     } else if (x == 'True') {
  //       trueCount++;
  //     }
  //   });
  //   // console.log('False count:', falseCount);
  //   console.log(emptyStringCount)
  //   console.log(trueCount)
  //   console.log(it?.length)
  //   // console.log(emptyStringCount + trueCount === it?.length)
  //   console.log(emptyStringCount === items?.length && trueCount > 0)
  //   if (emptyStringCount === items?.length && trueCount > 0) {
  //     setUpdateStatus('completed');
  //   } else if (trueCount === items?.length) {
  //     setUpdateStatus('completed');
  //   } else {
  //     setUpdateStatus('pending');
  //   }
  // }, [items]);

  useEffect(() => {
    const allReceived = items?.every(item => {
      const Quantity = parseFloat(item?.quantity);
      
      const totalQuantity = parseFloat(item?.oldtotal);
      const receivedQuantity = parseFloat(String(item?.itemReceive)) || 0;
      console.log(Quantity)
      console.log(totalQuantity)
      console.log(receivedQuantity)
      return ((receivedQuantity+ totalQuantity)=== Quantity);
    });

    if (allReceived) {
      setUpdateStatus('completed');
    } else {
      setUpdateStatus('pending');
    }
  }, [items]);
  

  const onCancelTransfer = () => {
    Modal.confirm({
      title: 'Cancel Transfer / Close Transfer',
      content: 'are you sure',
      onOk: async () => {
        try {
          const dataForm = await form.validateFields();
          const closedoc = {
            docEntry: getTransfer?.sapDocEntry,
            ...dataForm,
            id: getTransfer?.id,
            items: items.map((v) => ({ ...v })),
            transfer_type: getTransfer?.transfer_type,
            business_unit: getTransfer?.business_unit,
            transfer_request: getTransfer?.id,
            posting_date: getTransfer?.posting_date,
            due_date: getTransfer?.due_date,
            from_warehouse: getFromWarehouse.toLocaleString(),
            to_warehouse: getToWarehouse.toLocaleString(),
            line: getTransfer?.line,
            shift: getTransfer?.shift,
            status: 'completed',
            statusChange: 'received',
            state: 'completed',
          };
          await services.close_request(closedoc);
          close();
          message.success('Success');
          actionRef.current?.reloadAndRest?.();
        } catch (error) {
          console.error('An error occurred:', error);
          message.error('Error');
        }
      },
    });
  };

  return (
    <FormModalComp
      title="Inventory Transfer"
      {...props}
      // width={"400px"}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const isValid = items.every((item) => item.oldtotal + item.itemReceive <= item.quantity);
        if (!isValid) {
          message.error('Invalid Data');
          return;
        }
        const entity = {
          ...dataForm,
          id: data?.id,
          items: items.map((v) => ({ ...v })),
          transfer_type: getTransfer?.transfer_type,
          business_unit: getTransfer?.business_unit,
          transfer_request: getTransfer?.id,
          posting_date: getTransfer?.posting_date,
          due_date: getTransfer?.due_date,
          from_warehouse: getFromWarehouse.toLocaleString(),
          to_warehouse: getToWarehouse.toLocaleString(),
          line: getTransfer?.line,
          shift: getTransfer?.shift,
          status: updateStatus,
        };
        const res = {
          ...dataForm,
          transfer_request: getTransfer?.id,
        };
        onSave(entity, res);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <ProForm submitter={false} form={form}>
        <Card size="small">
          <Row gutter={6}>
            <Col span={8}>
              <ProFormSelect
                labelAlign="left"
                label="Request ID"
                name="id"
                rules={[{ required: true }]}
                showSearch={true}
                debounceTime={500}
                initialValue={data?.id}
                request={async ({ keyWords }) => {
                  const data = await services.pageFG({
                    criteria: { searchValue: keyWords, advanceSearch: advanceSearchParams },
                    pagination: { pageSize: 10 },
                  });

                  return data.items.map((obj) => ({
                    value: obj.id,
                    label: `PDR-${String(obj.id).padStart(6, '0')}`,
                  }));
                }}
                fieldProps={{
                  onChange: async (e: number) => {
                    const transfer = await services.detail(e);
                    const itemcode = transfer.item.map((it) => it.item_code);
                    for (let i = 0; i < itemcode.length; i++) {
                      const receive = await services.get_receive({
                        transfer_request: transfer.id,
                        item_code: itemcode[i],
                      });
                      const val = receive.map((v) => parseFloat(v.received));

                      let total = 0;
                      for (let r = 0; r < val.length; r++) {
                        total += val[r];
                      }
                      setGetTotal((prevState) => ({
                        ...prevState,
                        [itemcode[i]]: total,
                      }));
                    }
                    setGetTransfer(transfer);
                    setGetToWarehouse(transfer.to_warehouse.map((v) => v.id));
                    setGetFromWarehouse(transfer.from_warehouse.map((v) => v.id));
                    // setGetTransfer(transfer)
                  },
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                disabled
                hasFeedback={false}
                label="Type"
                name={'transfer_type'}
                fieldProps={{
                  value: getTransfer?.transfer_type,
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormText
                disabled
                hasFeedback={false}
                label="Line"
                name={'line'}
                fieldProps={{
                  value: getTransfer?.line,
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormText
                disabled
                hasFeedback={false}
                label="Shift"
                name={'shift'}
                fieldProps={{
                  value: getTransfer?.shift,
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormText
                disabled
                hasFeedback={false}
                label="From Warehouse"
                name={'from_warehouse'}
                fieldProps={{
                  value: getTransfer?.from_warehouse.map((it) => it.whsCode),
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormText
                disabled
                hasFeedback={false}
                label="To Warehouse"
                name={'to_warehouse'}
                fieldProps={{
                  value: getTransfer?.to_warehouse.map((it) => it.whsCode),
                }}
              />
            </Col>

            <Col span={4}>
              <ProFormDatePicker
                disabled
                hasFeedback={false}
                label="Posting Date"
                name={'posting_date'}
                fieldProps={{
                  value: getTransfer?.posting_date as Dayjs,
                }}
              />
            </Col>
            <Col span={4}>
              <ProFormDatePicker
                disabled
                hasFeedback={false}
                label="Due Date"
                name={'due_date'}
                fieldProps={{
                  value: getTransfer?.due_date as Dayjs,
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormTextArea
                disabled
                hasFeedback={false}
                label="Remark"
                name={'remark'}
                fieldProps={{
                  value: getTransfer?.remark === null ? '-' : getTransfer?.remark,
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card title="Items" size="small">
          <EditableProTable<TransferItem>
            size="small"
            search={false}
            rowKey="id"
            editable={{
              type: 'multiple',
              editableKeys: getTransfer?.item.map((it) => it.id),
              onValuesChange: async (_, recordList) => {
                const updatedItems = recordList.map((it) => {
                  const oldtotal = gettotal[it.item_code] || 0;
                  const received = it.itemReceive || 0;
                  const quantity = parseFloat(it.quantity) || 0;
                  const total = oldtotal + received;

                  let is_receive;
                  if (received == 0) {
                    is_receive = '';
                  } else {
                    if (oldtotal + received == quantity) {
                      is_receive = 'True';
                    } else {
                      is_receive = 'False';
                    }
                  }
                  return { ...it, oldtotal, is_receive, total };
                });
                setItems(updatedItems);
                // const trueIsReceiveCount = updatedItems.filter(item => item.is_receive === 'True').length;
                // const IsReceiveNullCount = updatedItems.filter(item => item.is_receive === '').length;
                // console.log(updatedItems.length)
                // console.log(trueIsReceiveCount)
                // console.log(IsReceiveNullCount)
                // if (updatedItems.length == trueIsReceiveCount+IsReceiveNullCount) {
                //   setUpdateStatus('completed')
                // } else {
                //   setUpdateStatus('panding')
                // }
              },
            }}
            editableFormRef={editableFormRef}
            value={getTransfer?.item}
            recordCreatorProps={false}
            pagination={false}
            columns={[
              { title: 'No', render: (_, __, index) => index + 1, editable: false, width: 70 },
              { title: 'Item Code', dataIndex: 'item_code', editable: false },
              { title: 'Item Name', dataIndex: 'item_name', editable: false },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
                render: (_, r) => [r.quantity].join('/'),
                editable: false,
              },
              {
                title: 'Total',
                dataIndex: 'total',
                render: (_, r) => gettotal[r.item_code] || 0,
                editable: false,
              },
              { title: 'Received', valueType: 'digit', width: 135, dataIndex: 'itemReceive' },
              { title: 'Supplier', dataIndex: 'supplier', editable: false },
              { title: 'UoM', dataIndex: 'uom', editable: false },
              { title: 'Remark', dataIndex: 'remark', editable: false },
            ]}
          />
          <Col style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Text
              type="danger"
              onClick={onCancelTransfer}
              style={{
                cursor: 'pointer',
                color: 'red',
                transition: 'color 0.3s ease',
              }}
            >
              Cancel Transfer / Close Transfer
            </Text>
          </Col>
        </Card>
      </ProForm>
    </FormModalComp>
  );
};

export default ModelForm;
