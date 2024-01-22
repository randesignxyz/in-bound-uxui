import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { BasicData, CustomerView, outletType } from "@/services/crm/data";
import { LookupData, LookupDataItem } from "@/services/data";
import { ProCard, ProForm } from "@ant-design/pro-components";
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";
import BasicEntryForm from "./BasicEntryForm";


const layout = {
    labelCol: { span: 11 },
    wrapperCol: { span: 13 },
};

interface EditProps extends FormModalProps {
    layoutConfig: {
        supplySource?: boolean;
    };
    editData?: BasicData;
    init?: {
        outletTypeList?: outletType[];
        lookupDataList?: LookupData[];
        seList?: LookupDataItem[];
        supplySourceList?: LookupDataItem[];
    };
    actionHandlers?: {
        onSave?: (data: BasicData) => void;
    };
}

export default ({ editData, actionHandlers, layoutConfig, init, ...rest }: EditProps) => {

    const [form] = useForm<BasicData>();

    const onValuesChangeHandlers = (changedValues: any, values: BasicData) => {
        const { outletTypeId } = changedValues;

        if (outletTypeId || 'outletTypeId' in changedValues) {
            const outlet = init?.outletTypeList?.find((it) => it.id == outletTypeId);
            form.setFieldsValue({
                mainChannel: outlet?.mainChannel,
                subChannel: outlet?.subChannel,
            });
        }
    };

    useEffect(() => {
        if(!rest.open) return
        const outlet = init?.outletTypeList?.find((it) => it.id == editData?.outletTypeId);
        form.setFieldsValue({
            ...editData,
            id: editData?.id,
            mainChannel: outlet?.mainChannel,
            subChannel: outlet?.subChannel,
        });

        return ()=> form.resetFields()
    }, [rest.open])

    return <FormModalComp
        {...rest}
        okText="Edit"
        title= {`Edit Customer`}
        onResetForm={() => form.setFieldsValue({ ...editData })}
        onSubmit={async () => {
            const dataForm = await form.validateFields();
            actionHandlers?.onSave?.({...dataForm, id: editData?.id});
        }}
    >
        <ProCard boxShadow size="small">
            <ProForm
                layout="horizontal"
                {...layout}
                submitter={false}
                form={form}
                onValuesChange={onValuesChangeHandlers}
            >
                <BasicEntryForm layoutConfig={layoutConfig} {...init} />
            </ProForm>
        </ProCard>
    </FormModalComp>
}