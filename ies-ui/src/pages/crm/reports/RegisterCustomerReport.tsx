import { downloadReport } from "@/services/apiGateway";
import { Locations } from "@/services/crm/data";
import { CrmServiceAPI, InitCustomerParamsType } from "@/services/crm/services";
import { LookupData, LookupDataItem } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components";
import { message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Moment } from "moment";
import { useEffect, useState } from "react";

type InitType = {
    provinceList?: Locations[],
    regionList?: Locations[],
    seList?: LookupDataItem[],
    lookupDataList?: LookupData[];    
}

type DataFormType = {
    dates: Moment[]
    customerTypeIds?: number[]
    regionIds?: number[]
    provinceIds?: number[]
    salespersonIds?: number[]
}

export default ({ trigger }: { trigger?: JSX.Element }) => {

    const [form] = useForm<DataFormType>()
    const requestActions = simpleRequestActions()
    const crmServices = CrmServiceAPI(requestActions);
    const [data, setData] = useState<InitType>({})
    const onDowloadReportHandler = async () => {
        try {
            const dataForm = await form.validateFields();
            await downloadReport(requestActions)({
                fileName: 'crm-posm-monitoring-report',
                reportName: 'crm-posm-monitoring-report',
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


    const init = async () => {
        const detailParams: InitCustomerParamsType[] = [
            { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
            { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
            { actionName: 'sale', responseKey: 'seList', payload: {} },
            {
                actionName: 'lookupDataList',
                payload: {
                    list: [
                        'CUSTOMER_STATUS',
                        'CUSTOMER_TYPE',
                        'CUSTOMER_DIVISION'
                    ],
                },
            },
        ];

        const rs = await crmServices.initCustomerData(detailParams) as InitType;
        setData(rs)
    }

    useEffect(() => {
        init()
        return ()=> {
            form.resetFields()
        }
    }, [])

    return <ModalForm
        trigger={trigger}
        form = {form}
        title="Register Customer List"
        onFinish={async () => {
            await onDowloadReportHandler()
        }}
    >
        <ProFormDateRangePicker
            rules={[{ required: true }]}
            width="md"
            label="Date"
            name="dates"
        />
        <ProFormSelect label="Customer Type" name="customerTypeIds"
            allowClear
            mode="multiple"
            options={data?.lookupDataList?.filter(it => it.type == 'CUSTOMER_TYPE').map(it => {
                return { value: it.id, label: it.name }
            })}
        />

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
        />
    </ModalForm>
}