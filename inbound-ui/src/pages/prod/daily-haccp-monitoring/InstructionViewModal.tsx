import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProForm, ProTable } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { useForm } from 'antd/lib/form/Form';
import { HACCPMonitoringInstruction } from './data';
import { simpleRequestActions } from '@/services/model';
import { DailyHACCPMonitoringServiceAPI } from './service';

interface Props extends FormModalProps {
    // onSave: (data: HACCPMonitoringInstruction) => void;
    // isEdit?:boolean
    // defaultVal?:string
    group_line: string
}
export default ({ group_line, ...props }: Props) => {
    const [form] = useForm<HACCPMonitoringInstruction>();
    const [data, setData] = useState();
    const requestActions = simpleRequestActions();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);

    useEffect(() => {
        form.resetFields()
        const getData = async () => {
            const data = await services.get_instruction(group_line)
            setData(data)
        }
        getData()
    }, [props.open]);

    return (
        <FormModalComp
            title="Instruction"
            {...props}
            width={'800px'}
            // onSubmit={async () => {
            //     const dataForm = await form.validateFields();
            //     onSave(dataForm)
            // }}
            readOnly
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <ProTable<HACCPMonitoringInstruction>
                    size="small"
                    search={false}
                    rowKey="id"
                    dataSource={data}
                    options={{
                        density: false,
                        fullScreen: false,
                        reload: false,
                        setting: false,
                    }}
                    pagination={false}
                    columns={[
                        {
                            title: 'No',
                            render: (_, r, index) => index + 1
                        },
                        {
                            title: 'Instruction',
                            dataIndex: 'instruction',
                        }
                    ]}
                />
            </ProForm>
        </FormModalComp>
    );
};
