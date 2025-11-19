import { CrmService, CrmServiceAPI } from "@/services/crm/services";
import { LookupData, LookupDataItem } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import { SaleServiceAPI } from "@/services/sale/services";
import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useQuery } from "@umijs/max";
import { useForm } from "antd/lib/form/Form"
import { log } from "console";
import React from "react"


interface Props extends ModalFormProps {
    onExport :(data?:any)=>void
}
const ExportModal: React.FC<Props> = ({ onExport,...props }) => {
    const [form] = useForm<any>();
    const requestActions = simpleRequestActions();
    const crmServices = CrmServiceAPI();

    const { data, isFetching } = useQuery(['cust-veri-advance-search-init-data'], () => crmServices.initCustomerData([

        { actionName: 'sale', responseKey: 'seList', payload: {} },
        {
            actionName: 'lookupDataList',
            payload: {
                list: [
                    'VERIFIED_ADDRESS_LAT_LONG',
                ],
            },
        },
    ]) as Promise<{
        lookupDataList?: LookupData[];
        seList?: LookupDataItem[];
    }>, { refetchOnWindowFocus: false })
    return (
        <ModalForm
            {...props}
            title={"Export Verification"}
            form ={form}
            labelAlign="left"
            layout="horizontal"
            labelCol={{span:5}}
            width={600}
            loading={isFetching}
            onFinish={async(rec)=>{
                onExport?.(rec)
            }}
        >
            <ProFormDateRangePicker
                name="date"
                label="Date"
                width="md"
            />
            <ProFormSelect
                name={"sale"}
                label="Sale Executive"
                showSearch
                mode="multiple"
                options={data?.seList?.map(o=>({value:o.code, label:o.name}))}
            />
            <ProFormSelect
                name={"status"}
                label={"Status"}
                showSearch
                mode="multiple"
                options={data?.lookupDataList?.map(o=>({value:o.id, label:o.name}))}
            />

        </ModalForm>
    )
}

export default ExportModal