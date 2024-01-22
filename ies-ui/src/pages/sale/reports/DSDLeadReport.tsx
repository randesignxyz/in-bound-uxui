import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Card, message, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState } from 'react';
// import { useState } from 'react';
// import { DSDReportAPI } from './service';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};

interface Props extends FormModalProps {
  salespersons: SalesTeamWorkLess[];
}

export default (props: Props) => {
  const requestActions = simpleRequestActions();
  //   const services = DSDReportAPI(requestActions);
  const saleServices = SaleServiceAPI(requestActions);
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = useForm<{
    salespersonCode?: string[];
  }>();

  //   useEffect(() => {
  //     (async () => {
  //       const salesTeam = await services.salespersonList();
  //       setSalesperson(salesTeam.filter((it) => it.isApprover === false));
  //     })();
  //   }, []);

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
            <ProForm submitter={false} layout="horizontal" {...layout} form={form}>
              <ProFormSelect
                mode="multiple"
                label="Salesperson"
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
