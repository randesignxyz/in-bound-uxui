import board from "@/pages/delivery/board"
import { ModalForm, ProFormCheckbox, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/es/form/Form"
// import { WarehouseGroup } from "../data.types"
import { useEffect, useState } from "react"
import { simpleRequestActions } from "@/services/model"
import { createService } from "../services"
import { Button, Card, Dropdown, Flex, MenuProps, message, Space } from "antd"
import moment, { Moment } from "moment";
import { DownOutlined, FileExcelOutlined } from "@ant-design/icons"
import { downloadGenericReport } from "@/services/apiGateway"
import {getUrlReporting} from "@/pages/ReportUrl"
import { ProbationAssessmentList, ProbationFormType } from "../data.types"

type DataFormType = {
    requestedDate: moment.Moment[]
    status?: string[]
    formTypeId?: number[]
}

export default ({ trigger }: { trigger?: JSX.Element}) => {
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions });
    // const services = createService(requestActions);
    // const [warehouseGroupList, setWarehouseGroup] = useState<WarehouseGroup[]>([]);
    // const [probationAssessor,setProbationAssessor] = useState<ProbationAssessmentList[]>()
    const [probationFormType,setProbationFormType] = useState<ProbationFormType[]>()
    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useState(false)
    const statusDs = [{label:'Pending', value:'PENDING'},{label:'Completed', value:'COMPLETED'},{label:'Rejected', value:'REJECTED'}]

    const initData = async () => {
        srv.fetchProbationFormTypeList().then(rs => {
            setProbationFormType(rs)
        })
    };
    useEffect(() => {
        initData();
    }, []);
    const handleExport = async (e:any) => {
        try {
            const dataForm =  await form.validateFields()
            const reportName ='Probation Evaluation Report'
            setLoading(true)
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: 'probation-evaluation-report',
                    reportPath: getUrlReporting('hrm'),
                    data: [
                        {key:'dateFrom', value: dataForm.requestedDate?.[0], type:'dateTime'},
                        {key:'dateTo', value: dataForm.requestedDate?.[1], type:'dateTime'},
                        ...(dataForm.status || ['All']).map(it => ({ key: 'status', value: it })),
                        ...(dataForm.formTypeId || []).map(it => ({ key: 'formTypeId', value: it })),
                        {key:'startWithRole', value: 'ROLE_HR_PROBATION_EVALUATION'}
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
    const bnts = [
        <Button onClick={()=>{form.resetFields()}}>Reset</Button>,
        <Button loading={loading} icon={<FileExcelOutlined/>} onClick={handleExport}>Export</Button>
    ]

    return <ModalForm<DataFormType>
        trigger={trigger}
        title ={'Probation Evaluation Report'}
        form={form}
        modalProps={{maskClosable: false}}
        submitter = {{
            render(_, dom) {
                return [dom[0], ...bnts]
            }
        }}
    >
       <Card bordered>
        <Flex gap={2} vertical={true} style={{padding:0, width:'100%'}}>
            <Flex gap={5} style={{width:'100%'}}>
                <ProFormDateRangePicker label='Due Date' name={'requestedDate'}  rules={[{ required: true }]}  width="md"/>
                <div style={{width:'100%'}}>
                <ProFormSelect mode="multiple"  label="Status" name={'status'}  shouldUpdate allowClear
                    options={statusDs}
                /> </div>
            </Flex>
            <ProFormSelect style={{padding:0, width:'100%'}}
              shouldUpdate
              name={'formTypeId'}
              mode="multiple"
              rules={[{ required: false }]}
              width={'sm'}
              label="Job Level"
              options={probationFormType?.map((it) => ({ label: it.description, value: it.id }))}
            />
        </Flex>
        </Card>

    </ModalForm>
}
