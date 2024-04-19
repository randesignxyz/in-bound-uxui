import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { ProForm, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-components';
import { Card, Spin, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { join } from 'lodash';
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
    visitedDates?: moment.Moment[];
    salespersonCodes?: string[];
  }>();

  const onFormvalueChanged = (changedValues: any) => {
    console.log(changedValues);
    // const { reportType } = changedValues;
    // if (reportType && 'reportType' in changedValues) {
    //   setSelectedReportType(reportType);
    // }
  };

  const onDowloadReportHandler = async () => {
    try {
      setLoading(true);
      const dataForm = await form.validateFields();
      console.log(dataForm);
      await saleServices.donwloadDSDVisitReport({
        fileName: 'visit-report',
        reportName: 'dsd-visit-report',
        type: 'EXCEL',
        data: {
          visitedDates: dataForm.visitedDates,
          salespersonCodes: dataForm.salespersonCodes,
        },
      });
      message.success('Report generated successfully.');
    } catch (error) {
      message.error('Failed to generated report.');
    } finally {
      setLoading(false);
    }
    //if (props !== undefined && props.onCancel !== undefined) props.onCancel();
  };
  return (
    <>
      <FormModalComp
        // confirmLoading={requestActions.request?.loading}
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
              <ProFormDateRangePicker
                rules={[{ required: true }]}
                label="Visit Date Start-End"
                name="visitedDates"
              />
              <ProFormSelect
                mode="multiple"
                label="Salesperson"
                name="salespersonCodes"
                width="md"
                showSearch
                allowClear
                options={props.salespersons.map((it) => {
                  return {
                    value: it.salespersonCode,
                    label: join([it.salespersonCode, it.salespersonName], ' - '),
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
