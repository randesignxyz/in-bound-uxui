import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { CrmServiceAPI, InitVisitScheduleParamsType } from '@/services/crm/services';
import { LookupDataItem } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import ProForm, { ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { Card, message, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const PosmReport: React.FC<FormModalProps> = ({ ...props }) => {
  const requestActions = simpleRequestActions();
  const crmServices = CrmServiceAPI(requestActions);
  const [state, setState] = useState<{ seList?: LookupDataItem[] }>();

  const [form] = useForm<{
    scheduleType?: string[];
    salespersonId?: number[];
    scheduleDate?: moment.Moment[];
  }>();

  useEffect(() => {
    if (!props.open) return;

    const params: InitVisitScheduleParamsType[] = [
      { actionName: 'sale', responseKey: 'seList', payload: {} },
    ];
    crmServices.initVisitScheduleData(params).then((it: { seList?: LookupDataItem[] }) => {
      setState({
        seList: it.seList,
      });
    });
  }, [props.open]);

  const onDowloadReportHandler = async () => {
    try {
      const dataForm = await form.validateFields();

      await crmServices.downloadPosmReport({
        fileName: 'posm-report',
        reportName: 'posm-report',
        type: 'EXCEL',
        data: {
          salespersonId: dataForm.salespersonId,
          scheduleType: dataForm.scheduleType,
          scheduleDate: dataForm.scheduleDate,
        },
      });
      message.success('Report generated successfully.');
    } catch (error: any) {
      message.error(error.message || 'Failed to generated report.');
    }
  };

  return (
    <FormModalComp
      confirmLoading={requestActions.request?.loading}
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={onDowloadReportHandler}
    >
      <Spin spinning={requestActions.request?.loading}>
        <Card>
          <ProForm submitter={false} layout="horizontal" {...layout} form={form}>
            <ProFormDateRangePicker
              rules={[{ required: true }]}
              width="md"
              label="Schedule Date"
              name="scheduleDate"
            />
            <ProFormSelect
              mode="multiple"
              label="Type"
              name="scheduleType"
              width="md"
              allowClear
              options={[
                { value: 'Planned', label: 'Planned' },
                { value: 'Manual', label: 'Manual' },
              ]}
            />
            <ProFormSelect
              mode="multiple"
              label="Salesperson"
              name="salespersonId"
              width="md"
              showSearch
              allowClear
              options={state?.seList?.map((it) => {
                return { value: it.id, label: it.code?.concat(' - ', it.name) };
              })}
            />
          </ProForm>
        </Card>
      </Spin>
    </FormModalComp>
  );
};

export default PosmReport;
