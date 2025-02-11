import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Card, Spin, message } from 'antd';
import { Card, Spin, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState } from 'react';

// const layout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 18 },
// };

interface Props extends FormModalProps {
  salespersons: SalesTeamWorkLess[];
}

export default (props: Props) => {
  const requestActions = simpleRequestActions();
  const saleServices = SaleServiceAPI(requestActions);
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = useForm<{
    salespersonCode?: string[];
  }>();

  const onDowloadReportHandler = async () => {
    try {
      setLoading(true);
      const dataForm = await form.validateFields();
      console.log(dataForm);
      await saleServices.donwloadDSDLeadReport({
        fileName: 'customer-dsd-report',
        reportName: 'dsd-lead-report',
        type: 'EXCEL',
        data: {
          salespersonCode: dataForm.salespersonCode,
        },
      });
      message.success('Report generated successfully.');
    } catch (error) {
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
            <ProForm submitter={false} layout="horizontal" form={form}>
              <ProForm submitter={false} layout="horizontal" form={form}>
                <ProFormSelect
                  mode="multiple"
                  label="Salespersons"
                  name="salespersonCode"
                  // width="md"
                  showSearch
                  debounceTime={500}
                  options={props.salespersons.map((it) => {
                    return {
                      value: it.salespersonCode,
                      label: it.salespersonCode.concat(' - ', it.salespersonName),
                    };
                  })}
                  allowClear
                />
              </ProForm>
          </Card>
        </Spin>
      </FormModalComp>
    </>
  );
};
