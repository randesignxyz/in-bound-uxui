import { DrawerFormProps, ProTable } from "@ant-design/pro-components"
import { DailyWaterTreatmentItem } from "./data"
import { Badge, Button, Modal, message } from "antd"
import { useState } from "react";
import MicroModel from "./MicroModel";
import FilterModel from "./FilterModel";
import RawWaterStockModel from "./RawWaterStockModel";
import ReversesModel from "./ReversesModel";
import { simpleRequestActions } from "@/services/model";
import { DailyWaterTreatmentMachineServiceAPI } from "./service";
import { formatDateTime } from "@/pages/utils";
import { useAccess } from "@umijs/max";

interface Props extends DrawerFormProps {
    data?: any;
    refresh: (a: boolean) => void
}

export default ({ data, refresh, ...rest }: Props) => {
    const requestActions = simpleRequestActions();
    const access = useAccess();
    const services = DailyWaterTreatmentMachineServiceAPI(requestActions);
    const [itemModelOpen, setItemModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [filterModelOpen, setFilterModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [microModelOpen, setMicroModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [reversesModelOpen, setReversesModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })
    const [activitiesModelOpen, setActivitiesModelOpen] = useState<{ visible: boolean, data?: any }>({ visible: false })

    const onSubmitHandaler = async (data: DailyWaterTreatmentItem) => {
        Modal.confirm({
            title: "Submit",
            content: 'are you sure',
            onOk: async () => {
                try {
                    await services.post_daily_water_treatment(data)
                    setFilterModelOpen({ visible: false, data: undefined });
                    setItemModelOpen({ visible: false, data: undefined });
                    setMicroModelOpen({ visible: false, data: undefined });
                    setReversesModelOpen({ visible: false, data: undefined });
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
            <ProTable<DailyWaterTreatmentItem>
                size="small"
                search={false}
                rowKey="id"
                dataSource={data?.treatmentlist}
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
                        title: 'Process',
                        dataIndex: 'machine',
                        render: (_, r) => <Badge
                            size="small"
                            offset={[10, 0]}
                            count={
                                r.warning_count
                            }
                        ><a onClick={() => { r.machine == 'Raw Water Stock' ? setItemModelOpen({ visible: true, data: r }) : r.machine == 'Sand Filter' || r.machine == 'Carbon Filter' || r.machine == 'Resin Filter' ? setFilterModelOpen({ visible: true, data: r }) : r.machine == 'Microfilter 5µm' || r.machine == 'Microfilter 1µm' ? setMicroModelOpen({ visible: true, data: r }) : r.machine == 'Reverses Osmosis' ? setReversesModelOpen({ visible: true, data: r }) : <></> }}>{r.machine}</a>
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
                                        style={{ width: '100%',color:"red",borderColor:'red' }}
                                        onClick={() => {
                                            Modal.confirm({
                                                title: "Submit",
                                                content: 'are you sure to disenroll',
                                                onOk: async () => {
                                                    try {
                                                        await services.assign_self(r.id,access.currentUser?.login+" disenroll",r.treatment_id)
                                                        refresh(true)
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
                                    :
                                    <Button
                                        style={{ width: '100%' }}
                                        onClick={() => {
                                            Modal.confirm({
                                                title: "Submit",
                                                content: 'are you sure to enroll',
                                                onOk: async () => {
                                                    try {
                                                        await services.assign_self(r.id,access.currentUser?.login+" enroll",r.treatment_id)
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
            <RawWaterStockModel
                title={itemModelOpen.data?.machine}
                open={itemModelOpen.visible}
                onCancel={() => {
                    setItemModelOpen({ visible: false, data: undefined });
                }}
                onSave={onSubmitHandaler}
                data={itemModelOpen.data ?? {}}
            />
            <FilterModel
                title={filterModelOpen.data?.machine}
                open={filterModelOpen.visible}
                onCancel={() => {
                    setFilterModelOpen({ visible: false, data: undefined });
                }}
                onSave={onSubmitHandaler}
                data={filterModelOpen.data ?? {}}
            />
            <MicroModel
                title={microModelOpen.data?.machine}
                open={microModelOpen.visible}
                onCancel={() => {
                    setMicroModelOpen({ visible: false, data: undefined });
                }}
                onSave={onSubmitHandaler}
                data={microModelOpen.data ?? {}}
            />
            <ReversesModel
                title={reversesModelOpen.data?.machine}
                open={reversesModelOpen.visible}
                onCancel={() => {
                    setReversesModelOpen({ visible: false, data: undefined });
                }}
                onSave={onSubmitHandaler}
                data={reversesModelOpen.data ?? {}}
            />
        </>
    )

}