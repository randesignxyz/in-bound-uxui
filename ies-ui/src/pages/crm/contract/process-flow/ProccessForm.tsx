import React from 'react';

import ProForm, { ProFormText, ProFormTextArea, ProFormDigit } from '@ant-design/pro-form';
import { Card, DatePicker, Form, message, Modal } from 'antd';
import { Model } from '../model';
import { useEffect } from 'react';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { UIBuilder } from '@/components/UIBuilder';
import { formatDate } from '@/pages/utils';
import moment from 'moment';
import { ActionDataFormProps } from '@/pages/process-flow/data';
import { CompleteContractData } from '@/services/crm/contract';

interface FormData {
  contractNo: string;
  comment?: string;
  firstCycleDate?: moment.Moment;
  firstSponsorItems?: { itemId: number; qty: number; itemName?: string }[];
  initCommentKh?: string;
  initComment?: string;
}

const ProcessForm: React.FC<ActionDataFormProps> = (props) => {
  const [form] = Form.useForm<FormData>();

  const { state, actions } = Model();

  useEffect(() => {
    if (!props.visible || !props.payload?.id) return;
    actions.doLoadInitData1();
    actions.checkInitialSponsor(props.payload?.id);
    return () => {
      form.resetFields();
    };
  }, [props.visible]);

  useEffect(() => {
    if (!state.data?.initialSponsor) return;
    form.setFieldsValue({
      firstSponsorItems: state.data.initialSponsor.items?.map((it) => {
        return {
          ...it,
          itemName: state.initialData?.itemList?.find((i) => i.id == it.itemId)?.name,
        };
      }),
    });
  }, [state.data?.initialSponsor]);

  return (
    <ActionFormWrapper
      loading={state.loading}
      {...props}
      width="700px"
      actionHandlers={{
        ...props.actionHandlers,
        onReset: () => {
          form.resetFields();
          props.actionHandlers?.onReset?.();
        },
        onCompleted: async () => {
          try {
            const dataForm = await form.validateFields();
            const { comment } = dataForm;

            try {
              Modal.confirm({
                title: 'Completed Process',
                content: 'Are you sure?',
                onOk: async () => {
                  const saveData: CompleteContractData = {
                    ...dataForm,
                    contractId: props.payload?.id || 0,
                    contractNo: props.ProcessInstanceData?.processInstance?.businessKey || '',
                    actionData: {
                      taskId: props.activityData?.taskId || '',
                      action: props.action,
                      // payloadType: props.formKey,
                      comment: comment,
                      uploadedFiles: props.uploadFiles?.map((it) => it.fileName || '') || [],
                    },
                    formNo: props.ProcessInstanceData?.processInstance?.businessKey || '',
                  };
                  try {
                    await actions.comlpetedContractProcess(saveData);
                    message.success('Action is submited succesfully.');
                  } catch (error) {
                    message.error('Failed to take the action.');
                  }
                },
              });
            } catch {
              message.error('Failed to process');
            }
          } catch (error) {
            message.error('Invalid data.');
          }
        },
      }}
    >
      <ProForm
        submitter={false}
        layout="vertical"
        form={form}
        initialValues={{
          cycleType: 'end',
        }}
      >
        <Card style={{ marginBottom: '5px' }}>
          <ProFormText
            help={<span />}
            label="Contract No"
            name="contractNo"
            rules={[{ required: true }]}
          />

          <Form.Item
            help={<span />}
            name="firstCycleDate"
            label="First Cycle Date"
            rules={[{ required: true }]}
          >
            <DatePicker.MonthPicker style={{ width: '200px' }} />
          </Form.Item>
        </Card>

        {state.data?.initialSponsor?.required && (
          <Card style={{ marginBottom: '5px' }}>
            <Form.Item
              required={true}
              label={`Sponsor Items (Effective date: ${formatDate(
                state.data.initialSponsor.statedDate,
              )})`}
            >
              <Form.List
                name="firstSponsorItems"
                initialValue={state.data.initialSponsor.items?.map((it) => {
                  return {
                    ...it,
                    itemName: state.initialData?.itemList?.find((i) => i.id == it.itemId)?.name,
                  };
                })}
              >
                {UIBuilder.createFormListElements((field, index) => {
                  return (
                    <>
                      <ProFormDigit
                        placeholder="Qty"
                        width="xs"
                        help={<span />}
                        rules={[{ required: true }]}
                        name={[field.name, 'qty']}
                        fieldKey={[field.fieldKey, 'qty']}
                      />
                      <ProFormText
                        readonly
                        name={[field.name, 'itemName']}
                        fieldKey={[field.fieldKey, 'itemName']}
                      />
                    </>
                  );
                })}
              </Form.List>
            </Form.Item>
            <ProFormTextArea
              help={<span />}
              rules={[{ required: true }]}
              label="Init Comment (KH)"
              name="initCommentKh"
            />
            <ProFormTextArea
              help={<span />}
              rules={[{ required: true }]}
              label="Init Comment (Latin)"
              name="initComment"
            />
          </Card>
        )}

        <Card style={{ marginBottom: '5px' }}>
          <ProFormTextArea label="Comment" name="comment" />
        </Card>
      </ProForm>
    </ActionFormWrapper>
  );
};

export default ProcessForm;
