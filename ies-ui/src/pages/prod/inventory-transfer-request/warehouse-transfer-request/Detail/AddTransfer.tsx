import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { ActionType, EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { AddSupplierParams, TransferRequest, TransferRequestItem } from '../../data';
import { ItemServiceAPI, TransferRequestServiceAPI } from '../../service';
import { Modal, message } from 'antd';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
//   id: string;
  open:boolean,
  data?: TransferRequest;
  transfer_request_id: string;
  onSave: (data: any) => void;
}
export default ({ transfer_request_id, data,onSave,...props }: Props) => {
  // const [form] = useForm<{ remarks: string }>();
  const [items, setItems] = useState<TransferRequestItem[]>([]);
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = ItemServiceAPI(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [gettotalprovide, setGetTotalProvide] = useState<{ code: string; total: number }>({
    code: '',
    total: 0,
  });

  useEffect(() => {
    if (props.open) {
      const getReceive = async () => {
        const itemcode = data?.item.map((it) => it.item_code);
        for (let i = 0; i < itemcode.length; i++) {
          const receive = await TransferRequestServiceAPI(requestActions).get_total_provide({
            transfer_request_id: transfer_request_id,
            item_code: itemcode[i]
          })
          const val = receive.map((v) => parseFloat(v.received));
          let total = 0;
          for (let r = 0; r < val.length; r++) {
            total += val[r];
          }
          setGetTotalProvide((prevState) => ({
            ...prevState,
            [itemcode[i]]: total,
          }));
        }
      }
      getReceive()
      setItems([])
    }

  }, [props.open]);

  return (
    <FormModalComp
      title="Transfer"
      {...props}
      // width={"400px"}
      onSubmit={async () => {
        const isValid = items.every((item) => item.oldtotal + item.itemReceive <= item.quantity);
        if (!isValid) {
          message.error('Invalid Data');
          return;
        }
        onSave(items)
      }}
      // onCancel={() => {
      //   // setShowAddInterface(false); // Reset showAddInterface to false when the cancel button is clicked
      //   props.onCancel?.(); // Call the onCancel function passed from the parent component to close the modal
      // }}
      // readOnly={!showAddInterface ? true : false}
      // onResetForm={() => {
      //   form.resetFields();
      // }}
    >
      <EditableProTable<TransferRequestItem>
        size="small"
        search={false}
        rowKey="id"
        editable={{
          type: 'multiple',
          editableKeys: data?.item.map((it) => it.id),
          onValuesChange: (_, recordList) => {
            const updatedItems = recordList.map((it)=>{
              const oldtotal = gettotalprovide[it.item_code] || 0;
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
                  return { ...it, oldtotal, is_receive, total,itemReceive:received };
            })
            // onSave(updatedItems)
            setItems(updatedItems);
          },
        }}
        editableFormRef={editableFormRef}
        value={data?.item}
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
            title: 'Provided',
            dataIndex: 'total',
            width: 80,
            render: (_, r) => gettotalprovide[r.item_code] || 0,
            editable: false,
          },
          { title: 'UoM', dataIndex: 'uom', editable: false, width: 60 },
          { title: 'Provide', valueType: 'digit', dataIndex: 'itemReceive' },
         
          {
            title: 'Vendor',
            dataIndex: 'supplier',
            valueType: 'select',
            request: async (word) => {
              const da = await services.page_supplier({
                criteria: {
                  searchValue: word.keyWords,
                  advanceSearch: { tendency: data?.business_unit },
                },
                pagination: { pageSize: 10 },
              });
              return da.items.map((obj) => ({
                value: obj.card_name,
                label: `${obj.card_name}`,
              }));
            },
            ellipsis: true,
            fieldProps: {
              showSearch: true,
              popupMatchSelectWidth: 200,
              placeholder: 'Please Select',
            },
          },
          { title: 'Remark', dataIndex: 'remark' },
        ]}
      />
      </FormModalComp>
  );
};
