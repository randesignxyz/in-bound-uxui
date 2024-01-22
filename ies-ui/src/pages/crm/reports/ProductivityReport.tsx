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

const ProductivityReport: React.FC<FormModalProps> = ({ ...props }) => {
  const requestActions = simpleRequestActions();
  const crmServices = CrmServiceAPI(requestActions);
  const [state, setState] = useState<{
    seList?: LookupDataItem[];
    divisions?: { id: number; name: string }[];
    regions?: { id: number; name: string }[];
  }>();

  const [form] = useForm<{
    // scheduleType?: string[];
    region?: number[];
    division?: number[];
    salespersonId?: number[];
    scheduleDate?: moment.Moment[];
  }>();

  useEffect(() => {
    if (!props.open) return;

    const params: InitVisitScheduleParamsType[] = [
      { actionName: 'sale', responseKey: 'seList', payload: {} },
      { actionName: 'division', responseKey: 'divisions', payload: {} },
      { actionName: 'region', responseKey: 'regions', payload: {} },
    ];
    crmServices
      .initVisitScheduleData(params)
      .then(
        (it: {
          seList?: LookupDataItem[];
          divisions?: { id: number; name: string }[];
          regions?: { id: number; name: string }[];
        }) => {
          setState({
            ...state,
            seList: it.seList,
            divisions: it.divisions,
            regions: it.regions,
          });
        },
      );
  }, [props.open]);

  const onDowloadReportHandler = async () => {
    try {
      const dataForm = await form.validateFields();

      await crmServices.downloadPosmReport({
        fileName: 'productivity-report',
        reportName: 'productivity-report',
        type: 'EXCEL',
        data: {
          salespersonId: dataForm.salespersonId,
          //   scheduleType: dataForm.scheduleType,
          scheduleDate: dataForm.scheduleDate,
          divisionId: dataForm.division,
          regionId: dataForm.region,
        },
      });
      message.success('Report generated successfully.');
    } catch (error) {
      message.error('Failed to generated report.');
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
              label="Region"
              name="region"
              width="md"
              allowClear
              options={state?.regions?.map((it) => {
                return { value: it.id, label: it.name };
              })}
            />
            <ProFormSelect
              mode="multiple"
              label="Division"
              name="division"
              width="md"
              allowClear
              options={state?.divisions?.map((it) => {
                return { value: it.id, label: it.name };
              })}
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

export default ProductivityReport;
