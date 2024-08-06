import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { EditableFormInstance, EditableProTable, ProForm, ProFormDateRangePicker, ProFormSelect, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
// import { DailyWaterTreatmentMachineServiceAPI } from './service';
// import { AssignDailyWaterTreatment, DailyWaterTreatmentMachine } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, DatePicker, Row, Typography, message } from 'antd';
import { EmployeeServices } from '@/pages/hrm/services';
import { Moment } from 'moment';
import moment from 'moment';
import { DailyPreWaterTreatmentServiceAPI } from './service';
import { DailyPreWaterTreatment, DailyPreWaterTreatmentControl } from './data';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
    onSave: (data: DailyPreWaterTreatment) => void;
}
export default ({ onSave, ...props }: Props) => {
    // const [form] = useForm<{ remarks: string }>();
    const { Text } = Typography;
    const [form] = useForm<DailyPreWaterTreatment>();
    const requestActions = simpleRequestActions();
    const services = DailyPreWaterTreatmentServiceAPI(requestActions);
    const editableFormRef = useRef<EditableFormInstance>();
    const [control, setControl] = useState<DailyPreWaterTreatmentControl[]>([])
    const [date, setDate] = useState<Moment>(moment());
    const [exited, setExited] = useState(0)
    const [typeValue, setTypeValue] = useState(1)
    const [assignTo, setAssignTo] = useState('')
    const [time, setTime] = useState('')
    const [typeLable, setTypeLable] = useState('Water Treatment Plant 2')

    useEffect(() => {
        form.resetFields()
    }, [props.open]);

    useEffect(() => {
        if (props.open) {
            const getMachine = async () => {
                const data = await services.getControl(typeValue)
                setControl(data)
            }
            getMachine()
        }

    }, [props.open, typeValue]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'800px'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const startDate = moment(dataForm.assign_date[0]);
                const endDate = moment(dataForm.assign_date[1]);
                let current = moment(startDate);
                const end = moment(endDate);

                const item = []
                while (current.isSameOrBefore(end)) {
                    current = current.add(1, 'day');
                    for (let i = 0; i < time.length; i++) {
                        const entity = {
                            ...dataForm,
                            pretreatmentlist: control.map((m) => ({ ...m, assign_to_user: assignTo })),
                            assign_date: current,
                            pre_treatment_type: typeLable,
                            assign_to: assignTo,
                            time: time[i],
                            activities: [{ action: "Assign to " + `${dataForm.assign_to}` }],
                        }
                        item.push(entity)
                    }
                }
                onSave(item)
                // console.log(entity)

            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormSelect
                                // request={async ({ keyWords }) => {
                                //     const data = await EmployeeServices.list({
                                //         criteria: {
                                //             searchValue: keyWords,
                                //             advanceSearch: {
                                //                 status: 'ACTIVE',
                                //             },
                                //         },
                                //     }).query(requestActions);

                                //     return data.items.map((obj) => ({
                                //         value: obj.userId,
                                //         label: `${obj.firstName + ' ' + obj.lastName} `,
                                //     }));
                                // }}
                                options={[
                                    {
                                        value: 'prodadm',
                                        label: 'prodadm',
                                    },
                                    {
                                        value: 'prod1',
                                        label: 'prod1',
                                    },
                                    {
                                        value: 'prod2',
                                        label: 'prod2',
                                    }
                                ]}
                                showSearch
                                mode="multiple"
                                name="assign_to"
                                label="Assign To"
                                rules={[{ required: true }]}
                                fieldProps={{
                                    onChange: (value: any) => {
                                        const assignToString = value.join(' ');
                                        const finalValues = { ...value, assign_to: assignToString };
                                        setAssignTo(finalValues.assign_to)
                                    },
                                }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                options={[
                                    {
                                        value: '7:00',
                                        label: '7:00',
                                    },
                                    {
                                        value: '11:00',
                                        label: '11:00',
                                    },
                                    {
                                        value: '15:00',
                                        label: '15:00',
                                    },
                                    {
                                        value: '19:00',
                                        label: '19:00',
                                    },
                                    {
                                        value: '23:00',
                                        label: '23:00',
                                    },
                                    {
                                        value: '3:00',
                                        label: '3:00'
                                    }
                                ]}
                                fieldProps={{
                                    onChange: async (e: string) => {
                                        setTime(e)
                                        // const dateWithoutTime = date?.format("YYYY-MM-DD");
                                        // const data= await services.get_treatment_by_date(dateWithoutTime, e)
                                        // setExited(data.length)
                                    }
                                }}
                                // initialValue="PM/RM"
                                mode="multiple"
                                name="time"
                                label="Time"
                                rules={[{ required: true }]}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormSelect
                                style={{}}
                                request={async ({ }) => {
                                    const data = await services.getPlant();

                                    return data.map((obj: any) => ({
                                        value: obj.id,
                                        label: `${obj.plant}`,
                                    }));
                                }}
                                // options={options}
                                fieldProps={{
                                    onChange: async (value: number, option) => {
                                        setTypeValue(value)
                                        setTypeLable(option.label)
                                    }
                                }}
                                name="type"
                                label="Type"
                                initialValue={typeValue}
                                rules={[{ required: true }]}
                            />
                        </Col>
                        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ProFormDateRangePicker
                                width={'lg'}
                                name="assign_date"
                                label="Assign Date"
                                placeholder={['start', 'end']}
                                fieldProps={{
                                    format: 'YYYY-MM-DD',
                                }}
                                rules={[{ required: true }]}
                            />
                        </Col>

                    </Row>
                    <Row gutter={6}>
                        <Col span={24}>
                            <ProFormTextArea
                                hasFeedback={false}
                                label="Remark"
                                name={'remark'}
                                fieldProps={{
                                    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                        const value: string = event.target.value;

                                        // console.log(value)
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                    <ProTable<DailyPreWaterTreatmentControl>
                        size="small"
                        search={false}
                        rowKey="id"
                        dataSource={control}
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
                                width: 10,
                                render: (_, r, index) => index + 1
                            },
                            {
                                title: 'Control',
                                width: 150,
                                dataIndex: 'control'
                            },
                        ]}
                    />
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
