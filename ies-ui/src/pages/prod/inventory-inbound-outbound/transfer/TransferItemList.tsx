import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { ActionType, EditableFormInstance, EditableProTable, ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Modal, message } from 'antd';
import { TransferRequestServiceAPI } from '../request/service';
import { ProvidedItem } from '../request/data';
import { useAccess } from '@@/exports';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
  provided: string,
  onCancel: () => void,
  status: string
  onSave: (data: ProvidedItem[]) => void
  onReject: () => void,
  type?: string
}
export default ({ provided, status, onSave, onReject, type, ...props }: Props) => {
  const [items, setItems] = useState<ProvidedItem[]>([]);
  const requestActions = simpleRequestActions();
  const services = TransferRequestServiceAPI(requestActions);
  const access = useAccess();

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
          {(status == 'done' || status == 'cancel') ?
            <><Button type="default" style={{ margin: 5 }} onClick={() => props.onCancel()}>Cancel</Button>
            </> :
            (type == 'FG' && (access.canAccessTransferWarehouseItem || access.canAccessAll)) ?
              <>
                <Button type="default" style={{ margin: 5 }} onClick={() => props.onCancel()}>Cancel</Button>
                <Button type="default" style={{ color: 'red', margin: 5, borderColor: 'red' }} onClick={() => onReject()}>Reject</Button>
                <Button type="primary" style={{ margin: 5 }}
                  onClick={async () => {

                    onSave(items)
                  }}
                >Receive
                </Button>
              </>
              : (type == 'PM/RM' && (access.canAccessTransferProductionItem || access.canAccessAll)) ?
                <>
                  <Button type="default" style={{ margin: 5 }} onClick={() => props.onCancel()}>Cancel</Button>
                  <Button type="default" style={{ color: 'red', margin: 5, borderColor: 'red' }} onClick={() => onReject()}>Reject</Button>
                  <Button type="primary" style={{ margin: 5 }}
                    onClick={async () => {

                      onSave(items)
                    }}
                  >Receive
                  </Button>
                </> : <>
                  <Button type="default" style={{ margin: 5 }} onClick={() => props.onCancel()}>Cancel</Button>
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
