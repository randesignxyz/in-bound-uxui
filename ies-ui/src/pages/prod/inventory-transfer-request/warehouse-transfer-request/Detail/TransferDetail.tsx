import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { ActionType, EditableFormInstance, EditableProTable, ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { AddSupplierParams, ProvidedItem, TransferRequest, TransferRequestItem } from '../../data';
import { ItemServiceAPI, TransferRequestServiceAPI } from '../../service';
import { Modal, message } from 'antd';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
    provided:string
}
export default ({ provided,...props }: Props) => {
  // const [form] = useForm<{ remarks: string }>();
  const [items, setItems] = useState<ProvidedItem[]>([]);
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = TransferRequestServiceAPI(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [gettotalprovide, setGetTotalProvide] = useState<{ code: string; total: number }>({
    code: '',
    total: 0,
  });

  useEffect(() => {
    if (props.open) {
        
      const getDetail = async () => {
        const rs = await services.get_provided_item(provided)
        setItems(rs)
      }
      getDetail()
    }

  }, [props.open]);

  return (
    <FormModalComp
      title="Transfer"
      {...props}
      // width={"400px"}
      readOnly
      onCancel={() => {
        props.onCancel?.(); 
      }}
    >
      <ProTable<ProvidedItem>
            size="small"
            search={false}
            rowKey="id"
            dataSource={items}
            options={{
              density: false,
              fullScreen: false,
              reload: false,
              setting: false,
            }}

            pagination={false}
            columns={[
              { title: 'No', render: (_, r, index) => index + 1 },
              { title: 'Item Code', dataIndex: 'item_code' },
              { title: 'Item Name', dataIndex: 'item_name' },
              { title: 'Quantity', dataIndex: 'quantity' },
              { title: 'Received', dataIndex: 'received' },
              // { title: 'Total', dataIndex: 'total' },
              { title: 'UoM', dataIndex: 'uom' },
              { title: 'Vendor', dataIndex: 'supplier' },
              { title: 'Remark', dataIndex: 'remark' },
            ]}
          />
      </FormModalComp>
  );
};
