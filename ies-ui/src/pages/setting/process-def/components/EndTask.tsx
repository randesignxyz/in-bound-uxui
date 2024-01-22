import { IProcessWorkflowModel } from '@/models/process-flow/data';
import SearchAccountComp from '@/pages/process-flow/components/SearchAccount';
import { DestSelector, SearchAccount } from '@/services/account/data';
import { ConfigEndEventRs, DestUser, MessageTemplate } from '@/services/process-workflow/data';
import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { ProCard, ProList } from '@ant-design/pro-components';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Button, Divider, message, Modal, Space, Spin, Tag } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import SelectorApproval from './SelectorApproval';
import { uniq, uniqueId } from 'lodash';

interface Props {
  workflow: IProcessWorkflowModel;
  visible: boolean;
  eventId: string;
  width?: string | number;
  onCancel?: () => void;
  data?: ConfigEndEventRs;
}

const EndTask: React.FC<Props> = ({ visible, eventId, width, data, workflow, onCancel }) => {
  const [form] = useForm<{
    approvedMessageTempateId: number;
    rejectedMessageTempateId: number;
    endEventMessageTemplateId: number;
  }>();

  const [destList, setDestList] = useState<DestUser[]>([]);
  const [destUserModalVisisble, setDestUserModalVisisble] = useState(false);
  const [rejectNotify, setRejectNotify] = useState(false)
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>();
  const [destSelectorList, setDestSetSelectorList] = useState<(DestSelector & { key: string })[]>([])

  useEffect(() => {
    if (visible) {
      initLoad();
    }

    return () => {
      form.resetFields();
      setDestList([]);
    };
  }, [visible]);

  const initLoad = async () => {
    const rs = await workflow.actions.listMessageTemplate();
    setMessageTemplates(rs);
    const rejectNotify = data?.notifications.find((it) => it.type === 'REJECTED_ACTION')
    form.setFieldsValue({
      approvedMessageTempateId: data?.notifications.find((it) => it.type === 'APPROVED_ACTION')
        ?.messageTemplateId,
      rejectedMessageTempateId: rejectNotify?.messageTemplateId,
      endEventMessageTemplateId: data?.notifications.find((it) => it.type === 'END_EVENT')
        ?.messageTemplateId,
    });
    setDestList(data?.notifyUsers || []);

    const list = uniq(rejectNotify?.destSelectorList?.map(it => it.userId))

    const selectorList = list.map(it => ({
      approver: it,
      key: uniqueId().toString(),
      selectors: rejectNotify?.destSelectorList?.filter(i => i.userId == it).map(it => ({
        key: uniqueId().toString(),
        selector: it.selectorType,
        operand: it.operand,
        dataType: it.dataType,
        value: it.selectorValue,
        remarks: it.remarks,
      })) || []
    }));

    setDestSetSelectorList(selectorList)
    
  };

  const onRemoveDestUserHandler = (item: DestUser) => {
    setDestList((v) => v.filter((it) => it.userId !== item.userId));
  };
  const onAddedHandler = (item: SearchAccount) => {
    setDestList((v) => [...v, { userId: item.id, userName: item.name }]);
  };

  const onSaveHandler = async () => {
    const dataForm = await form.validateFields();

    Modal.confirm({
      title: 'Save End Event Configuration',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          const selectors = destSelectorList.flatMap(it => it.selectors.flatMap(s => ({
            userId: it.approver,
            selectorType: s.selector || '',
            operand: s.operand,
            dataType: s.dataType,
            selectorValue: s.value || '',
            remarks: s.remarks
          })))
        
          await workflow.actions.saveConfigEndEvent({
            eventId: eventId,
            notifications: [
              {
                type: 'APPROVED_ACTION',
                channel: 'EMAIL',
                messageTemplateId: dataForm.approvedMessageTempateId,
                // destSelectorList: [],
              },
              {
                type: 'REJECTED_ACTION',
                channel: 'EMAIL',
                messageTemplateId: dataForm.rejectedMessageTempateId,
                destSelectorList: selectors,
              },
              {
                type: 'END_EVENT',
                channel: 'EMAIL',
                messageTemplateId: dataForm.endEventMessageTemplateId,
                // destSelectorList: [],
              },
            ].filter(it => it.messageTemplateId != null),
            notifyUsers: destList.map((it) => it.userId),
          });
          onCancel?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to save.');
        }
      },
    });
  };

  return (
    <Modal
      title="End"
      open={visible}
      width={width || '1000px'}
      destroyOnClose
      onOk={onSaveHandler}
      onCancel={onCancel}
    >
      <Spin spinning={false}>
        <ProForm form={form} submitter={false}>
          <Space direction='vertical' style={{ width: '100%' }}>
            <ProCard size='small' bordered title="Approved notification ">
              <ProFormSelect
                label="Notification Template"
                name={'approvedMessageTempateId'}
                rules={[{ required: true }]}
                options={(messageTemplates || []).map((it) => ({ value: it.id, label: it.name }))}
              />
            </ProCard>

            <ProCard size='small' bordered title="Rejected notification">

              <ProFormSelect
                label="Notification Template"
                name={'rejectedMessageTempateId'}
                rules={[{ required: true }]}
                options={(messageTemplates || []).map((it) => ({ value: it.id, label: it.name }))}
              />
              <ProList<DestSelector & { key: string }> dataSource={destSelectorList}
                showActions='hover'
                toolBarRender={() => [
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => setRejectNotify(true)}
                  >
                    Add
                  </Button>
                ]}
                headerTitle= "Extra Users"
                rowKey={it => it.key}
                
                metas={{
                  title: { dataIndex: 'approver' },
                  description: {
                    render: (_, r) => r.selectors.map(it => `${it.selector} (${it.dataType}) ${it.operand} ${it.value}`).map(it => <Tag>{it}</Tag>)
                  },
                  actions: {
                    render: (_, r) => [<Button type='link' size='small' danger icon={<DeleteOutlined />} onClick={() => setDestSetSelectorList(v => v.filter(it => it.key != r.key))} />]
                  }
                }}
              />
            </ProCard>

            <ProCard size='small' bordered title="Follow up notification ">

              <ProFormSelect
                label="Notification Template"
                name={'endEventMessageTemplateId'}
                options={(messageTemplates || []).map((it) => ({ value: it.id, label: it.name }))}
              />
              <ProForm.Group
                size={2}
                title="Destination Users"
                extra={
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => setDestUserModalVisisble(true)}
                  >
                    Add
                  </Button>
                }
              >
                {destList.map((it) => (
                  <Tag
                    closable
                    onClose={() => onRemoveDestUserHandler(it)}
                    key={`default-user-${it.userId}`}
                  >
                    <UserOutlined /> {it.userName}
                  </Tag>
                ))}
              </ProForm.Group>
            </ProCard>
          </Space>
        </ProForm>

        {rejectNotify && <SelectorApproval
          open={true}
          onSave={(appover, selectors) => setDestSetSelectorList(v => [...v, { key: uniqueId().toString(), approver: appover, selectors: selectors }])}
          onOpenChange={visible => !visible && setRejectNotify(false)}
        />}

        <Modal
          title="Search"
          width={'1000px'}
          open={destUserModalVisisble}
          destroyOnClose
          footer={false}
          onCancel={() => setDestUserModalVisisble(false)}
        >
          <SearchAccountComp
            type={'user'}
            approverOnly={false}
            selected={destList.map((item) => {
              return { id: item.userId, name: item.userName, type: 'user' } as SearchAccount;
            })}
            onAdded={onAddedHandler}
          />
        </Modal>
      </Spin>
    </Modal>
  );
};

export default EndTask;
