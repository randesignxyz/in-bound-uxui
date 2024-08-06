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
import { HACCPMonitoring } from './data';
import { DailyHACCPMonitoringServiceAPI } from './service';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
    onSave: (data: HACCPMonitoring) => void;
}
export default ({ onSave, ...props }: Props) => {
    // const [form] = useForm<{ remarks: string }>();
    const { Text } = Typography;
    const [form] = useForm<HACCPMonitoring>();
    const requestActions = simpleRequestActions();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const editableFormRef = useRef<EditableFormInstance>();
    const [date, setDate] = useState<Moment>(moment());
    const [exited, setExited] = useState(0)
    const [typeValue, setTypeValue] = useState(1)
    const [assignTo, setAssignTo] = useState('')
    const [line, setLine] = useState('')

    useEffect(() => {
        form.resetFields()
    }, [props.open]);

    useEffect(() => {
        if (props.open) {
            const getMachine = async () => {
                // const data = await services.getControl(typeValue)
                // setControl(data)
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
                    for (let i = 0; i < line.length; i++) {
                        const entity = {
                            ...dataForm,
                            assign_date: current,
                            assign_to: assignTo,
                            line: line[i],
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
                                        value: 'Line 1',
                                        label: 'Line 1',
                                    },
                                    {
                                        value: 'Line 2',
                                        label: 'Line 2',
                                    },
                                    {
                                        value: 'Line 3',
                                        label: 'Line 3',
                                    },
                                    {
                                        value: 'Line 4',
                                        label: 'Line 4',
                                    },
                                    {
                                        value: 'Line 5',
                                        label: 'Line 5',
                                    },
                                    {
                                        value: 'Line 6',
                                        label: 'Line 6'
                                    }
                                ]}
                                fieldProps={{
                                    onChange: async (e: string) => {
                                        setLine(e)
                                        // const dateWithoutTime = date?.format("YYYY-MM-DD");
                                        // const data= await services.get_treatment_by_date(dateWithoutTime, e)
                                        // setExited(data.length)
                                    }
                                }}
                                // initialValue="PM/RM"
                                mode="multiple"
                                name="line"
                                label="Line"
                                rules={[{ required: true }]}
                            />
                        </Col>
                    </Row>
                    <Row gutter={6}>
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
                </Card>
            </ProForm>
        </FormModalComp>
    );
};
