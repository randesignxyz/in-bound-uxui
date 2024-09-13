import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionDataFormProps } from '@/pages/process-flow/data';
import { formatter } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import {
  BudgetCodeListItem,
  RequisitionDetailResponse,
  RequisitionItem,
  RequisitionService,
} from '@/services/pro/data';
import { RequisitionServiceAPI } from '@/services/pro/services';
import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import ProForm, {
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Card, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile } from 'antd/lib/upload/interface';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';

export default (props: ActionDataFormProps) => {
  const requestActions = simpleRequestActions();
  const services = RequisitionServiceAPI(requestActions);
  const [budgetCodeList, setBudgetCodesList] = useState<BudgetCodeListItem[]>([]);
  const [requisition, setRequisition] = useState<RequisitionDetailResponse>();
  const [files, setFiles] = useState<UploadFile[]>([])
  const editableFormRef = useRef<EditableFormInstance>();
  const [items, setItems] = useState<RequisitionItem[]>()
  const [serviceItems, setServiceItems] = useState<RequisitionService[]>()
  const [form] = useForm<{
    comment?: string;
  }>();

  useEffect(() => {
    if (!props.visible) return;
    loadData();
    return () => {
      form.resetFields()
      setFiles([])
    }
  }, [props.visible]);

  const loadData = async () => {
    try {
      if (!props.activityData?.procInstId) return;
      const data = await services.detailByProcessFlow(
        props.activityData?.procInstId,
      );

      // const budgetList = await services.listBudgetCode(data.buId)
      const budgetList = await services.listBudgetCodeByDept(data.deptId, requisition?.buId)
      setBudgetCodesList(budgetList)
      setRequisition(data);

      const itemList = data.items.map((it) => ({
        id: it.id,
        key: uniqueId(),
        seqNo: it.seqNo,
        itemId: it.id,
        itemCode: it.itemCode,
        itemName: it.itemName,
        description: it.description,
        qty: it.qty,
        unitPrice: it.unitPrice,
        uom: it.uom,
        amount: it.amount,
        budgetCode: it.budgetCode,
        remarks: it.remarks,
      }))
      const serviceList = data.services.map((it) => ({
        id: it.id,
        key: uniqueId().toString(),
        seqNo: it.seqNo,
        serviceName: it.serviceName,
        description: it.description,
        amount: it.amount,
        budgetCode: it.budgetCode,
        remarks: it.remarks,
      }))

      setItems(itemList)
      setServiceItems(serviceList)
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetchdata');
    }
  };

  return (
    <ActionFormWrapper
      title="Budget Review"
      {...props}
      loading={requestActions.request?.loading}
      width={'1250px'}
      actionHandlers={{
        ...props.actionHandlers,
        onCompleted: async () => {

          if (!requisition) return
          if (!props.activityData?.taskId) {
            message.error("Task Id is not found")
            return
          }
          const dataForm = await form.validateFields()
          await editableFormRef.current?.validateFields()

          Modal.confirm({
            title: 'Budget Code Review',
            content: 'Are you sure?',
            onOk: async () => {
              try {
                await services.saveBudgetCodeReviews({
                  taskId: props.activityData?.taskId || '',
                  actionName: props.action,
                  comment: dataForm.comment,
                  payload: {
                    id: requisition?.id || 0,
                    items: items,
                    services: serviceItems
                  },
                  fileIds: files.map(it => it.response)
                })
                props.actionHandlers?.onCancel?.(true)
              } catch (error: any) {
                message.error(error?.message || 'Failed to submit.')
              }
            }
          })

        },
        onSetFiles: file => setFiles(v => (file)),
        onRemoveFile: file => setFiles(v => v.filter(it => it.uid !== file.uid)),
        onReset: () => {
          loadData()
          form.setFieldsValue({
            comment: undefined
          })
          setFiles([])
        }
      }}
    >
      <ProForm form={form} submitter={false}>
        <Card>

          {!requisition?.service && <EditableProTable<RequisitionItem>

            value={items}
            editableFormRef={editableFormRef}
            rowKey="key"
            size='small'
            recordCreatorProps={false}
            editable={{
              type: 'multiple',
              editableKeys: items?.map(it => it.key),
              onValuesChange: (_, recordList) => {
                setItems(recordList);
              },

            }}

            columns={[
              { title: 'No', width: 50, editable: false, dataIndex: 'seqNo' },
              { title: 'Item Code', width: 90, editable: false, dataIndex: 'itemCode' },
              { title: 'Item Name', editable: false, dataIndex: 'itemName' },
              { title: 'Description', editable: false, valueType: 'textarea', fieldProps: { rows: 1 }, dataIndex: 'description' },
              { title: 'Qty', align: 'right', width: 50, dataIndex: 'qty', editable: false, valueType: 'digit' },
              { title: 'UoM', width: 70, dataIndex: 'uom', editable: false },
              { title: 'Unit Price', align: 'right', width: 90, dataIndex: 'unitPrice', editable: false, renderText: (_, record,) => formatter.format(record.unitPrice) },
              { title: 'Amount', width: 100, align: 'right', editable: false, renderText: (_, record,) => formatter.format(record.amount) },
              {
                title: 'Budget.Code', width: 150, fieldProps: { showSearch: true }, dataIndex: 'budgetCode', valueType: 'select',
                valueEnum: _ => budgetCodeList.reduce((acc, cur) => ({ ...acc, [cur.code]: cur.code }), {}),
                formItemProps: { rules: [{ required: true }], }
              },
              { title: 'Remarks', editable: false, valueType: 'textarea', dataIndex: 'remarks', fieldProps: { rows: 1 }, width: 150, }
            ]}

          />}

          {requisition?.service && <EditableProTable<RequisitionService>
            value={serviceItems}
            rowKey="key"
            size='small'
            editableFormRef={editableFormRef}
            recordCreatorProps={false}
            editable={{
              type: 'multiple',
              editableKeys: serviceItems?.map(it => it.key),
              onValuesChange: (_, recordList) => {
                setServiceItems(recordList);
              },

            }}

            columns={[
              { title: 'No', width: 50, editable: false, dataIndex: 'seqNo' },
              { title: 'Service Name', editable: false, dataIndex: 'serviceName' },
              { title: 'Description', editable: false, valueType: 'text', dataIndex: 'description' },
              { title: 'Amount', align: 'right', editable: false, renderText: (_, record,) => formatter.format(record.amount), width: 155, fieldProps: { style: { width: 150 } } },
              {
                title: 'Budget.Code', width: 150, fieldProps: { showSearch: true, size: 'small' }, dataIndex: 'budgetCode', valueType: 'select',
                valueEnum: _ => budgetCodeList.reduce((acc, cur) => ({ ...acc, [cur.code]: cur.code }), {}),
                formItemProps: { rules: [{ required: true }], }
              },
              { title: 'Remarks', valueType: 'text', editable: false, dataIndex: 'remarks' },
            ]}

          />}
        </Card>

        <Card style={{ marginTop: 10, marginBottom: 10 }}>
          <ProFormTextArea rules={[{ required: props.action == 'Rejected' }]} label="Comment" name="comment" />
        </Card>
      </ProForm>
    </ActionFormWrapper>
  );
};
