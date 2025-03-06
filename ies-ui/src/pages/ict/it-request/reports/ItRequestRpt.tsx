import { getUrlReporting } from "@/pages/ReportUrl";
import { downloadGenericReport, downloadReport } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { useSafeState } from "ahooks";
import { message } from "antd";
import { useForm } from "antd/lib/form/Form";
import moment from "moment";
import { Moment } from "moment";
import { useEffect } from "react";

export default ({ trigger }: { trigger?: JSX.Element }) => {

  const [form] = useForm<{ requestDates: Moment[],status:string[] }>()
  const requestActions = simpleRequestActions()
  const [loading, setLoading] = useSafeState(false)
  const empStatusDS = [{name:'Pending',value:'PENDING'},{name:'Completed',value:'COMPLETED'},{name:'Rejected',value:'REJECTED'}]
  const onDowloadReportHandler = async () => {
    try {
      const dataForm = await form.validateFields();     
      // const raw = rawData? '_data':''
      const reportName = 'ict-it-request-report'
      setLoading(true)
      await downloadGenericReport(requestActions)({
          fileName: `${reportName}-${moment().format()}.xls`,
          type: 'EXCEL',
          data: {
              reportName: reportName,
              reportPath: getUrlReporting('ict'),
              data: [      
                  {key:'dateFrom', value: dataForm.requestDates[0], type:'dateTime'},
                  {key:'dateTo', value: dataForm.requestDates[1], type:'dateTime'},
                  ...(dataForm.status || []).map(it => ({ key: 'status', value: it })),                
                  // ...(dataForm.bu || []).map(it => ({ key: 'buIds', value: it })),
                  // ...(dataForm.department || []).map(it => ({ key: 'deptIds', value: it })),
              ]
          }
      }).then(()=>{
          setLoading(false)
      })
    } catch (error: any) {
      message.error(error.message || "Failed to generate report.")
      setLoading(false)
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
    title="IT Request Report"
    onFinish={async () => {
      await onDowloadReportHandler()
    }}
  >
    <ProFormDateRangePicker width={'lg'} label="Request Date" name={'requestDates'} rules={[{ required: true }]} />
    <ProFormSelect mode="multiple"  label="Status" name={'status'} showSearch  allowClear
                    options={empStatusDS?.map((it) => ({ label: it.name, value: it.value }))}
                />  
  </ModalForm>
}