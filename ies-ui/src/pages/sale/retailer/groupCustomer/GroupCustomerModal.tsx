
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, {
    ProFormCheckbox,
    ProFormText,
} from '@ant-design/pro-form';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { GroupCustomer } from '../customer/data';


interface Props extends FormModalProps {
    data?: GroupCustomer | any;
    onSave: (data: GroupCustomer) => void;
    actionType?: String;
    id?: string;
}

const GroupCustomerModal: React.FC<Props> = ({ onSave, data, actionType, id, ...props }) => {
    const [form] = useForm<GroupCustomer>();


    useEffect(() => {
        props.open && initFormData();
    }, [props.open]);

    const initFormData = () => {

        form.setFieldsValue({
            name: data?.name,
            id: data?.id,
            description: data?.description,
            isDefault: data?.isDefault,

        });
    };


    return (

        <FormModalComp
            width={'600px'}
            title="Customer Group"
            {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                if (data){
                    dataForm['id'] = data.id

                }
                onSave(dataForm);
            }}
            onResetForm={() => {
                form.resetFields();
            }}
        >

            <ProForm
                form={form}
                submitter={false}

            >
                <ProFormText label="Group name" name={"name"} rules={[{ required: true }]} />
                <ProFormText label="Description" name={"description"} />
                <ProFormCheckbox label="Is Default" name={"isDefault"} labelAlign="right" />


            </ProForm>


        </FormModalComp>
    );
};

export default GroupCustomerModal;
