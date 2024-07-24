import { formatDate, formatDateTime } from '@/pages/utils';
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
import { EditFilled, PlusCircleFilled } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import ItemTab from './ItemTab';
import ActivitiesTab from './ActivitiesTab';

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
    const [pressureModelOpen, setPressureModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [onRefresh, setOnRefresh] = useState(false)
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
            label: 'Daily HACCP Monitoring',
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
            console.log(list[0])
        }
        data()
        setOnRefresh(false)
    }, [id, onRefresh == true])

    return (
        <>
            <Row justify="space-between">
                <BreadCrumbCom separator=">" routes={routes} />
                <Space>
                    <>
                        {data?.assign_to?.split(" ").includes(access.currentUser?.login || '') || access.canAssignItemPre ?
                            <Button
                                // onClick={() => onAdd?.()}
                                type="primary"
                                icon={<PlusCircleFilled />}
                            >
                                New
                            </Button>
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
            <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 20 }}>
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

                {/* <ProTable
                    size="small"
                    search={false}
                    rowKey="id"
                    dataSource={subData}
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
                            title: 'Time',
                            dataIndex: 'time',
                            render: (_, r) => { return formatDateTime(r.time) }
                        },
                        ...(hasWaterPressure ? [{
                            title: 'Water Pressure',
                            dataIndex: 'water_pressure',
                        }] : []),
                        ...(hasNozzlesRinser ? [{
                            title: 'Nozzles Rinser',
                            dataIndex: 'nozzles_rinser',
                        }] : []),
                        {
                            title: 'FG',
                            dataIndex: 'fg',
                        },
                        ...(hasSmell ? [{
                            title: 'Smell',
                            dataIndex: 'smell',
                            render: (_: any, r: any) => r.smell == 1 ? "Yes" : r.smell == 0 ? "No" : 'N/A'
                        }] : []),
                        {
                            title: 'Activities Control',
                            dataIndex: 'activity_control',
                            render: (_: any, r: any) => r.activity_control == 1 ? "Under Control" : r.activity_control == 0 ? "Over Control" : 'N/A'
                        },
                        {
                            title: 'Take Action',
                            dataIndex: 'take_action',
                        },
                        {
                            title: 'Done By',
                            dataIndex: 'done_by',
                        },
                        {
                            title: 'Other',
                            dataIndex: 'other',
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            render: (_, r) => r.status == 'pending' ? <Badge status={'processing'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'normal' ? <Badge status={'success'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'warning' ? <Badge status={'error'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : <Badge status={'default'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} />,
                        },


                    ]}
                /> */}
                <Tabs
                    items={[
                        {
                            label: 'List',
                            key: '1',
                            children: <ItemTab data={subData ?? {}} type={part[2]} refresh={(v) => { v == true ? setOnRefresh(true) : setOnRefresh(false) }} />,

                        },
                        {
                            label: 'Activities',
                            key: '2',
                            children: <ActivitiesTab data={data?.haccp_id ?? ''} />,
                        },
                    ]}
                />
            </Card>
        </>
    );
};
