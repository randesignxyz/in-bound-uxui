import { DrawerFormProps, ProTable } from "@ant-design/pro-components"
import { Badge, Button, Modal, message } from "antd"
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { formatDateTime } from "@/pages/utils";
import { useAccess } from "@umijs/max";
import { DailyHACCPMonitoringServiceAPI } from "./service";
import { HACCPMonitoring, HACCPMonitoringList } from "./data";
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface Props extends DrawerFormProps {
    data?: HACCPMonitoringList[];
    refresh: (a: boolean) => void,
    type?: string
}

export default ({ data, refresh, type, ...rest }: Props) => {
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = DailyHACCPMonitoringServiceAPI(requestActions);
    const hasWaterPressure = data && data.some(item => item.water_pressure !== undefined);
    const hasNozzlesRinser = data && data.some(item => item.nozzles_rinser !== undefined);
    const hasSmell = data && data.some(item => item.smell !== undefined);
    const hasSideWall = data && data.some(item => item.side_wall !== undefined);
    const hasAirPressure = data && data.some(item => item.air_pressure !== undefined);
    const hasTemperaturePreform = data && data.some(item => item.temperature_preform !== undefined);
    const hasTreatedWaterPressure = data && data.some(item => item.treated_water_pressure !== undefined);

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
                    ...(hasSideWall ? [{
                        title: 'Side Wall',
                        dataIndex: 'side_wall',
                        render: (_: any, r: any) => r.side_wall + ` %`
                    }] : []),
                    ...(hasAirPressure ? [{
                        title: 'Air Pressure',
                        dataIndex: 'air_pressure',
                        render: (_: any, r: any) => r.air_pressure + ` bar`
                    }] : []),
                    ...(hasTemperaturePreform ? [{
                        title: 'Temperature Preform',
                        dataIndex: 'temperature_preform',
                        render: (_: any, r: any) => r.temperature_preform + ` °C`
                    }] : []),
                    ...(hasTreatedWaterPressure ? [{
                        title: 'Treated Water Pressure',
                        dataIndex: 'treated_water_pressure',
                    }] : []),
                    ...(hasWaterPressure ? [{
                        title: 'Water Pressure',
                        dataIndex: 'water_pressure',
                        render: (_: any, r: any) => r.water_pressure + ` bar`
                    }] : []),
                    ...(hasNozzlesRinser ? [{
                        title: 'Nozzles Rinser',
                        dataIndex: 'nozzles_rinser',
                        render: (_: any, r: any) => r.nozzles_rinser == 1 ? <CheckCircleOutlined style={{ color: 'green', justifySelf: 'center' }} /> : r.nozzles_rinser == 0 ? <CloseCircleOutlined style={{ color: 'red' }} /> : 'N/A'
                    }] : []),
                    {
                        title: 'FG',
                        dataIndex: 'fg',
                        render: (_: any, r: any) => r.fg + ` ppm`
                    },
                    ...(hasSmell ? [{
                        title: 'Smell',
                        dataIndex: 'smell',
                        render: (_: any, r: any) => r.smell == 1 ? <CheckCircleOutlined style={{ color: 'green' }} /> : r.smell == 0 ? <CloseCircleOutlined style={{ color: 'red' }} /> : 'N/A'
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
                                return 'N/A';
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
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        render: (_, r) => r.status == 'pending' ? <Badge status={'processing'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'normal' ? <Badge status={'success'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'warning' ? <Badge status={'error'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : <Badge status={'default'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} />,
                    },


                ]}
            />

        </>
    )

}