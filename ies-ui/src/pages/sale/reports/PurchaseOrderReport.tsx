import FormModalComp, { FormModalProps } from '@/components/FormModal';
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

  const [selectedReportType, setSelectedReportType] = useState('purchase_order');
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = useForm<{
    reportType?: string;
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
    status?: string[];
    supplier?: string;
  }>();

  const onFormvalueChanged = (changedValues: any) => {
    const { reportType } = changedValues;
    if (reportType && 'reportType' in changedValues) {
      setSelectedReportType(reportType);
    }
  };

  const onDowloadReportHandler = async () => {
    try {
      setLoading(true);
      const dataForm = await form.validateFields();
      console.log(dataForm);
      await saleServices.donwloadPOReport({
        fileName: selectedReportType,
        reportName: 'po-reports',
        type: 'EXCEL',
        data: {
          requestedDate: dataForm.requestedDate,
          salespersonCode: dataForm.salespersonCode,
          status: dataForm.status,
          reportType: selectedReportType,
          supplier: dataForm.supplier,
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
            <ProForm
              submitter={false}
              layout="horizontal"
              {...layout}
              form={form}
              onValuesChange={onFormvalueChanged}
            >
              <ProFormRadio.Group
                label="Report Type"
                name="reportType"
                rules={[{ required: true }]}
                initialValue={selectedReportType}
                options={[
                  { value: 'raw_purchase_order', label: 'Raw Purchase Order' },
                  { value: 'purchase_order', label: 'Purchase Order' },
                ]}
              />
              <ProFormDateRangePicker
                rules={[{ required: true }]}
                label="Requested Date Start-End"
                name="requestedDate"
              />
              <ProFormSelect
                // mode="multiple"
                label="Source of Supply"
                name="supplier"
                width="md"
                initialValue={'ALL'}
                options={['ALL', 'Distributors', 'Warehouse']}
              />
              <ProFormSelect
                mode="multiple"
                label="Status"
                name="status"
                width="md"
                showSearch
                allowClear
                options={['Pending', 'Loaded', 'Paid', 'Rejected']}
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
