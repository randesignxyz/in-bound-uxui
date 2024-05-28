import { AimOutlined, CarOutlined, CheckSquareOutlined, DashboardOutlined, EditFilled, FileProtectOutlined, PlayCircleOutlined, PlusCircleFilled, PlusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { Button, Dropdown, MenuProps, Modal, Spin, Tabs, message } from "antd";
import { useState, useCallback, useEffect, useRef } from "react"
import { simpleRequestActions } from "@/services/model";
import { VehicleListItem } from "./data";
import BasicInfo from "../components/BasicInfo";
import { VehicleServiceAPI } from "./service";
import AssignDriver from "./view/AssignDriver";
import MeterHistory from "./view/MeterHistory";
import Specifications from "./view/Specifications";
import FuelHistory from "./view/FuelHistory";
import InspectionView from "./view/InspectionView";
import ServiceReminder from "./view/ServiceReminder";
import Meintennece from "./view/Meintennece";
import Accident from "./view/Accident";
import Accessories from "./view/Accessories";
import { ExternalLayout } from "../fleet";
import ActivityLogListView from "../components/ActivityLogListView";
import OdometerIssue from "./OdometerIssue";
import TireAssigntoVehicleModal from "../tires/AssignTireVehicle";
import { TireAssignCreate } from "../specification/data";
import { SpecificationServiceAPI } from "../specification/service";
import { DriverDTO, VehicleDriverCreate, VehicleDriverDTO } from "../driver/data";
import AssignDriverFormModal from "../driver/AssignDriverFormModal";


interface Props {
    id: string;
    onAdd?: () => void;
    onEdit?: (id: string) => void;
}

export default ({ id, onAdd, onEdit }: Props) => {
    const requestActions = simpleRequestActions();
    const service = VehicleServiceAPI(requestActions);
    const [vehicleBasicinfo, setVehicleBasicInfo] = useState<VehicleListItem>();
    const [state, setSate] = useState<{
        visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: VehicleListItem } };

    }>({});
    const [odometerIssue, setOdometerIssue] = useState<{
        visible?: {
            name: "MODAL",
            type: "ADD" | "EDIT",
            payload?: VehicleListItem
        }
    }>();
    const [tireState, setTireState] = useState<{
        visible?: {
            name: "MODAL",
            type: "ADD" | "EDIT";
            payload?: VehicleListItem;
        }
    }>();
    const [assignState, setAssignState] = useState<{
        visible?: { name: 'modal'; type: 'ADD' | 'Edit'; vehicleId?: VehicleListItem; driver?: DriverDTO, vehicleDriver?: VehicleDriverDTO };
    }>({});

    const actionRef = useRef<ActionType>();
    const initData = useCallback(async () => {
        const initData = await service.fetchVehicle(id)
        setVehicleBasicInfo(initData);
    }, [id]);

    useEffect(() => {
        initData()
    }, [initData])

    const onAddHandler = async () => {
        setSate((v) => ({
            ...v,
            visible: { name: 'modal', type: 'ADD' },
        }));
    };



    const tabItem = [
        {
            label: "General Info",
            key: "1",
            children: (
                <>
                    <BasicInfo
                        data={vehicleBasicinfo}
                    />
                </>
            )
        },

        {
            label: `Maintenance`,
            key: '2',
            children: <Meintennece id={id} />,
        },
        {
            label: `Fuel History`,
            key: '3',
            children: <FuelHistory id={id} />,
        },
        {
            label: "Inpection History",
            key: "4",
            children: <InspectionView id={id} />
        },
        {
            label: "Operator",
            key: "5",
            children: <AssignDriver id={id} />
        },

        {
            label: `Service Reminder`,
            key: '6',
            children: <ServiceReminder id={id} />
        },


        {
            label: `Specifications`,
            key: '8',
            children: <Specifications id={id} />
        },
        {
            label: `Accidentals`,
            key: '9',
            children: <Accident id={id} />
        },
        {
            label: `Accessories`,
            key: '10',
            children: <Accessories id={id} />
        },
        {
            label: `Meter History`,
            key: '7',
            children: <MeterHistory id={id} />
        },
        {
            label: `Log`,
            key: 'log',
            children: <ActivityLogListView referenceStringId={id} logParam={{ source: "VEHICLE" }} />
        },
    ]

    const items: MenuProps["items"] = [
        {
            key: "vehicle",
            label: "Add Vehicle",
            itemIcon: <CarOutlined />,
            onClick: () => onAdd?.()
        },
        {
            key: "operator",
            label: "Assign Operator",
            itemIcon: <FileProtectOutlined />,
            onClick:() =>setAssignState({ visible: { name: 'modal', type: 'ADD', vehicleId: vehicleBasicinfo, driver: vehicleBasicinfo?.driver, vehicleDriver: vehicleBasicinfo?.vehicleDriver } })
        },
        {
            key: "odometer",
            label: "Change Odometer",
            itemIcon: <DashboardOutlined />,
            onClick: () => setOdometerIssue({ visible: { name: 'MODAL', type: 'EDIT', payload: vehicleBasicinfo } })
        },
        {
            key: "tire",
            label: "Assign Tire",
            itemIcon:<AimOutlined />,
            onClick: () => setTireState({ visible: { name: "MODAL", type: "ADD", payload: vehicleBasicinfo } })
        },
    ]

    return (
        <>
            <Spin spinning={requestActions.request?.loading}>
                <PageContainer
                    onBack={!ExternalLayout.isExternal("fleet/vehicle") ? ExternalLayout.handleBackHandler : undefined}
                    title="Details"
                    subTitle={`#${vehicleBasicinfo?.plateNumber}`}
                    tabProps={{
                        size: "small"
                    }}
                    extra={[

                        <Button
                            icon={<EditFilled />}
                            onClick={() => onEdit?.(id)}
                        >
                            Edit
                        </Button>,
                        // <Button
                        //     onClick={() => onAdd?.()}
                        //     type="primary"
                        //     icon={<PlusOutlined />}
                        // >
                        //     New
                        // </Button>,
                        <Dropdown.Button
                            icon={<PlusCircleOutlined />}
                            type="primary"
                            menu={{ items, style: { width: 200 } }}
                        >Add </Dropdown.Button>,
                    ]}
                    tabList={tabItem}
                >
                    {/* <Tabs
                        defaultActiveKey="1"
                        items={tabItem}
                    /> */}
                </PageContainer>
            </Spin>
            <OdometerIssue
                open={odometerIssue?.visible?.name === "MODAL"}
                onCancel={() => setOdometerIssue({ visible: undefined })}
                data={odometerIssue?.visible?.payload}
                onSave={(data: { vId?: string; odometer: number; reason?: string }) => {
                    Modal.confirm({
                        title: "Change Odometer",
                        content: "are you sure? This odometer will be set as current meter!",
                        onOk: async () => {
                            await service.changeOdometer(data);
                            actionRef.current?.reload?.();
                            setOdometerIssue({ visible: undefined });
                        }
                    })
                }}
            />

            <TireAssigntoVehicleModal
                open={tireState?.visible?.name === "MODAL"}
                onCancel={() => setTireState((v) => ({ ...v, visible: undefined }))}
                vehicleId={tireState?.visible?.payload?.id}
                onSave={(data: TireAssignCreate) => {
                    Modal.confirm({
                        title: "Save tire for vehicle",
                        content: "are your sure record your enter is correct?",
                        onOk: async () => {
                            SpecificationServiceAPI(requestActions).saveVehicleTire(data);
                            setTireState({ visible: undefined });
                        }
                    })
                }}
            />
            <AssignDriverFormModal
                open={assignState.visible?.name === 'modal'}
                vehicleId={assignState.visible?.vehicleId}
                vehicleDriver={assignState.visible?.vehicleDriver}
                modalProps={{
                    onCancel: () => setAssignState((v) => ({ ...v, visible: undefined })),
                    okText: 'Submit',
                }}
                onSave={(data: VehicleDriverCreate) => {
                    Modal.confirm({
                        title: `Assign Operator to Vehicle`,
                        content: 'are you sure?',
                        onOk: async () => {
                            const response = (await service.saveVehicleDriver(data)) as {
                                data: string;
                                message: string;
                            };
                            setAssignState((v) => ({ ...v, visible: undefined }));
                            actionRef.current?.reloadAndRest?.();
                            message.success('SUCCESS SAVED');
                        },
                    });
                }}
            />
        </>
    )
}