import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { EditableFormInstance, EditableProTable, ProForm, ProFormDateRangePicker, ProFormSelect, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { DailyWaterTreatmentMachineServiceAPI } from './service';
import { AssignDailyWaterTreatment, DailyWaterTreatmentMachine } from './data';
import { useForm } from 'antd/lib/form/Form';
import { Card, Col, DatePicker, Form, Row, Typography, message } from 'antd';
import { EmployeeServices } from '@/pages/hrm/services';
import { Moment } from 'moment';
import moment from 'moment';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
    onSave: (data: AssignDailyWaterTreatment) => void;
}
export default ({ onSave, ...props }: Props) => {
    // const [form] = useForm<{ remarks: string }>();
    const { Text } = Typography;
    const [form] = useForm<AssignDailyWaterTreatment>();
    const requestActions = simpleRequestActions();
    const services = DailyWaterTreatmentMachineServiceAPI(requestActions);
    const editableFormRef = useRef<EditableFormInstance>();
    const [machine, setMachine] = useState<DailyWaterTreatmentMachine[]>([])
    const [date, setDate] = useState<Moment>(moment());
    const [assignTo, setAssignTo] = useState('')
    const [shift, setShift] = useState('')

    useEffect(() => {
        if (props.open) {
            form.resetFields();
            const getMachine = async () => {
                const data = await services.get_machine()
                setMachine(data)
            }
            getMachine()
        }

    }, [props.open]);

    return (
        <FormModalComp
            title="Inventory Transfer"
            {...props}
            width={'800px'}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const startDate = moment(dataForm.assign_date[0]);
                const endDate = moment(dataForm.assign_date[1]);
                const item = []
                let current = moment(startDate); // Initialize with the starting date
                const end = moment(endDate); // Initialize with the ending date
                
                while (current.isSameOrBefore(end)) {
                    current = current.add(1, 'day'); // Ensure current is being updated
                    for (let i = 0; i < shift.length; i++) {
                        const entity = {
                            ...dataForm,
                            treatmentlist: machine.map((m) => ({ ...m, assign_to_user: assignTo, })),
                            assign_date: current,
                            assign_to: assignTo,
                            shift: shift[i],
                            activities: [{ action: "Assign to " + `${dataForm.assign_to}` }],
                        }
                        item.push(entity)
                    }
                }
                onSave(item)
                // for (let i = 0; i < shift.length; i++) {
                //     const entity = {
                //         ...dataForm,
                //         treatmentlist: machine.map((m) => ({ ...m, assign_to_user: assignTo, })),
                //         assign_date: dateWithoutTime,
                //         assign_to: assignTo,
                //         shift: shift[i],
                //         activities: [{ action: "Assign to " + `${dataForm.assign_to}` }],
                //     }
                //     item.push(entity)
                // }
                // onSave(item)
            }}
        >
            <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
                <Card size="small">
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormSelect
                                request={async ({ keyWords }) => {
                                    const data = await EmployeeServices.list({
                                        criteria: {
                                            searchValue: keyWords,
                                            advanceSearch: {
                                                status: 'ACTIVE',
                                            },
                                        },pagination:{pageSize:2000}
                                    }).query(requestActions);
                                    const filteredData = data.items.filter((obj) => obj.department === 'ICT');
                                    return filteredData.map((obj) => ({
                                        value: obj.userId,
                                        label: `${obj.firstName + ' ' + obj.lastName} `,
                                    }));
                                }}
                                // options={[
                                //     {
                                //         value: 'prodadm',
                                //         label: 'prodadm',
                                //     },
                                //     {
                                //         value: 'prod1',
                                //         label: 'prod1',
                                //     },
                                //     {
                                //         value: 'prod2',
                                //         label: 'prod2',
                                //     }
                                // ]}
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
                                        value: 'S1 (7:00)',
                                        label: 'S1 (7:00)',
                                    },
                                    {
                                        value: 'S1 (13:00)',
                                        label: 'S1 (13:00)',
                                    },
                                    {
                                        value: 'S2 (18:00)',
                                        label: 'S2 (18:00)',
                                    },
                                    {
                                        value: 'S2 (22:00)',
                                        label: 'S2 (22:00)',
                                    },
                                ]}
                                fieldProps={{
                                    onChange: async (e: string) => {
                                        setShift(e)
                                        // const dateWithoutTime = date?.format("YYYY-MM-DD");
                                        // const data= await services.get_treatment_by_date(dateWithoutTime, e)
                                        // setExited(data.length)
                                    }
                                }}
                                mode="multiple"
                                name="shift"
                                label="Shift"
                                rules={[{ required: true }]}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            {/* <div style={{ flexDirection: 'row' }}>
                                <Text style={{ color: 'red', fontSize: 20 }}>*</Text>
                                <Text>Assign Date</Text>
                            </div>
                            <DatePicker onChange={(v => setDate(v))} value={date} /> */}
                            {/* <Form.Item
                                help={<span />}
                                label="Assign Date"
                                name="assign_date"
                                rules={[{ required: true }]}
                            > */}
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
                            {/* </Form.Item> */}
                        </Col>
                        <Col span={12}>
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

                    <ProTable<DailyWaterTreatmentMachine>
                        size="small"
                        search={false}
                        rowKey="id"
                        dataSource={machine}
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
                                title: 'Machine',
                                width: 150,
                                dataIndex: 'machine'
                            },
                        ]}
                    />
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
