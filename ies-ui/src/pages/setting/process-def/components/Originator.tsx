import React, { useEffect, useState } from 'react';
import { Radio, List, Card, Button, Form, Modal, Checkbox, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { CheckboxOptionType } from 'antd/lib/checkbox';
import {
  Originator,
  OriginatorAuth,
  SaveWorkflowOriginator,
} from '@/services/process-workflow/data';
import { SearchAccount } from '@/services/account/data';
import SearchAccountComp from '@/pages/process-flow/components/SearchAccount';

const OriginatorComp: React.FC<{
  width?: string | number;
  title?: string;
  visible?: boolean;
  processDefId?: string;
  originatorAuth?: OriginatorAuth;
  onSave: (data: SaveWorkflowOriginator) => void;
  onCancel?: () => void;
}> = ({ width, title, visible, originatorAuth, processDefId, onSave, onCancel }) => {
  const [isEveryone, setIsEveryone] = useState<boolean>(false);

  const [items, setItems] = useState<Originator[]>([]);

  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const [form] = Form.useForm();

  // const saveOriginatorSrv = useProcessData<SaveWorkflowOriginator, {}>(WorkFlowService('saveOriginator'))

  useEffect(() => {
    if (!visible) return;
    const ev = originatorAuth
      ? originatorAuth.originatorList.length === 0 ||
        originatorAuth.originatorList.some((it) => it.id === 'default')
      : true;
    setItems(originatorAuth?.originatorList || []);
    setIsEveryone(ev);
    form.setFieldsValue({
      company: originatorAuth?.companyList,
      originatorType: ev ? 1 : 2,
      notification: originatorAuth?.notificationFeedbacks,
    });
  }, [originatorAuth, visible]);

  const removeItem = (check: Originator) => {
    setItems([...items.filter((it) => it !== check)]);
  };

  const onFinishHandler = (values: any) => {
    const data = isEveryone
      ? [{ id: 'default', name: 'default', type: 'group' } as Originator]
      : items;
    const { company, notification } = values;
    if (!company || company.length === 0) {
      message.error('Please select company');
      return;
    }

    if (data.length === 0) {
      message.error('Please add originator.');
      return;
    }

    processDefId &&
      onSave({
        processDefId: processDefId,
        companyList: company,
        originators: data.map((it) => {
          return { id: it.id, groupFlag: it.type === 'group' };
        }),
        notificationFeedbacks: notification,
      });
  };

  const hideModalHandler = () => {
    setSearchModalVisible(false);
  };

  const onAddedHandler = (item: SearchAccount) => {
    setItems([...items, { id: item.id, name: item.name, type: item.type } as Originator]);
  };

  const companyOptions = [
    { label: 'OFL', value: 1 },
    { label: 'NVC', value: 2 },
    { label: 'OMM', value: 3 },
    { label: 'OMR', value: 4 },
  ];

  const notificationOptions: CheckboxOptionType[] = [
    {
      label: 'Completed',
      value: 'completed',
    },
    {
      label: 'Rejected',
      value: 'rejected',
    },
  ];

  return (
    <Modal
      width={width}
      title={title}
      destroyOnClose
      open={visible}
      onOk={() => {
        form.validateFields().then(onFinishHandler);
      }}
      // confirmLoading={saveOriginatorSrv.loading}

      onCancel={onCancel}
    >
      <Form
        form={form}
        name={'originatorForm'}
        onValuesChange={(changedValues) => {
          const { originatorType } = changedValues;
          if (originatorType) {
            setIsEveryone(originatorType === 1);
          }
        }}
      >
        <Form.Item initialValue={originatorAuth?.companyList} name="company" label="Companies">
          <Checkbox.Group options={companyOptions} />
        </Form.Item>

        <Form.Item name="notification" label="Notification">
          <Checkbox.Group options={notificationOptions} />
        </Form.Item>

        <Form.Item name="originatorType">
          <Radio.Group
            options={[
              { value: 1, label: 'EveryOne' },
              { value: 2, label: 'Specific users/groups' },
            ]}
          />
        </Form.Item>
        {!isEveryone && (
          <Button
            type="link"
            onClick={() => {
              setSearchModalVisible(true);
            }}
          >
            Add
          </Button>
        )}

        {!isEveryone && (
          <List<Originator>
            style={{ marginTop: '5px' }}
            grid={{ column: 4 }}
            bordered
            dataSource={items}
            renderItem={(item) => (
              <List.Item>
                <Card
                  size="small"
                  title={item.type === 'user' ? 'User' : 'Group'}
                  style={{ marginTop: '5px', width: '200px' }}
                  extra={
                    <Button
                      danger
                      size="small"
                      shape="circle"
                      onClick={() => removeItem(item)}
                      icon={<DeleteOutlined />}
                    />
                  }
                >
                  <p>{item.name}</p>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Form>

      <Modal
        title="Search"
        width={'1000px'}
        open={searchModalVisible}
        destroyOnClose
        footer={false}
        onCancel={hideModalHandler}
      >
        <SearchAccountComp
          type={'all'}
          approverOnly={false}
          selected={items.map((item) => {
            return { id: item.id, name: item.name, type: item.type } as SearchAccount;
          })}
          onAdded={onAddedHandler}
        />
      </Modal>
    </Modal>
  );
};

export default OriginatorComp;
