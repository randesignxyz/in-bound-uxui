import { DrawerFormProps, ProTable } from "@ant-design/pro-components"
import { HACCPMonitoringOzone, HACCPMonitoringOzoneList } from "./data"
import { Badge, Button, Modal, message } from "antd"
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { HACCPMonitoringOzoneServiceAPI } from "./service";
// import AirReleaseModel from "./AirReleaseModel";
// import Pressure2Model from "./Pressure2Model";
// import TDS2Model from "./TDS2Model";
// import Pressure4Model from "./Pressure4Model";
// import TDS4Model from "./TDS4Model";
// import PH2Model from "./pH2Model";
// import PH4Model from "./pH4Model";
import { formatDateTime } from "@/pages/utils";
import { useAccess } from "@umijs/max";
import RO1Modal from "./RO1Modal";
import RO2Modal from "./RO2Modal";
import RO4Modal from "./RO4Modal";
import OzoneModal from "./OzoneModal";

interface Props extends DrawerFormProps {
    data?: any;
    refresh: (a: boolean) => void,
    type?: string
}

export default ({ data, refresh, type, ...rest }: Props) => {
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = HACCPMonitoringOzoneServiceAPI(requestActions);
    const [control, setControl] = useState<HACCPMonitoringOzoneList>();
    const [RO1ModalOpen, setRO1ModalOpen]=useState<{ visible: boolean }>({ visible: false })
    const [RO2ModalOpen, setRO2ModalOpen]=useState<{ visible: boolean }>({ visible: false })
    const [RO4ModalOpen, setRO4ModalOpen]=useState<{ visible: boolean }>({ visible: false })
    const [ozoneModalOpen, setOzoneModalOpen]=useState<{ visible: boolean }>({ visible: false })

    const onSubmitHandaler = async (data: HACCPMonitoringOzoneList) => {
        Modal.confirm({
            title: "Submit",
            content: 'are you sure',
            onOk: async () => {
                try {
                    await services.post_haccp_monitoring_ozone_list(data)
                    setRO1ModalOpen({ visible: false});
                    setRO2ModalOpen({ visible: false});
                    setRO4ModalOpen({ visible: false});
                    setOzoneModalOpen({ visible: false});
                    setControl(undefined)
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
            <ProTable<HACCPMonitoringOzoneList>
                size="small"
                search={false}
                rowKey="id"
                dataSource={data?.ozonelist}
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
                        title: 'Control',
                        dataIndex: 'control',
                        render: (_, r) => <Badge
                            size="small"
                            offset={[10, 0]}
                            count={
                                r.warning_count
                            }
                        >
                            <a onClick={() => { data?.haccp_ozone_type == 'Reverses Osmosis System (RO1)'?(setRO1ModalOpen({visible:true}),setControl(r)):(data?.haccp_ozone_type == 'Reverses Osmosis System (RO2)' || data?.haccp_ozone_type == 'Reverses Osmosis System (RO3)')?(setRO2ModalOpen({visible:true}),setControl(r)):data?.haccp_ozone_type == 'Reverses Osmosis System (RO4)'?(setRO4ModalOpen({visible:true}),setControl(r)):(data?.haccp_ozone_type == 'Ozone System (RO3)' || data?.haccp_ozone_type == 'Ozone System (RO4)' )?(setOzoneModalOpen({visible:true}),setControl(r)):{}}}>
                                {r.control}
                            </a>
                        </Badge>
                    },
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        render: (_, r) => r.status == 'pending' ? <Badge status={'processing'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'normal' ? <Badge status={'success'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : r.status == 'warning' ? <Badge status={'error'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /> : <Badge status={'default'} text={r.status.charAt(0).toUpperCase() + r.status.slice(1)} />,

                    },
                    {
                        title: 'Check By',
                        dataIndex: 'lastModifiedBy',
                        // render: (_, r) => r.check_by,

                    },
                    {
                        title: 'Check Date',
                        dataIndex: 'lastModifiedDate',
                        render: (_, r) => (r.lastModifiedDate ? formatDateTime(r.lastModifiedDate) : '-')
                    },
                    {
                        render: (_, r) => (
                            <>
                                {r?.assign_to_user?.split(" ").includes(access.currentUser?.login || '') ?
                                    <Button
                                        style={{ width: '100%', color: "red", borderColor: 'red' }}
                                        onClick={() => {
                                            Modal.confirm({
                                                title: "Submit",
                                                content: 'are you sure to disenroll',
                                                onOk: async () => {
                                                    try {
                                                        await services.assign_self_ozone(r.id ?? 0, r.haccp_ozone_id ?? '',access.currentUser?.login + " disenroll")
                                                        refresh(true)
                                                        message.success('Success');
                                                    } catch (e) {
                                                        message.error('Error');
                                                    }
                                                }
                                            })
                                            // console.log(r,data)
                                        }}
                                    >
                                        Disenroll
                                    </Button>
                                    :
                                    <Button
                                        style={{ width: '100%' }}
                                        onClick={() => {
                                            console.log(r)
                                            Modal.confirm({
                                                title: "Submit",
                                                content: 'are you sure to enroll',
                                                onOk: async () => {
                                                    try {
                                                        await services.assign_self_ozone(r.id ?? 0, r.haccp_ozone_id ?? '', access.currentUser?.login + " enroll")
                                                        refresh(true)
                                                        message.success('Success');
                                                    } catch (e) {
                                                        message.error('Error');
                                                    }
                                                }
                                            })
                                        }}
                                    >
                                        Enroll
                                    </Button>
                                }

                            </>
                        ),
                    },
                ]}
            />
            <RO1Modal
                data={control}
                open={RO1ModalOpen.visible}
                onCancel={() => {
                    setRO1ModalOpen({ visible: false});
                    setControl(undefined)
                }}
                onSave={onSubmitHandaler}
            />
            <RO2Modal
                data={control}
                open={RO2ModalOpen.visible}
                onCancel={() => {
                    setRO2ModalOpen({ visible: false});
                    setControl(undefined)
                }}
                type={data?.haccp_ozone_type}
                onSave={onSubmitHandaler}
            />
            <RO4Modal
                data={control}
                open={RO4ModalOpen.visible}
                onCancel={() => {
                    setRO4ModalOpen({ visible: false});
                    setControl(undefined)
                }}
                onSave={onSubmitHandaler}
            />
            <OzoneModal
                data={control}
                open={ozoneModalOpen.visible}
                onCancel={() => {
                    setOzoneModalOpen({ visible: false});
                    setControl(undefined)
                }}
                onSave={onSubmitHandaler}
                type={data?.haccp_ozone_type}
            />
            {/* <Pressure2Model
                title={pressureModelOpen.data?.control + ' (0.1-0.3 Mpa)'}
                open={pressureModelOpen.visible}
                onCancel={() => {
                    setPressureModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={pressureModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            />
            <AirReleaseModel
                title={(airReleaseModelOpen.data?.control + ' (Y/N)')}
                open={airReleaseModelOpen.visible}
                onCancel={() => {
                    setairReleaseModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={airReleaseModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            />
            <TDS2Model
                title={(tds2ModelOpen.data?.control == 'TDS' ? (tds2ModelOpen.data?.control + ' (≤300 ppm)') : tds2ModelOpen.data?.control == 'pH' ? (tds2ModelOpen.data?.control + ' (6.5-8.5)') : '')}
                open={tds2ModelOpen.visible}
                onCancel={() => {
                    setTDS2ModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={tds2ModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            />
            <PH2Model
                title={(ph2ModelOpen.data?.control + ' (6.5-8.5)')}
                open={ph2ModelOpen.visible}
                onCancel={() => {
                    setpH2ModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={ph2ModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            />
            <PH4Model
                title={(ph4ModelOpen.data?.control + ' (6.5-8.5)')}
                open={ph4ModelOpen.visible}
                onCancel={() => {
                    setpH4ModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={ph4ModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            />
            <Pressure4Model
                title={pressure4ModelOpen.data?.control + ' ΔP'}
                open={pressure4ModelOpen.visible}
                onCancel={() => {
                    setPressure4ModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={pressure4ModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            />
            <TDS4Model
                title={tds4ModelOpen.data?.control + ' (<300 mg/l)'}
                open={tds4ModelOpen.visible}
                onCancel={() => {
                    setTDS4ModelOpen({ visible: false, data: undefined, type: undefined });
                }}
                onSave={onSubmitHandaler}
                data={tds4ModelOpen.data ?? {}}
                type={data.pre_treatment_type}
            /> */}

        </>
    )

}