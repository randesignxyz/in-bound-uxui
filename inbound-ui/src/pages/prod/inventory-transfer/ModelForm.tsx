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
  ProTable,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Card, Checkbox, Col, Modal, Row, Typography, message } from 'antd';
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
import { TransferRequestServiceAPI } from '../inventory-transfer-request/service';
import { ProvidedList } from '../inventory-transfer-request/data';
import TransferItemList from './TransferItemList';

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
  const [providedStatus, setProvidedStatus] = useState('');
  const [providedList, setProvidedList] = useState<ProvidedList[]>([])
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferAdvanceParams>({
    transfer_type: 'ALL',
    business_unit: 'ALL',
  });
  const editableFormRef = useRef<EditableFormInstance>();
  const [items, setItems] = useState<TransferItem[]>([]);

  const [transferItemListOpen, setTransferItemListOpen] = useState<{ visible: boolean, provided: string, status?: string }>({ visible: false, provided: '' });
  const [providedId, setProvidedId] = useState('')
  const [gettotal, setGetTotal] = useState<{ code: string; total: number }>({
    code: '',
    total: 0,
  });

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
      setProvidedList([])
      setGetTransfer(undefined);
    }
  }, [props.open]);

  useEffect(() => {
    const updatedItems = getTransfer?.item.map((i) => {
      const total = gettotal[i.item_code] || 0

      return { ...i, total }
    })
    setItems(updatedItems)
  }, [gettotal]);


  const onCancelTransfer = () => {
    console.log(items)
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

  const onSaveTransfer = (itm: any) => {
    Modal.confirm({
      title: 'Save Transfer record',
      content: 'are you sure',
      onOk: async () => {
        try {
          const updatedItems = itm?.map((it: any) => {
            let itemReceive = it.received
            let is_receive;
            const oldtotal = gettotal[it.item_code] || 0;
            const total = parseFloat(oldtotal) + parseFloat(it.received);
            if (parseFloat(it.received) == 0) {
              is_receive = '';
            } else {
              if (parseFloat(oldtotal) + parseFloat(itemReceive) == parseFloat(it.quantity)) {
                is_receive = 'True';
              } else {
                is_receive = 'False';
              }
            }
            return { ...it, itemReceive, is_receive, total, oldtotal };
          });
          const allReceived = itm?.every((item: any) => {
            const Quantity = parseFloat(item?.quantity);
            const receivedQuantity = parseFloat(String(item?.itemReceive)) || 0;
            return ((gettotal[item.item_code] + receivedQuantity) === Quantity);
          });
          let state
          if (allReceived) {
            state = 'completed';
          } else {
            state = 'pending';
          }

          const dataForm = await form.validateFields();
          const entity = {
            ...dataForm,
            id: getTransfer?.id,
            items: updatedItems.map((v: any) => ({ ...v })),
            transfer_type: getTransfer?.transfer_type,
            business_unit: getTransfer?.business_unit,
            transfer_request: getTransfer?.id,
            posting_date: getTransfer?.posting_date,
            due_date: getTransfer?.due_date,
            from_warehouse: getFromWarehouse.toLocaleString(),
            to_warehouse: getToWarehouse.toLocaleString(),
            line: getTransfer?.line,
            shift: getTransfer?.shift,
            status: state,
          };
          const res = {
            transfer_request: getTransfer?.id,
          };
          const change = {
            status: 'done',
            remark: '',
            provided: providedId,
          }
          await services.save(entity)
          await services.receive_change(res)
          await services.update_provided_status(change)
          setTransferItemListOpen({ visible: false, provided: '', status: '' })
          close()
          message.success('Success');
          actionRef.current?.reloadAndRest?.();
        } catch (error) {
          console.error('An error occurred:', error);
          message.error('Error');
        }
      },
    });
  };

  const onRejectTransfer = () => {
    Modal.confirm({
      title: 'Reject Transfer',
      content: 'are you sure',
      onOk: async () => {
        try {

          const change = {
            status: 'cancel',
            remark: '',
            provided: providedId,
          }
          await services.update_provided_status(change)
          setTransferItemListOpen({ visible: false, provided: '', status: '' })
          close()
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
      readOnly
      // onSubmit={async () => {
      //   const dataForm = await form.validateFields();
      //   const isValid = items.every((item) => item.oldtotal + item.itemReceive <= item.quantity);
      //   if (!isValid) {
      //     message.error('Invalid Data');
      //     return;
      //   }
      //   const entity = {
      //     ...dataForm,
      //     id: data?.id,
      //     items: items.map((v) => ({ ...v })),
      //     transfer_type: getTransfer?.transfer_type,
      //     business_unit: getTransfer?.business_unit,
      //     transfer_request: getTransfer?.id,
      //     posting_date: getTransfer?.posting_date,
      //     due_date: getTransfer?.due_date,
      //     from_warehouse: getFromWarehouse.toLocaleString(),
      //     to_warehouse: getToWarehouse.toLocaleString(),
      //     line: getTransfer?.line,
      //     shift: getTransfer?.shift,
      //     status: updateStatus,
      //   };
      //   const res = {
      //     ...dataForm,
      //     transfer_request: getTransfer?.id,
      //   };
      //   onSave(entity, res);
      // }}
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
                  onChange: async (e: any) => {
                    const transfer = await services.detail(e);
                    const rs = await TransferRequestServiceAPI(requestActions).get_provided_list(e)
                    const itemcode = transfer.item.map((it) => it.item_code);
                    for (let i = 0; i < itemcode.length; i++) {
                      const it = await services.get_item_for_close({
                        item_code: itemcode[i],
                        transfer_request_id: transfer.id,
                        status: 'done'
                      })
                      const val = it.map((v) => parseFloat(v.received));
                      let total = 0;
                      for (let r = 0; r < val.length; r++) {
                        total += val[r];
                      }
                      setGetTotal((prevState) => ({
                        ...prevState,
                        [itemcode[i]]: total,
                      }));
                    }
                    setProvidedList(rs)
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
        <Card title="Transfer" size="small">
          <ProTable<ProvidedList>
            size="small"
            search={false}
            rowKey="id"
            editable={{
              type: 'multiple',
              editableKeys: getTransfer?.item.map((it) => it.id),

            }}
            dataSource={providedList}
            options={{
              density: false,
              fullScreen: false,
              reload: false,
              setting: false,

            }}
            pagination={false}
            columns={[
              {
                title: '',
                width: 50,
                render: (_, r) => (r.status == 'cancel' ? <Checkbox indeterminate disabled /> : r.status == 'done' ? <Checkbox defaultChecked disabled /> : <Checkbox defaultChecked={false} disabled />),
              },
              {
                title: 'Transfer', render: (_, r, index) =>
                  <a
                    onClick={() => { setTransferItemListOpen({ visible: true, provided: r.provided, status: r.status }), setProvidedId(r.provided), setProvidedStatus(r.status) }}
                  >
                    {`Transfer ${index + 1}`}
                  </a>
              },
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
      <TransferItemList
        provided={providedId}
        status={providedStatus}
        open={transferItemListOpen.visible}
        onCancel={() => setTransferItemListOpen({ visible: false, provided: '', status: '' })}
        onSave={(data) => { onSaveTransfer(data) }}
        onReject={onRejectTransfer}
      />
    </FormModalComp>
  );
};

export default ModelForm;
