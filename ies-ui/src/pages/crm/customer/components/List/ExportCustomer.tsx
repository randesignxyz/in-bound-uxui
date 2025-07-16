import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { Locations, outletType } from "@/services/crm/data";
import { CrmServiceAPI } from "@/services/crm/services";
import { LookupData, LookupDataItem } from "@/services/data";
import ProForm, { ProFormCheckbox, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-form"
import { useQuery } from "@umijs/max";
import { Card, Space } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Moment } from "moment";
import { useState } from "react";

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 19 },
};

interface Props extends FormModalProps {
    lookupDataList: LookupData[];
    outletTypeList: outletType[];
    seList: LookupDataItem[];
    provinceList: Locations[];
    regionList: Locations[];

    onExport: (
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
    ) => Promise<void>;
}

const ExportCustomer: React.FC<Props> = ({
    lookupDataList,
    outletTypeList,
    seList,
    provinceList,
    regionList,
    onExport,
    ...props
}) => {
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
    }>()

    const [formElements, setFormElements] = useState<{ neverVisitDisable: boolean }>({
        neverVisitDisable: true
    })
    const crmServices = CrmServiceAPI();
    const { data, isFetching } = useQuery(['cust-advance-search-init-data'], () => crmServices.initCustomerData([
        { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
        { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
        { actionName: 'outletTypeList', payload: {} },
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
    ]) as Promise<{
        regionList?: Locations[]
        provinceList?: Locations[];
        outletTypeList?: outletType[];
        lookupDataList?: LookupData[];
        seList?: LookupDataItem[];
    }>, { refetchOnWindowFocus: false })

    return (
        <FormModalComp
            {...props}
            onResetForm={() => form.resetFields()}
            onSubmit={async () => {
                const dataForm = await form.validateFields()
                await onExport(dataForm.regionId,
                    dataForm.provinceId,
                    dataForm.salespersonId,
                    dataForm.customerTypeId,
                    dataForm.outletTypeId,
                    dataForm.source,
                    dataForm.status,
                    dataForm.neverVisit,
                    dataForm.neverVisitDate,
                    dataForm.hasNoPlan
                )
            }}
        >
            <Card>
                <ProForm form={form}
                    initialValues={{
                        status: ['Y']
                    }} {...layout}
                    layout="horizontal"
                    onValuesChange={(changedValues) => {
                        const { neverVisit } = changedValues
                        if ('neverVisit' in changedValues) {
                            setFormElements(v => ({ ...v, neverVisitDisable: !neverVisit }))
                        }

                    }}
                    submitter={false}>
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
            </Card>
        </FormModalComp>
    )
}

export default ExportCustomer