import FormModalComp, { FormModalProps } from '@/components/FormModal';
import NoFoundPage from '@/pages/404';
import { ProForm } from '@ant-design/pro-components';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};

export default (props: FormModalProps) => {
  // const requestActions = simpleRequestActions();

  const [form] = useForm<{
    reportType?: string;
    salespersonCode?: string[];
    requestedDate?: moment.Moment[];
  }>();

  useEffect(() => {
    (async () => {
      // const salesTeam = await services.salespersonList();
      // setSalesperson(salesTeam.filter((it) => it.isApprover === false));
    })();
  }, []);

  const onFormvalueChanged = (changedValues: any) => {
    // const { reportType } = changedValues;
    // if (reportType && 'reportType' in changedValues) {
    //   setSelectedReportType(reportType);
    // }
  };

  const onDowloadReportHandler = async () => {
    // try {
    //   const dataForm = await form.validateFields();
    //   console.log(dataForm);
    //   await saleServices.donwloadDSDReport({
    //     fileName: 'dsd-reports',
    //     reportName: 'dsd-reports',
    //     type: 'EXCEL',
    //     data: {
    //       reportType: dataForm.reportType!!,
    //       requestedDate: dataForm.requestedDate,
    //       salespersonCode: dataForm.salespersonCode,
    //     },
    //   });
    //   message.success('Report generated successfully.');
    // } catch (error) {
    //   message.error('Failed to generated report.');
    // }
    if (props !== undefined && props.onCancel !== undefined) props.onCancel();
  };
  return (
    <>
      <FormModalComp
        // confirmLoading={requestActions.request?.loading}
        {...props}
        onResetForm={() => form.resetFields()}
        onSubmit={onDowloadReportHandler}
      >
        <Card>
          <ProForm
            submitter={false}
            layout="horizontal"
            {...layout}
            form={form}
            onValuesChange={onFormvalueChanged}
          >
            <NoFoundPage
              title="Report Purchase Order"
              subTitle="This page is unde construction."
              onBack={props.onCancel}
            />
          </ProForm>
        </Card>
        {/* <Spin spinning={requestActions.request?.loading}>  </Spin> */}
      </FormModalComp>
    </>
  );
};
