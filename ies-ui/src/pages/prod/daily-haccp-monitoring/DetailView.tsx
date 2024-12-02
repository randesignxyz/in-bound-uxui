import { formatDateTime } from '@/pages/utils';
import { ProCard, ProForm, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Badge, Button, Card, Col, Descriptions, Divider, Modal, Row, Space, Spin, Tabs, Typography, message } from 'antd';
import moment from 'moment';
import { ProdPaths } from '..';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { useLocation } from 'umi';
import { simpleRequestActions } from '@/services/model';
import { useEffect, useState } from 'react';
import { DailyHACCPMonitoringServiceAPI } from './service';
import { HACCPMonitoring, HACCPMonitoringList } from './data';
import DescriptionDisplay from '@/components/Descriptions';
import { EditFilled, FileDoneOutlined, PlusCircleFilled } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import ItemTab from './ItemTab';
import ActivitiesTab from './ActivitiesTab';
import Line2Line3Model from './Line2Line3Model';
import Line4Line5Line6Model from './Line4Line5Line6Model';
import InstructionViewModal from './InstructionViewModal';

interface Props extends DrawerFormProps {
    id: string;
    //   reload?: (id: number) => Promise<void>;
    // onEdit?: (id?: number) => void;
    //   onAdd?: () => void;
}

export default ({ id, ...rest }: Props) => {
    const { Text } = Typography;
    const access = useAccess();
    const requestActions = simpleRequestActions();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const [line2Line3ModelOpen, setLine2Line3ModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [line4Line5Line6ModelOpen, setLine4Line5Line6ModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [onRefresh, setOnRefresh] = useState(false)
    const [instructionModal, setInstructionModal] = useState(false)
    const part = id.split("/");
    const [data, setData] = useState<HACCPMonitoring>()
    const [subData, setSubData] = useState<HACCPMonitoringList[]>([])
    const hasWaterPressure = subData && subData.some(item => item.water_pressure !== undefined);
    const hasNozzlesRinser = subData && subData.some(item => item.nozzles_rinser !== undefined);
    const hasSmell = subData && subData.some(item => item.smell !== undefined);

    const routes = [
        {
            path: ProdPaths.prod,
            label: 'Prod',
        },
        {
            path: `${ProdPaths.dailyHACCPMonitoring}/list`,
            label: 'Daily HACCP Monitoring Line',
        },
        {
            path: '',
            label: `Deatil ${part[1]}`,
        },
    ];

    useEffect(() => {
        const data = async () => {
            const list = await services.get_haccp_by_date_and_line(part[0], part[1], part[2])
            setSubData(list[0].haccplist)
            setData(list[0])
        }
        data()
        setOnRefresh(false)
    }, [id, onRefresh == true])

    const onSubmitHandaler = async (data: HACCPMonitoringList) => {
        Modal.confirm({
            title: "Submit",
            content: 'are you sure',
            onOk: async () => {
                try {
                    await services.post_haccp_monitoring_list(data)
                    setLine2Line3ModelOpen({ visible: false, data: undefined })
                    setLine4Line5Line6ModelOpen({ visible: false, data: undefined })
                    setOnRefresh(true)
                    message.success('Success');
                } catch (e) {
                    message.error('Error');
                }
            }
        })
    }

    const formatDate = (dateString:any) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    return (
        <>
            <Row justify="space-between">
                <BreadCrumbCom separator=">" routes={routes} />
                <Space>
                    <>
                        {data?.assign_to?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre ?
                            <>

                                {/* <Button
                                    onClick={() => (data?.line == 'Line 2' || data?.line == 'Line 3') ? setLine2Line3ModelOpen({ visible: true, data: data }) : (data?.line == 'Line 4' || data?.line == 'Line 5' || data?.line == 'Line 6') ? setLine4Line5Line6ModelOpen({ visible: true, data: data }) : ''}
                                    type="primary"
                                    icon={<PlusCircleFilled />}
                                >
                                    New
                                </Button> */}
                                <Button
                                    // style={{ color: 'red', borderColor: 'red' }}
                                    icon={<FileDoneOutlined />}
                                    onClick={() => { setInstructionModal(true) }}
                                >
                                    Instruction
                                </Button>
                            </>
                            : ''}
                        {data?.assign_to?.split(" ").includes(access.currentUser?.login || '') ?
                            <>

                                <Button
                                    style={{ color: 'red', borderColor: 'red' }}
                                    icon={<EditFilled />}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: "Submit",
                                            content: 'are you sure to disenroll',
                                            onOk: async () => {
                                                try {
                                                    await services.assign_self_haccp(data.id, data.line, data.haccp_id, [{ action: access.currentUser?.login + " disenroll" }])
                                                    setOnRefresh(true)
                                                    message.success('Success');
                                                } catch (e) {
                                                    message.error('Error');
                                                }
                                            }
                                        })
                                    }}
                                >
                                    Disenroll
                                </Button>


                            </>
                            : <Button
                                icon={<EditFilled />}
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Submit",
                                        content: 'are you sure to enroll',
                                        onOk: async () => {
                                            try {
                                                await services.assign_self_haccp(data?.id, data?.line, data?.haccp_id, [{ action: access.currentUser?.login + " enroll" }])
                                                setOnRefresh(true)
                                                message.success('Success');
                                            } catch (e) {
                                                message.error('Error');
                                            }
                                        }
                                    })
                                }}
                            >
                                Enroll
                            </Button>}
                    </>
                </Space>
            </Row>
            <Card size="small" style={{ textAlign: 'left', marginBottom: 10, marginTop: 20 }}>
                <Space >
                    <ProForm submitter={false}>
                        <DescriptionDisplay
                            data={[
                                { label: 'Assign Date', value: formatDate(data?.assign_date) },
                                { label: 'Assign To', value: data?.assign_to },
                                { label: 'Line', value: data?.line },
                                { label: 'Created By', value: data?.createdBy },
                                { label: 'Created Date', value: formatDateTime(data?.createdDate) },
                                { label: 'Remark', value: data?.remark ? data?.remark : '-' },
                                // { label: 'Assign To', value: data?.assign_to },
                                // { label: 'Treatment Type', value: data?.pre_treatment_type },
                            ]}
                        />
                    </ProForm>
                </Space>
            </Card>
            <Card size="small">
                <Tabs
                    items={[
                        {
                            label: 'List',
                            key: '1',
                            children: <ItemTab data={subData ?? {}} assign_to={data?.assign_to} line={data?.line} type={part[2]} refresh={(v) => { v == true ? setOnRefresh(true) : setOnRefresh(false) }} />,

                        },
                        {
                            label: 'Activities',
                            key: '2',
                            children: <ActivitiesTab data={data?.haccp_id ?? ''} />,
                        },
                    ]}
                />
            </Card>
            <Line2Line3Model
                open={line2Line3ModelOpen.visible}
                title={(('Monitoring ' + data?.line))}
                onSave={onSubmitHandaler}
                data={line2Line3ModelOpen.data ?? {}}
                onCancel={() => {
                    setLine2Line3ModelOpen({ visible: false, data: undefined });
                }}
            />
            <Line4Line5Line6Model
                open={line4Line5Line6ModelOpen.visible}
                title={(('Monitoring ' + data?.line))}
                onSave={onSubmitHandaler}
                data={line4Line5Line6ModelOpen.data ?? {}}
                onCancel={() => {
                    setLine4Line5Line6ModelOpen({ visible: false, data: undefined });
                }}
            />
            <InstructionViewModal
                group_line={(data?.line == 'Line 2' || data?.line == 'Line 3') ? '1' : (data?.line == 'Line 4' || data?.line == 'Line 5' || data?.line == 'Line 6') ? '2' : (data?.line == 'Line Barrel') ? '3' : ''}
                open={instructionModal}
                onCancel={() => setInstructionModal(false)}
            />
        </>
    );
};
