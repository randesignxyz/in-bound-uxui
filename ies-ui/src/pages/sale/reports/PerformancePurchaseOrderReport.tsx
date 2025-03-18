import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { ProForm, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-components';
import { Card, Spin, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
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
  // const [salesperson, setSalesperson] = useState<SalesTeamWorkLess[]>([]);

  //   const [selectedReportType, setSelectedReportType] = useState('sales_invoice');
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = useForm<{
    reportType?: string;
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
  }>();

  const onDowloadReportHandler = async () => {
    try {
      const dataForm = await form.validateFields()
      const reportName = 'performance-po-report'
      setLoading(true)
      await downloadGenericReport(requestActions)({
        fileName: `${reportName}-${moment().format()}.xls`,
        type: 'EXCEL',
        data: {
          reportName: reportName,
          reportPath: getUrlReporting('sale/dsd-reports'),
          data: [
            { key: 'startDate', value: dataForm.requestedDate?.[0], type: 'dateTime' },
            { key: 'endDate', value: dataForm.requestedDate?.[1], type: 'dateTime' },
            {key: 'salespersonCode', value: dataForm.salespersonCode?.join(',')}
          ]
        }
      }).then(() => {
        setLoading(false)
      })
    } catch (error: any) {
      message.error(error.message || "Failed to generate report.")
      setLoading(false)
    }
  }

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
            <ProForm
              submitter={false}
              layout="horizontal"
              {...layout}
              form={form}
            >
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
