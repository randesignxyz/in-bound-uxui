import { EditFilled, PlusCircleFilled } from "@ant-design/icons";
import { ActionType } from "@ant-design/pro-components";
import { Button, Row, Space, Spin, Tabs } from "antd";
import { useState, useCallback, useEffect, useRef } from "react"
import { simpleRequestActions } from "@/services/model";
import { VehicleListItem } from "./data";
import BasicInfo from "../components/BasicInfo";
import BreadCrumbCom from "@/pages/sale/retailer/components/BreadCrumbCom";
import { VehicleServiceAPI } from "./service";
import { FleetPaths } from "..";
import AssignDriver from "./view/AssignDriver";
import MeterHistory from "./view/MeterHistory";
import Specifications from "./view/Specifications";
import FuelHistory from "./view/FuelHistory";
import InspectionView from "./view/InspectionView";
import ServiceReminder from "./view/ServiceReminder";
import Meintennece from "./view/Meintennece";
import Accident from "./view/Accident";
import Accessories from "./view/Accessories";

interface Props {
    id: string;
    onAdd?: ()=>void;
    onEdit?:(id:string) =>void;
}

export default ({ id, onAdd, onEdit}: Props) => {
    const requestActions = simpleRequestActions();
    const service = VehicleServiceAPI(requestActions);
    const [vehicleBasicinfo, setVehicleBasicInfo] = useState<VehicleListItem>();
    const [state, setSate] = useState<{
        visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: VehicleListItem } };

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
            label:"General Info",
            key:"1",
            children:(
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
            label:"Inpection History",
            key:"4",
            children:<InspectionView id={id}/>
        },
        {
            label:"Operator",
            key:"5",
            children:<AssignDriver id={id} />
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

    ]


    const routes = [
        {
            path: FleetPaths.fleet,
            label: 'Fleet',
        },
        {
            path: FleetPaths.vehicle+"/list",
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

                <Row justify="space-between">
                    <BreadCrumbCom separator=">" routes={routes} />
                    <Space>
                    <Button 
                                icon={<EditFilled />}
                                onClick={() => onEdit?.(id)}
                            >
                                Edit Info
                            </Button>
                            <Button
                                onClick={() => onAdd?.()}
                                type="primary"
                                icon={<PlusCircleFilled />}
                            >
                                New
                            </Button>
                    </Space>
                </Row>
                <Tabs
                        defaultActiveKey="1"
                        items={tabItem}
                />

            </Spin>

            
        </>
    )
}