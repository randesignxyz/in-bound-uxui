import React, { useEffect } from 'react';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { Form, message } from 'antd';
import { Modal } from 'antd';
import { ActionDataFormProps } from '../../data';
import ActionFormWrapper from './ActionFormWrapper';
import { ProCard } from '@ant-design/pro-components';

const DefaultActionForm: React.FC<ActionDataFormProps> = (props) => {

  const [form] = Form.useForm<{ comment?: string }>();

  useEffect(() => {
    return () => {
      form.resetFields()
    }
  }, [props.visible])

  return (
    <ActionFormWrapper
      title={props.activityData?.activity}
      instanceData={props.ProcessInstanceData}
      {...props}
      actionHandlers={{
        ...props.actionHandlers,
        onReset: () => {
          form.resetFields();
          props.actionHandlers?.onReset?.();
        },
        onCompleted: async () => {
          try {
            const values = await form.validateFields();
            Modal.confirm({
              title: 'Workflow Action',
              content: 'Are you sure?',
              onOk: async () => {
                const { comment, ...rest } = values;
                try {
                  await props.actionHandlers?.onCompletedTask?.(rest, comment);
                  message.success('Action is submited succesfully.');
                } catch (error) {
                  message.error('Failed to process.');
                }
              },
            });
          } catch (error) {
            message.error('Invalid Data.');
          }
        },
      }}>

      <ProCard size='small'>
        <ProForm form={form} submitter={false} >
          <ProFormTextArea
            rules={[{ required: true }]}
            label="Comment"
            name="comment"
          />
        </ProForm>
      </ProCard>
    </ActionFormWrapper>
  );
};

export default DefaultActionForm;
