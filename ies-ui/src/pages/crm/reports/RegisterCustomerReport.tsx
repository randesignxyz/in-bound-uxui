import { getUrlReporting } from "@/pages/ReportUrl";
import { downloadGenericReport, downloadReport } from "@/services/apiGateway";
import { Locations } from "@/services/crm/data";
import { CrmServiceAPI, InitCustomerParamsType } from "@/services/crm/services";
import { LookupData, LookupDataItem } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components";
import { message } from "antd";
import { useForm } from "antd/lib/form/Form";
import moment from "moment";
import { Moment } from "moment";
import { useEffect, useState } from "react";

type InitType = {
    provinceList?: Locations[],
    regionList?: Locations[],
    seList?: LookupDataItem[],
    lookupDataList?: LookupData[];    
}

type DataFormType = {
    requestedDate: Moment[]
    status: string[]
    // customerTypeIds?: number[]
    // regionIds?: number[]
    // provinceIds?: number[]
    // salespersonIds?: number[]
}

export default ({ trigger }: { trigger?: JSX.Element }) => {

    const [form] = useForm<DataFormType>()
    const [loading, setLoading] = useState(false)
    const requestActions = simpleRequestActions()
    // const crmServices = CrmServiceAPI(requestActions);
    // const [data, setData] = useState<InitType>({})
    const statusOpts = [
        { label: 'Draft', value: 'DRAFT' }, 
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Canceled', value: 'CANCELED' }
    ]

    const onDowloadReportHandler = async () => {
        try {
            const dataForm = await form.validateFields();
            // await downloadReport(requestActions)({
            //     fileName: 'crm-posm-monitoring-report',
            //     reportName: 'crm-posm-monitoring-report',
            //     type: 'EXCEL',
            //     data: { ...dataForm }
            // })
            console.log(dataForm);
            

            message.success('Report generated successfully.');
            return true
        } catch (error: any) {
            message.error(error.messsage || 'Failed to generated report.');
            return false
        }
    };

    const handleExport = async (e:any) => {
            try {           
                const dataForm =  await form.validateFields()  
                  console.log(dataForm);
                const reportName ='Register Customer List Report'
                setLoading(true)
                await downloadGenericReport(requestActions)({
                    fileName: `${reportName}-${moment().format()}.xls`,
                    type: 'EXCEL',
                    data: {
                        reportName: 'crm_register_customer_list',
                        reportPath: getUrlReporting('crm'),
                        data: [    
                            {key:'dateFrom', value: dataForm.requestedDate?.[0], type:'dateTime'},  
                            {key:'dateTo', value: dataForm.requestedDate?.[1], type:'dateTime'},                       
                            ...(dataForm.status || []).map(it => ({ key: 'status', value: it })),                
                            // ...(dataForm.formTypeId || []).map(it => ({ key: 'formTypeId', value: it })),
                            // {key:'startWithRole', value: 'ROLE_HR_PROBATION_EVALUATION'}
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


    // const init = async () => {
    //     const detailParams: InitCustomerParamsType[] = [
    //         { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
    //         { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
    //         { actionName: 'sale', responseKey: 'seList', payload: {} },
    //         {
    //             actionName: 'lookupDataList',
    //             payload: {
    //                 list: [
    //                     'CUSTOMER_STATUS',
    //                     'CUSTOMER_TYPE',
    //                     'CUSTOMER_DIVISION'
    //                 ],
    //             },
    //         },
    //     ];

    //     const rs = await crmServices.initCustomerData(detailParams) as InitType;
    //     setData(rs)
    // }

    // useEffect(() => {
    //     init()
    //     return ()=> {
    //         form.resetFields()
    //     }
    // }, [])

    return <ModalForm
        trigger={trigger}
        form = {form}
        title="Register Customer List"
        onFinish={handleExport}
    >
        <ProFormDateRangePicker
            rules={[{ required: true }]}
            width="md"
            label="Requested Date"
            name="requestedDate"
        />
        <ProFormSelect label="Status" name="status"

            allowClear
            mode="multiple"
            options={statusOpts.map(it => {
                return { value: it.value, label: it.label }
            })}
        />
{/* 
        <ProFormSelect
            mode="multiple"
            label="Region"
            name="regionIds"
            allowClear
            options={data?.regionList?.map(it => {
                return { value: it.id, label: it.name };
            })}
    />
        <ProFormSelect
            mode="multiple"
            label="Province"
            name="provinceIds"
            allowClear
            options={data?.provinceList?.map(it => {
                return { value: it.id, label: it.name };
            })}
        />
        <ProFormSelect
            mode="multiple"
            label="Salesperson"
            name="salespersonIds"
            allowClear
            showSearch
            options={data?.seList?.map((it) => {
                return { value: it.id, label: [it.code, it.name].join('-') };
            })}
        /> */}
    </ModalForm>
}
