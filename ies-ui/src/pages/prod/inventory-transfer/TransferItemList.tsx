import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { ActionType, EditableFormInstance, EditableProTable, ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Modal, message } from 'antd';
import { TransferRequestServiceAPI } from '../inventory-transfer-request/service';
import { ProvidedItem } from '../inventory-transfer-request/data';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
  provided: string,
  onCancel: () => void,
  status: string
  onSave: (data: ProvidedItem[]) => void
  onReject:()=>void
}
export default ({ provided, status, onSave,onReject, ...props }: Props) => {
  const [items, setItems] = useState<ProvidedItem[]>([]);
  const requestActions = simpleRequestActions();
  const services = TransferRequestServiceAPI(requestActions);

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
      readOnly
      footer={
        <div>
          {status == 'done' || status == 'cancel' ?
            <></>
            : <>
              <Button type="default" style={{ margin: 5 }} onClick={() => props.onCancel()}>Cancel</Button>
              <Button type="default" style={{ color: 'red', margin: 5, borderColor: 'red' }} onClick={()=>onReject()}>Reject</Button>
              <Button type="primary" style={{ margin: 5 }}
                onClick={async () => {
                  
                  onSave(items)
                }}
              >Receive
              </Button>
            </>}

        </div>
      }
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
