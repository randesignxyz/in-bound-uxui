import { AimOutlined, CarOutlined, DashboardOutlined, EditFilled, FileProtectOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { Button, Dropdown, MenuProps, Modal, message } from "antd";
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
import Accessories from "./view/Accessories";
import { ExternalLayout } from "../fleet";
import ActivityLogListView from "../components/ActivityLogListView";
import OdometerIssue from "./OdometerIssue";
import TireAssigntoVehicleModal from "../tires/AssignTireVehicle";
import { TireAssignCreate } from "../specification/data";
import { SpecificationServiceAPI } from "../specification/service";
import { DriverDTO, VehicleDriverCreate, VehicleDriverDTO } from "../driver/data";
import AssignDriverFormModal from "../driver/AssignDriverFormModal";
import AccidentListView from "../accident/AccidentListView";
import { useParams } from "@umijs/max";

interface Props {
    id: string;
    onAdd?: () => void;
    onEdit?: (id: string) => void;
}

export default ({ id, onAdd, onEdit }: Props) => {
    const requestActions = simpleRequestActions();
    const service = VehicleServiceAPI(requestActions);
    const [vehicleBasicinfo, setVehicleBasicInfo] = useState<VehicleListItem>();
    const parm = useParams();
    const tab = parm["tab"];
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
        visible?: { 
            name: 'modal'; 
            type: 'ADD' | 'Edit'; 
            vehicleId?: VehicleListItem; 
            driver?: DriverDTO, 
            vehicleDriver?: VehicleDriverDTO 
        };
    }>({});

    const actionRef = useRef<ActionType>();
    const initData = useCallback(async () => {
        const initData = await service.fetchVehicle(id)
        setVehicleBasicInfo(initData);
    }, [id]);
    useEffect(() => {
        initData()
    }, [initData])
    const tabItem = [
        {
            label: "General Info",
            key: "info",
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
            key: 'maintenance',
            children: <Meintennece id={id} />,
        },
        {
            label: `Fuel History`,
            key: 'fuel',
            children: <FuelHistory id={id} />,
        },
        {
            label: "Inpection History",
            key: "inspection",
            children: <InspectionView vehicleId={id} />
        },
        {
            label: "Operator",
            key: "operation",
            children: <AssignDriver vehicleId={id} />
        },
        {
            label: `Service Reminder`,
            key: 'reminder',
            children: <ServiceReminder id={id} />
        },
        {
            label: `Specifications`,
            key: 'specification',
            children: <Specifications id={id} />
        },
        {
            label: `Accidentals`,
            key: 'accidental',
            children: <AccidentListView vehicleId={id} />
        },
        {
            label: `Accessories`,
            key: 'accessories',
            children: <Accessories id={id} />
        },
        {
            label: `Meter History`,
            key: 'meter',
            children: <MeterHistory id={id} />
        },

    ]


    const routes = [
        {
            path: FleetPaths.fleet,
            label: 'Fleet',
        },
        {
            path: FleetPaths.vehicle + "/list",
            label: 'Vehicle',
        },
        {
            path: '',
            label: 'Detail',
        },
    ];
    return (
        <>
            <Spin spinning={requestActions.request?.loading}>
                <PageContainer
                    onBack={() => history.push(`${FleetPaths.vehicle}/list`)}
                    title="Details"
                    subTitle={`#${vehicleBasicinfo?.plateNumber}`}
                    extra={[
                        <Button
                            icon={<EditFilled />}
                            onClick={() => onEdit?.(id)}
                        >
                            Edit Info
                        </Button>,
                        <Button
                            onClick={() => onAdd?.()}
                            type="primary"
                            icon={<PlusCircleFilled />}
                        >
                            New
                        </Button>
                    ]}
                >
                    <Tabs
                        defaultActiveKey="1"
                        items={tabItem}
                    />
                </PageContainer>


                {/* <Row justify="space-between">
                    <BreadCrumbCom separator=">" routes={routes} />
                    <Space>

                    </Space>
                </Row> */}



            </Spin>


        </>
    )
}