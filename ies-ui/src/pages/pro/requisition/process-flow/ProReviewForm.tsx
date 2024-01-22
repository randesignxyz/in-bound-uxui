import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionDataFormProps } from '@/pages/process-flow/data';
import { simpleRequestActions } from '@/services/model';
import { ProEmployee, RequisitionDetailResponse } from '@/services/pro/data';
import { RequisitionServiceAPI } from '@/services/pro/services';
import ProForm, { ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { Card, message, Modal, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

const { Text } = Typography;

export default (props: ActionDataFormProps) => {
  const requestActions = simpleRequestActions();
  const services = RequisitionServiceAPI(requestActions);
  const [requisition, setRequisition] = useState<RequisitionDetailResponse>();
  const [empList, setEmpList] = useState<ProEmployee[]>([]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [form] = useForm<{ assignedTo: number; comment: string }>();
  useEffect(() => {
    if (!props.visible) return;
    loadData();
    return clearData;
  }, [props.visible]);

  const clearData = () => {
    form.resetFields();
    setFiles([]);
  };
  const loadData = async () => {
    try {
      if (!props.activityData?.procInstId) return;
    
      const data = await services.detailByProcessFlow(props.activityData?.procInstId);
      setRequisition(data);
      const empList = await services.listProEmplyee();

      setEmpList(empList);
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetchdata');
    }
  };

  return (
    <ActionFormWrapper
      {...props}
      loading={requestActions.request?.loading}
      actionHandlers={{
        ...props.actionHandlers,
        onRemoveFile: (file) => setFiles((v) => v.filter((it) => it.uid !== file.uid)),
        onAddFile: (file) => setFiles((v) => [...v, file]),
        onCompleted: async () => {
          const dataForm = await form.validateFields();

          Modal.confirm({
            title: 'Procument Review',
            content: 'Are you sure?',
            onOk: async () => {
              try {
                await services.saveProReview({
                  taskId: props.activityData?.taskId || '',
                  actionName: props.action,
                  comment: dataForm.comment,
                  payload: {
                    id: requisition?.id || 0,
                    assignedTo: dataForm.assignedTo,
                  },
                  fileIds: files.map((it) => it.response),
                });
                props.actionHandlers?.onCancel?.(true);
              } catch (error: any) {
                message.error(error.message || 'Faild to submit.');
              }
            },
          });
        },
      }}
    >
      <ProForm form={form} submitter={false}>
        <Card style={{ marginTop: 10, marginBottom: 10 }}>
          <ProFormSelect
            rules={[{ required: true }]}
            showSearch
            label="Assigned To"
            name={'assignedTo'}
            options={empList.map((it) => ({
              value: it.id,
              label: `${it.firstName} ${it.lastName} (${it.empNo})`,
            }))}
          />

          <ProFormTextArea label="Comment" name="comment" />
          <Text type="warning">Note: Requisition will be posted to SAP.</Text>
        </Card>
      </ProForm>
    </ActionFormWrapper>
  );
};
