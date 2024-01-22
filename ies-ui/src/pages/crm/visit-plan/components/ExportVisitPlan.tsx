import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { Locations } from "@/services/crm/data";
import { LookupDataItem } from "@/services/data"
import ProForm, { ProFormSelect } from "@ant-design/pro-form"
import { Card } from "antd";
import { useForm } from "antd/lib/form/Form";

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 19 },
};


interface Props extends FormModalProps {
    salespersonList: LookupDataItem[];
    provinceList: Locations[];
    regionList: Locations[];
    onExport: (regionId?: number[], provinceId?: number[], salespersonId?: number[]) => Promise<void>
}

const ExportVisitPlan: React.FC<Props> = ({ salespersonList, regionList, provinceList, onExport, ...props }) => {

    const [form] = useForm<{ regionId?: number[]; provinceId?: number[]; salespersonId?: number[] }>()

    return (
        <FormModalComp {...props}
            onSubmit={async () => {
                const data = await form.validateFields()
                await onExport(data.regionId, data.provinceId, data.salespersonId)
            }}
            onResetForm={() => form.resetFields()}
        >
            <Card size="small">
                <ProForm submitter={false} {...layout} layout="horizontal" form={form}>
                    <ProFormSelect
                        mode="multiple"
                        label="Region"
                        name="regionId"
                        allowClear
                        options={regionList?.map(it => {
                            return { value: it.id, label: it.name };
                        })}
                    />
                    <ProFormSelect
                        mode="multiple"
                        label="Province"
                        name="provinceId"
                        allowClear
                        options={provinceList?.map(it => {
                            return { value: it.id, label: it.name };
                        })}
                    />
                    <ProFormSelect
                        mode="multiple"
                        label="Salesperson"
                        name={'salespersonId'}
                        options={salespersonList.map(it => (
                            { value: it.id, label: [it.code, it.name].filter(it => it).join("-") }
                        ))}
                    />
                </ProForm>
            </Card>
        </FormModalComp>
    )
}

export default ExportVisitPlan