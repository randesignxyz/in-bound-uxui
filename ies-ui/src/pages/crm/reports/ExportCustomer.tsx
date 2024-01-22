import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { Locations } from "@/services/crm/data";
import { CrmServiceAPI, InitCustomerParamsType } from "@/services/crm/services";
import { simpleRequestActions } from "@/services/model";
import { LookupData, LookupDataItem } from "@/services/data"
import { ProCard, ProForm, ProFormCheckbox, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { Moment } from "moment";
import { useForm } from "antd/lib/form/Form";

type InitType = {
    provinceList?: Locations[],
    regionList?: Locations[],
    seList?: LookupDataItem[],
    lookupDataList?: LookupData[];    
}

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
};

export default ({reportType, ...rest }: FormModalProps & {
    reportType?: 'export-customer' | 'customer-report'
}) => {

    const requestActions = simpleRequestActions();
    const crmServices = CrmServiceAPI(requestActions);

    const [data, setData] = useState<InitType>({})
    const [formElements, setFormElements] = useState<{ neverVisitDisable: boolean }>({
        neverVisitDisable: true
    })

    const [form] = useForm<{
        regionId?: number[];
        provinceId?: number[];
        salespersonId?: number[];
        customerTypeId?: number[];
        outletTypeId?: number[];
        source?: string[];
        status?: string[];
        neverVisit?: boolean;
        neverVisitDate?: Moment;
        hasNoPlan?: boolean;
        billingAddressOnly?: boolean;
    }>()

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

    const exportCustomer = async (
        regionId?: number[],
        provinceId?: number[],
        salespersonId?: number[],
        customerTypeId?: number[],
        outletTypeId?: number[],
        source?: string[],
        status?: string[],
        neverVisit?: boolean,
        neverVisitDate?: Moment,
        hasNoPlan?: boolean,
        billingAddressOnly?: boolean,
      ) => {
        await crmServices.exportCustomer({
          fileName: reportType ||'',
          reportName: reportType || '',
          type: 'EXCEL',
          data: {
            regionId,
            provinceId,
            salespersonId,
            customerTypeId,
            outletTypeId,
            source,
            status,
            neverVisit,
            neverVisitDate,
            hasNoPlan,
            billingAddressOnly
          },
        });
      };

    useEffect(() => {
        if(!rest.open) return 
        init()
        form.setFieldsValue({
            status: ['Y']
        })
    }, [rest.open])

    return <FormModalComp  {...rest} onResetForm={() => form.resetFields()}
    onSubmit={async () => {
        const dataForm = await form.validateFields()
        await exportCustomer(dataForm.regionId, 
            dataForm.provinceId, 
            dataForm.salespersonId, 
            dataForm.customerTypeId, 
            dataForm.outletTypeId, 
            dataForm.source, 
            dataForm.status, 
            dataForm.neverVisit, 
            dataForm.neverVisitDate, 
            dataForm.hasNoPlan,
            dataForm.billingAddressOnly
            )
    }}>
        <Spin spinning={requestActions.request?.loading}>

            <ProCard>
                <ProForm 
                    form={form} 
                    submitter={false} 
                    {...layout} 
                    layout="horizontal"
                    onValuesChange={(changedValues) => {
                        const {neverVisit} = changedValues
                        if('neverVisit' in changedValues){
                            setFormElements(v => ({...v, neverVisitDisable: !neverVisit}))
                        }
                    }}
                    >
                    <ProFormSelect label="Customer Type" name="customerTypeId"
                        allowClear
                        mode="multiple"
                        options={data?.lookupDataList?.filter(it => it.type == 'CUSTOMER_TYPE').map(it => {
                            return { value: it.id, label: it.name }
                        })}
                    />

                    <ProFormSelect
                        mode="multiple"
                        label="Region"
                        name="regionId"
                        allowClear
                        options={data?.regionList?.map(it => {
                            return { value: it.id, label: it.name };
                        })}
                    />
                    <ProFormSelect
                        mode="multiple"
                        label="Province"
                        name="provinceId"
                        allowClear
                        options={data?.provinceList?.map(it => {
                            return { value: it.id, label: it.name };
                        })}
                    />
                    <ProFormSelect
                        mode="multiple"
                        label="Salesperson"
                        name="salespersonId"
                        allowClear
                        showSearch
                        options={data?.seList?.map((it) => {
                            return { value: it.id, label: [it.code, it.name].join('-') };
                        })}
                    />
                    <ProForm.Item label="Billing Address Only">
                        <Space>
                            <ProFormCheckbox
                                labelAlign="right"
                                name="billingAddressOnly"
                            />
                        </Space>
                    </ProForm.Item>
                    <ProFormSelect
                        mode="multiple"
                        label="Status"
                        name="status"
                        width='md'
                        allowClear
                        options={[{ value: 'Y', label: "Active" }, { value: 'N', label: "Inactive" }]}
                    />
                    <ProForm.Item label="Never Visit">
                        <Space>
                            <ProFormCheckbox
                                labelAlign="right"
                                name="neverVisit"
                            />
                            <ProFormDateRangePicker disabled={formElements.neverVisitDisable} label="" name="neverVisitDate" />
                        </Space>
                    </ProForm.Item>
                    <ProForm.Item label="Has No Plan">
                        <Space>
                            <ProFormCheckbox
                                labelAlign="right"
                                name="hasNoPlan"
                            />
                        </Space>
                    </ProForm.Item>
                </ProForm>
            </ProCard>
        </Spin>
    </FormModalComp>


}