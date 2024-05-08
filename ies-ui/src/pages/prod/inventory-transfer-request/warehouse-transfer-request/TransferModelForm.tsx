import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
import { Button, Card, Checkbox, Col, Modal, Row, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment, { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import {
  ProvidedList,
  TransferRequest,
  TransferRequestCreate,
  TransferRequestItem,
} from '../data';
import TableView from '@/components/DataCrud/TableView';
import FormModal from './FormModal';
import AddTransfer from './Detail/AddTransfer';
import { TransferRequestServiceAPI } from '../service';

interface Props extends FormModalProps {
  data?: any;
  // onSave: (data: TransferRequestCreate) => void;
  actionType?: string;
  id?: string;
}

const TransferModelForm: React.FC<Props> = ({ data, ...props }) => {
  const [form] = useForm<TransferRequestCreate>();
  const requestActions = simpleRequestActions();
  const services = TransferRequestServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [showAddInterface, setShowAddInterface] = useState(false);
  const [items, setItems] = useState([])
  const [providedList, setProvidedList] = useState<ProvidedList[]>([])

  // const initFormData = () => {

  //   form.setFieldsValue({
  //     items: items,
  //     business_unit: getTendency,
  //     transfer_type: data?.transfer_type || "PM/RM",
  //     item_count: items.length
  //   });
  // };

  useEffect(() => {
    const list = async () => {
      const rs = await services.get_provided_list(data.id)
      setProvidedList(rs)
    }
    list()
  }, [data.id])

  return (
    <FormModalComp
      title="Transfer"
      {...props}
      // width={"400px"}
      onSubmit={async () => {
        Modal.confirm({
          title: 'Save Transfer record',
          content: 'are you sure',
          onOk: async () => {
            await services.provided({ item: items, status: '', transfer_request_id: data.id })
            setShowAddInterface(false);
            props.onCancel?.();
            actionRef.current?.reloadAndRest?.();
            message.success('Success');
          },
        });
      }}
      onCancel={() => {
        setShowAddInterface(false); // Reset showAddInterface to false when the cancel button is clicked
        props.onCancel?.(); // Call the onCancel function passed from the parent component to close the modal
      }}
      readOnly={!showAddInterface ? true : false}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      {showAddInterface ? (
        // Conditional rendering of AddInterface component
        <AddTransfer transfer_request_id={data.id} data={data} onSave={(data) => setItems(data)} />
      ) : (
        <ProTable<ProvidedList>
          size="small"
          search={false}
          rowKey="id"
          dataSource={providedList}
          options={{
            density: false,
            fullScreen: false,
            // reload: false,
            setting: false,

          }}
          toolbar={{
            actions: [
              <Button
                key="add-button"
                type="link"
                icon={<PlusOutlined />}
                onClick={() => setShowAddInterface(true)}
              />,
              // Add other toolbar actions as needed
            ],
            // Add other toolbar options as needed
          }}
          pagination={false}
          columns={[
            {
              title: '',
              width: 50,
              render: (_, r, index) => (r.status == 'cancel' ? <Checkbox indeterminate disabled /> : r.status == 'done' ? <Checkbox defaultChecked disabled /> : <Checkbox defaultChecked={false} disabled />),
            },
            { title: 'Transfer', render: (_, r, index) => <a>{('Transfer ' + (index + 1))}</a> },
          ]}
        />)}
    </FormModalComp>
  );
};

export default TransferModelForm;
