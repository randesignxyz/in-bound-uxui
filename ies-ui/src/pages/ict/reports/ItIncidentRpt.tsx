import { downloadReport } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProFormDateRangePicker } from "@ant-design/pro-components"
import { message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Moment } from "moment";
import { useEffect } from "react";

export default ({ trigger }: { trigger?: JSX.Element }) => {

  const [form] = useForm<{ requestDates: Moment[] }>()
  const requestActions = simpleRequestActions()
  const onDowloadReportHandler = async () => {
    try {
      const dataForm = await form.validateFields();
      await downloadReport(requestActions)({
        fileName: 'ict-it-incident-report',
        reportName: 'ict-it-incident-report',
        type: 'EXCEL',
        data: { ...dataForm }
      })

      message.success('Report generated successfully.');
      return true
    } catch (error: any) {
      message.error(error.messsage || 'Failed to generated report.');
      return false
    }
  };

  useEffect(() => {
    return () => {
      form.resetFields()
    }
  }, [])

  return <ModalForm
    trigger={trigger}
    form={form}
    title="IT Incident Report"
    onFinish={async () => {
      await onDowloadReportHandler()
    }}
  >
    <ProFormDateRangePicker width={'lg'} label="Request Date" name={'requestDates'} rules={[{ required: true }]} />
  </ModalForm>
}