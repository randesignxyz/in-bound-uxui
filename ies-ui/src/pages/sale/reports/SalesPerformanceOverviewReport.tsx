import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { ProForm, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-components';
import { Card, Spin, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState } from 'react';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};

interface Props extends FormModalProps {
  salespersons: SalesTeamWorkLess[];
}

export default (props: Props) => {
  const requestActions = simpleRequestActions();
  const saleServices = SaleServiceAPI(requestActions);
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = useForm<{
    reportType?: string;
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
  }>();

  const onDowloadReportHandler = async () => {
    try {
      setLoading(true);
      const dataForm = await form.validateFields();
      console.log(dataForm);
      await saleServices.donwloadPOReport({
        fileName: 'performance-po-report',
        reportName: 'performance-po-report',
        type: 'EXCEL',
        data: {
          requestedDate: dataForm.requestedDate,
          salespersonCode: dataForm.salespersonCode,
        },
      });
      message.success('Report generated successfully.');
    } catch (error) {
      console.log(error);
      message.error('Failed to generated report.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <FormModalComp
        confirmLoading={loading}
        {...props}
        onResetForm={() => form.resetFields()}
        onSubmit={onDowloadReportHandler}
      >
        <Spin spinning={loading}>
          <Card>
            <ProForm submitter={false} layout="horizontal" {...layout} form={form}>
              <ProFormDateRangePicker
                rules={[{ required: true }]}
                label="Requested Date Start-End"
                name="requestedDate"
              />
              <ProFormSelect
                mode="multiple"
                label="Salespersons"
                name="salespersonCode"
                width="md"
                showSearch
                allowClear
                options={props.salespersons.map((it) => {
                  return {
                    value: it.salespersonCode,
                    label: it.salespersonCode.concat(' - ', it.salespersonName),
                  };
                })}
              />
            </ProForm>
          </Card>
        </Spin>
      </FormModalComp>
    </>
  );
};
