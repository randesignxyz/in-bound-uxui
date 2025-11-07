import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
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

  const [selectedReportType, setSelectedReportType] = useState('sales_invoice');
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = useForm<{
    reportType?: string;
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
  }>();

  const onFormvalueChanged = (changedValues: any) => {
    const { reportType } = changedValues;
    if (reportType && 'reportType' in changedValues) {
      setSelectedReportType(reportType);
    }
  };

  // const onDowloadReportHandler = async () => {
  //   try {
  //     setLoading(true);
  //     const dataForm = await form.validateFields();
  //     // console.log(dataForm);
  //     await saleServices.donwloadDSDReport({
  //       fileName: selectedReportType,
  //       reportName: 'dsd-reports',
  //       type: 'EXCEL',
  //       data: {
  //         reportType: dataForm.reportType!!,
  //         requestedDate: dataForm.requestedDate,
  //         salespersonCode: dataForm.salespersonCode,
  //       },
  //     });
  //     message.success('Report generated successfully.');
  //   } catch (error) {
  //     message.error('Failed to generated report.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const onDowloadReportHandler = async () => {
      try {
        const dataForm = await form.validateFields()
        const reportName = dataForm.reportType||""
        setLoading(true)
        await downloadGenericReport(requestActions)({
          fileName: `${reportName}-${moment().format()}.xls`,
          type: 'EXCEL',
          data: {
            reportName: reportName,
            reportPath: getUrlReporting('sfa'),
            data: [
              { key: 'startDate', value: dataForm.requestedDate?.[0], type: 'dateTime' },
              { key: 'endDate', value: dataForm.requestedDate?.[1], type: 'dateTime' },
              {key: 'saleCode', value: dataForm.salespersonCode?.join(','), type:"string"}
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
              labelAlign='left'
              form={form}
              onValuesChange={onFormvalueChanged}
            >
              
              <ProFormRadio.Group
                label="Invoice Type"
                name="reportType"
                radioType='button'
                width={'md'}
                rules={[{ required: true }]}
                initialValue={"sale_invoice"}
                options={[
                  { value: 'sale_raw_invoice', label: 'Raw Sales Invoice' },
                  { value: 'sale_invoice', label: 'Sales Invoice' },
                  { value: 'sale_item_invoice', label: 'Sales Items Invoice' },
                ]}
              />
              <ProFormDateRangePicker
                rules={[{ required: true }]}
                label="Invoiced Date Start-End"
                width={"md"}
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
