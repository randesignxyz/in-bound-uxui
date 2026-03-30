import { IProcessWorkflowModel } from '@/models/process-flow/data';
import SearchAccountComp from '@/pages/process-flow/components/SearchAccount';
import {
  Delegation,
  DestUser,
  MessageTemplate,
  SaveFirstLevelApproval,
  SaveFirstLevelAssignee,
  SaveFirstLevelCandidateUser,
} from '@/services/process-workflow/data';
import { DeleteOutlined, PlusCircleFilled } from '@ant-design/icons';
import { DrawerForm, ModalForm, ProFormCheckbox, ProList } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Checkbox, Col, Drawer, Flex, Form, message, Modal, Row, Spin, Tabs, Tag } from 'antd';
import { CheckboxOptionType } from 'antd/lib/checkbox';
import { uniqueId } from 'lodash';
import React, { useEffect, useState } from 'react';
import AssigneeComp from './Assignee';
import CandidateUserComp from './CandidateUser';
import DelegationForm from './DelegationForm';
import DelegationList from './DelegationList';

const notificationOptions: CheckboxOptionType[] = [
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Rejected (Extra)', value: 'rejected_extra' },
];

// const layout = {
//   labelCol: { span: 5 },
//   wrapperCol: { span: 15 },
// };

type dataType = {
  notification: string[];
  messageTemplateId: number;
  subject?: string;
  bcc?: string;
  ingoreRepeatedUserAction: boolean;
  modifyPayload: boolean;
  messageBody?: string;
  candidateOptions?: string[];
};

const DestApproval: React.FC<{
  workflow: IProcessWorkflowModel;
  width?: string | number;
  title?: string;
  visible?: boolean;
  destination?: SaveFirstLevelApproval;
  onSave: (data: SaveFirstLevelApproval) => void;
  onCancel?: () => void;
}> = ({ workflow, width, title, visible, destination, onSave, onCancel }) => {
  const [assignee, setAssignee] = useState<SaveFirstLevelAssignee>();
  const [candidateUser, setCandidateUser] = useState<SaveFirstLevelCandidateUser>();
  const [form] = Form.useForm<dataType>();
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>();
  const [availableCandidates, setAvailableCandidates] = useState<DestUser[]>([]);
  const [activeTab, setActiveTab] = useState<string>()

  useEffect(() => {
    initLoad();
    setAssignee(destination?.assignee);
    setCandidateUser(destination?.candidateUser);
    setAvailableCandidates(destination?.availableCandidateList || []);
    form.setFieldsValue({
      messageTemplateId: destination?.notifications.find((it) => it)?.messageTemplateId,
      subject: destination?.mailTemplate?.subject,
      bcc: destination?.mailTemplate?.bcc,
      notification: destination?.optionList
        .filter((it) => it.type == 'NOTIFICATION')
        .map((it) => it.value),
      candidateOptions: destination?.optionList
        ?.filter((it) => it.type == 'CANDIDATE_OPTION')
        .map((it) => it.value),
      ingoreRepeatedUserAction: destination?.optionList.some(
        (it) => it.type == 'IGNORE_REPEATED_USER_ACTION' && it.value == 'Y',
      ),
      modifyPayload: destination?.optionList.some(
        (it) => it.type == 'MODIFY_PAYLOAD' && it.value == 'Y',
      ),
      messageBody: destination?.mailTemplate?.body,
    });
  }, [destination]);

  const initLoad = async () => {
    const rs = await workflow.actions.listMessageTemplate();
    setMessageTemplates(rs);
  };

  const onSaveAssigneeHandler = (data: SaveFirstLevelAssignee) => {
    setAssignee(data);
  };

  const onSaveCandidateUserHandler = (data: SaveFirstLevelCandidateUser) => {
    setCandidateUser(data);
  };

  const onFinishHandler = (values: dataType) => {
    const {
      subject,
      bcc,
      notification,
      messageBody,
      modifyPayload,
      messageTemplateId,
      ingoreRepeatedUserAction,
      candidateOptions,
    } = values;

    if (
      !assignee ||
      (!assignee.departmentHead &&
        !assignee.defaultAssignee &&
        (assignee.destSelectorList || []).length == 0 &&
        !assignee.originator &&
        !assignee.internal)
    ) {
      message.error('Assignee is mandatory. Please specific assignee');
      return;
    }

    const optionList: { type: string; value: string }[] = [
      ...(notification || []).map((it) => ({ type: 'NOTIFICATION', value: it })),
      { type: 'MODIFY_PAYLOAD', value: modifyPayload ? 'Y' : 'N' },
      { type: 'IGNORE_REPEATED_USER_ACTION', value: ingoreRepeatedUserAction ? 'Y' : 'N' },
      ...(candidateOptions || []).map((it) => ({ type: 'CANDIDATE_OPTION', value: it })),
    ];

    destination &&
      onSave?.({
        ...destination,
        assignee: { ...assignee },
        candidateUser: candidateUser,
        notifications: [
          { type: 'TASK', channel: 'EMAIL', messageTemplateId: messageTemplateId as number },
        ],
        optionList: optionList,
        availableCandidateList: availableCandidates,
        mailTemplate:
          subject && messageBody
            ? {
              subject: subject,
              body: messageBody,
              bcc: bcc,
            }
            : undefined,
      });
  };

  return (
    <DrawerForm
      width={width}
      title={title}
      open={visible}
      submitter={{
        submitButtonProps: { disabled: activeTab == '4' }
      }}
      form={form}
      layout="horizontal"
      onFinish={async () => {
        form.validateFields().then(onFinishHandler);
      }}
      onOpenChange={visible => !visible && onCancel?.()}
    > <Spin spinning={false}>
        <Flex vertical>
          <Form.Item name="notification" label="Notification">
            <Checkbox.Group
              options={notificationOptions.map((it) => {
                return { value: it.value, label: it.label };
              })}
            />
          </Form.Item>

          <Form.Item label="Modify Payload" valuePropName="checked" name="modifyPayload">
            <Checkbox />
          </Form.Item>

          <Form.Item
            label="Ingore Repeated User Action"
            valuePropName="checked"
            name="ingoreRepeatedUserAction"
          >
            <Checkbox />
          </Form.Item>
          <ProFormSelect
            rules={[{ required: true }]}
            label="Task Message Template"
            name={'messageTemplateId'}
            options={(messageTemplates || []).map((it) => ({ value: it.id, label: it.name }))}
          />
          <Tabs onChange={key => setActiveTab(key)} defaultActiveKey="1">
            <Tabs.TabPane tab="Assignee" key="1">
              <AssigneeComp assignee={destination?.assignee} onSave={onSaveAssigneeHandler} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Candidate Users" key="2">
              <CandidateUserComp
                candidateUser={destination?.candidateUser}
                onSaveHandler={onSaveCandidateUserHandler}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Available Candidate" key={'3'}>
              <Row>
                <Col flex={'Auto'}>
                  <ProFormCheckbox.Group
                    name={'candidateOptions'}
                    options={[
                      { label: 'Sub task', value: 'SUB_TASK' },
                       { label: 'Comment', value: 'CLARIFY_TASK' },
                      { label: 'Reassign', value: 'REASSIGN' },
                    ]}
                  />
                </Col>
                <Col>
                  <ModalForm
                    title="Assign available candidate"
                    modalProps={{ destroyOnClose: true }}
                    submitter={{
                      submitButtonProps: {
                        style: {
                          display: 'none',
                        },
                      },
                    }}
                    trigger={<Button type="link" icon={<PlusCircleFilled />} />}
                  >
                    <SearchAccountComp
                      type={'user'}
                      approverOnly={false}
                      selected={availableCandidates.map((it) => ({
                        id: it.userId,
                        name: it.userName || '',
                        type: 'USER',
                      }))}
                      onValues={(items) =>
                        setAvailableCandidates(
                          items.map((it) => ({ userId: it.id, userName: it.name })),
                        )
                      }
                      onAdded={() => { }}
                    />
                  </ModalForm>
                </Col>
              </Row>
              <ProList<DestUser>
                dataSource={availableCandidates}
                showActions="hover"
                rowKey={(it) => it.userId}
                metas={{
                  title: { dataIndex: 'userName' },
                  subTitle: {
                    render: (_, r) =>
                      [r.userId, r.email]
                        .filter((it) => it)
                        .map((it) => <Tag key={`${uniqueId(it)}`}>{it}</Tag>),
                  },
                  actions: {
                    render: (_, r) => [
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          setAvailableCandidates((v) => v.filter((it) => it.userId != r.userId))
                        }
                      />,
                    ],
                  },
                }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Delegation" key="4" >
              <DelegationList destination={destination} />
            </Tabs.TabPane>
          </Tabs>
        </Flex>
      </Spin>
    </DrawerForm>
  );
};

export default DestApproval;
