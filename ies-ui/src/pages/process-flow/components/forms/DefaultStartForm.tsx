import ProcessFlowModel from '@/models/ProcessFlowModel';
import { ProFormTextArea } from '@ant-design/pro-form';
import { Card, Form, message, Modal } from 'antd';
import React, { useEffect } from 'react';
import { ActionDataFormProps } from '../../data';
import StartFromWrapper from './StartFromWrapper';

const DefaultStartForm: React.FC<ActionDataFormProps> = (props) => {
  const { actionHandlers } = props;
  const { state, actions } = ProcessFlowModel();
  const [form] = Form.useForm<{ comment?: string }>();
const onSubmitHandler = async () => {
    const values = await form.validateFields();

    if (!values) {
      message.error('Invalid data.');
      return;
    }

    const { comment } = values;
    Modal.confirm({
      title: 'Start Process Workflow',
      content: 'Do you want to start?',
      onOk: async () => {
        try {
          if (props.actionHandlers?.onStartWorkflow) {
            if (state.requestor) {
              await props.actionHandlers?.onStartWorkflow(
                props.formKey,
                props.formKey,
                1,
                state.requestor,
                comment,
              );
              props.actionHandlers?.onCancel?.();

            }
          } else {
            const rs = await actions.startWorkflow?.(
              { id: props.payload?.id },
              props.formKey,
              1,
              props.formKey,
              
              comment,
            );
            if (rs) {
              message.success(
                `Proces workflow is created succesfully - Request No: ${rs.instanceInfo.businessKey}`,
              );
            }
            props.actionHandlers?.onCancel?.();
          }
        } catch {}
      },
    });
  };

  useEffect(() => {
    if (!props.visible) return;
    
    actions.setRequestor1(props.ProcessInstanceData?.processInstance?.procDefId || '');
  }, [props.visible]);
  
  return (
    <StartFromWrapper
      noAttachment = {props.noAttachment}
      visible={props.visible}
      loading={props.loading}
      requestor={state.requestor}
      notAllowToChangeRequestor = {props.notAllowToChangeRequestor}
      actionHandlers={{
        onSetFiles: actions.onSetFiles,
        onReset: () => {
          form.resetFields();
          actions.crearUploadFiles();
        },
        onCancel: actionHandlers?.onCancel,
        onSetRequestor: actions.setRequestor,
        onOk: onSubmitHandler,
      }}
      uploadFiles={state.uploadFiles}
    >
      <Form form={form}>
        <Card>
          <ProFormTextArea rules={[{required: true}]} label="Comment" name="comment" />
        </Card>
      </Form>
    </StartFromWrapper>
  );
};

export default DefaultStartForm;
