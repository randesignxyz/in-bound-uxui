import { DrawerFormProps, ProTable } from "@ant-design/pro-components"
import { Badge, Button, Modal, message } from "antd"
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { formatDateTime } from "@/pages/utils";
import { useAccess } from "@umijs/max";
import { DailyHACCPMonitoringServiceAPI } from "./service";
import { HACCPMonitoring, HACCPMonitoringList } from "./data";
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Line2Line3Model from "./Line2Line3Model";
import Line4Line5Line6Model from "./Line4Line5Line6Model";

interface Props extends DrawerFormProps {
    data?: HACCPMonitoringList[];
    refresh: (a: boolean) => void,
    type?: string,
    line?: string,
    assign_to?: string
}

export default ({ data, refresh, type, line, assign_to, ...rest }: Props) => {
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const [line2Line3ModelOpen, setLine2Line3ModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [line4Line5Line6ModelOpen, setLine4Line5Line6ModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const hasWaterPressure = data && data.some(item => item.water_pressure !== undefined);
    const hasNozzlesRinser = data && data.some(item => item.nozzles_rinser !== undefined);
    const hasSmell = data && data.some(item => item.smell !== undefined);
    const hasSideWall = data && data.some(item => item.side_wall !== undefined);
    const hasAirPressure = data && data.some(item => item.air_pressure !== undefined);
    const hasTemperaturePreform = data && data.some(item => item.temperature_preform !== undefined);
    const hasTreatedWaterPressure = data && data.some(item => item.treated_water_pressure !== undefined);

    const onSubmitHandaler = async (data: HACCPMonitoringList) => {
        Modal.confirm({
            title: "Submit",
            content: 'are you sure',
            onOk: async () => {
                try {
                    await services.post_haccp_monitoring_list(data)
                    setLine2Line3ModelOpen({ visible: false, data: undefined })
                    setLine4Line5Line6ModelOpen({ visible: false, data: undefined })
                    refresh(true)
                    message.success('Success');
                } catch (e) {
                    message.error('Error');
                }
            }
        })
    }

    return (
        <>
            <ProTable
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
                    // {
                    //     title: 'No',
                    //     width: 10,
                    //     render: (_, r, index) => index + 1
                    // },

                    {
                        title: 'Time',
                        dataIndex: 'time',
                        render: (_, r) => { return (<a onClick={() => (line == 'Line 2' || line == 'Line 3') ? (setLine2Line3ModelOpen({ visible: true, data: r }), console.log(r)) : (line == 'Line 4' || line == 'Line 5' || line == 'Line 6') ? setLine4Line5Line6ModelOpen({ visible: true, data: r }) : ''}>{r.time}</a>) }
                    },
                    ...(hasSideWall ? [{
                        title: 'Side Wall',
                        dataIndex: 'side_wall',
                        render: (_: any, r: any) => r.side_wall ? r.side_wall + ` %` : '-'
                    }] : []),
                    ...(hasAirPressure ? [{
                        title: 'Air Pressure',
                        dataIndex: 'air_pressure',
                        render: (_: any, r: any) => r.air_pressure ? r.air_pressure + ` bar` : '-'
                    }] : []),
                    ...(hasTemperaturePreform ? [{
                        title: 'Temperature Preform',
                        dataIndex: 'temperature_preform',
                        render: (_: any, r: any) => r.temperature_preform ? r.temperature_preform + ` °C` : '-'
                    }] : []),
                    ...(hasTreatedWaterPressure ? [{
                        title: 'Treated Water Pressure',
                        dataIndex: 'treated_water_pressure',
                    }] : []),
                    ...(hasWaterPressure ? [{
                        title: 'Water Pressure',
                        dataIndex: 'water_pressure',
                        render: (_: any, r: any) => r.water_pressure ? r.water_pressure + ` bar` : '-'
                    }] : []),
                    ...(hasNozzlesRinser ? [{
                        title: 'Nozzles Rinser',
                        dataIndex: 'nozzles_rinser',
                        render: (_: any, r: any) => r.nozzles_rinser == 1 ? <CheckCircleOutlined style={{ color: 'green', justifySelf: 'center' }} /> : r.nozzles_rinser == 0 ? <CloseCircleOutlined style={{ color: 'red' }} /> : '-'
                    }] : []),
                    {
                        title: 'FG',
                        dataIndex: 'fg',
                        render: (_: any, r: any) => r.fg ? r.fg + ` ppm` : '-'
                    },
                    ...(hasSmell ? [{
                        title: 'Smell',
                        dataIndex: 'smell',
                        render: (_: any, r: any) => r.smell == 1 ? <CheckCircleOutlined style={{ color: 'green' }} /> : r.smell == 0 ? <CloseCircleOutlined style={{ color: 'red' }} /> : '-'
                    }] : []),
                    {
                        title: 'Activities Control',
                        dataIndex: 'activity_control',
                        render: (_: any, r: any) => {
                            if (r.activity_control == 1) {
                                return (
                                    <>
                                        Under Control  <CheckCircleOutlined style={{ color: 'green' }} />
                                    </>
                                );
                            } else if (r.activity_control == 0) {
                                return (<>Over Control <CloseCircleOutlined style={{ color: 'red' }} /></>)
                            } else {
                                return '-';
                            }
                        }
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
                    ...(line == 'Line 3' ? [{
                        title: 'OPO',
                        dataIndex: 'opo',
                        render: (_: any, r: any) => r.opo ?? '-'
                    }] : []),
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        render: (_, r) => r.status == 'pending' ? <Badge status={'processing'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'normal' ? <Badge status={'success'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'warning' ? <Badge status={'error'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : '-',
                    },


                ]}
            />
            <Line2Line3Model
                open={line2Line3ModelOpen.visible}
                title={(('Monitoring ' + line))}
                onSave={onSubmitHandaler}
                data={line2Line3ModelOpen.data ?? {}}
                line={line}
                assign_to={assign_to}
                onCancel={() => {
                    setLine2Line3ModelOpen({ visible: false, data: undefined });
                }}
            />
            <Line4Line5Line6Model
                open={line4Line5Line6ModelOpen.visible}
                title={(('Monitoring ' + line))}
                onSave={onSubmitHandaler}
                line={line}
                assign_to={assign_to}
                data={line4Line5Line6ModelOpen.data ?? {}}
                onCancel={() => {
                    setLine4Line5Line6ModelOpen({ visible: false, data: undefined });
                }}
            />
        </>
    )

}