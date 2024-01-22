import { downloadReport } from "@/services/apiGateway"
import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProFormSelect } from "@ant-design/pro-components"
import { Button, Spin } from "antd"
import { useEffect, useState } from "react"
import { useForm } from "antd/es/form/Form"
import moment from "moment"
import { AppraisalRequestReportParams, AppraisalLookupData } from "../data.types"
import { createService } from "../services"

type DataFormType = {
    status?: string[],
    requestTypeId?: number[],
    appraisalPeriodId?: number[]
}

export default ({ trigger }: { trigger?: JSX.Element}) => {


    const requestActions = simpleRequestActions();
    const srv = createService(requestActions)
    const [form] = useForm<DataFormType>()
    const [requestType,setRequestType] = useState<AppraisalLookupData[]>()
    const [period,setPeriod] = useState<AppraisalLookupData[]>()

    useEffect(() => {
        (async () => {           
           const rs = await srv.fetchRequestTypeList()  
           setRequestType(rs)
           const year = await srv.fetchAppraisalPeriodList() 
           setPeriod(year) 
        })()
    }, [])


    return <ModalForm<DataFormType>          
        form={form}       
        trigger={trigger}
        title = "Performance Request Export"
        submitter = {{
            render(_, dom) {
                return [dom[0], <Button onClick={()=>{form.resetFields()}}>Reset</Button> , dom[1]]
            }
        }}       
        onFinish={async(dataForm: DataFormType)=>{
            await downloadReport<AppraisalRequestReportParams>(requestActions)({
                reportName: 'performance-review-request_by-criteria',
                fileName: `performance-review-request_list-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    status: dataForm.status,
                    appraisalPeriodId: dataForm.appraisalPeriodId,
                    requestTypeId: dataForm.requestTypeId
                }
            });
        
            return true
        }}
    >
        <Spin spinning ={requestActions.request?.loading}>
            <ProFormSelect showSearch allowClear rules={[{required:true}]} mode="multiple" name={"appraisalPeriodId"} label = "Annual" options={period?.map(it => ({label: it.label, value: it.value}))}/>
            <ProFormSelect showSearch allowClear mode="multiple" name={"status"} label = "Status" options={[            
                { label: "Pending", value: "PENDING" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Rejected", value: "REJECTED" },
            ]}/>
            <ProFormSelect showSearch allowClear mode="multiple" name={"requestTypeId"} label = "Request Type" options={requestType?.map(it => ({label: it.label, value: it.value}))}/>
        </Spin>  
    </ModalForm>
}