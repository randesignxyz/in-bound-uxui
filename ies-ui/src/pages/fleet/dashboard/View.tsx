
import { Col, Dropdown, MenuProps, Row, Space } from "antd";
import TruckFuelUsage from './chart/TruckFuelusage';
import TruckMaintenanceCost from "./chart/TruckMaintenanceCost";
import ServiceTaskTracker from "./chart/ServiceTaskTracker";
import { DownOutlined, ExpandOutlined, FileExcelFilled, FilePdfOutlined, FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useState } from "react";
import MonthlyAvgTruckRepair from "./chart/MonthlyAvgTruckRepair";
import DeselFuelCompareBetweenDate from "./chart/DeselFuelCompareBetweenDate";
import VehicleInspectionDaysInMonth from "./chart/VehicleInspectionDaysInMonth";
import { PageContainer } from "@ant-design/pro-components";
import { history } from "@umijs/max";

export default () => {
    const [displayState, setDisplayState] = useState(12);

    const items: MenuProps["items"] = [
        {
            key: 1,
            label: "Small",
            onClick: () => {
                setDisplayState(8)
            },
            itemIcon: <FullscreenExitOutlined />
        },
        {
            key: 2,
            label: "Medium",
            onClick: () => {
                setDisplayState(12)
            },
            itemIcon: <ExpandOutlined />
        },
        {
            key: 3,
            label: "Larg",
            onClick: () => {
                setDisplayState(24)
            },
            itemIcon: <FullscreenOutlined />
        },
    ];
    const itemReport: MenuProps["items"] = [
        {
            key: 1,
            label: "Excel",
            onClick: () => {
                setDisplayState(24)
            },
            itemIcon: <FileExcelFilled />
        },
        {
            key: 2,
            label: "PDF",
            onClick: () => {
                setDisplayState(24)
            },
            itemIcon: <FilePdfOutlined />
        },
    ];

    return (
        <>
            <PageContainer
                title="Dashboard"
                fixedHeader
                onBack={() => history.push("/fleet")}
                extra={[
                    <Space size={20}>

                        <Dropdown
                            menu={{
                                items,
                                style: {
                                    width: "200px"
                                }
                            }}
                        >
                            <a>Display <DownOutlined /></a>
                        </Dropdown>
                    </Space>
                ]}
            >
                <div style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                </div>

                <Row gutter={16} justify={"space-between"} >
                    <Col span={24}>
                    </Col>
                    <Col span={displayState} style={{ marginBottom: 16 }} >
                        <TruckFuelUsage />
                    </Col>
                    <Col span={displayState} style={{ marginBottom: 16 }}>
                        <TruckMaintenanceCost />
                    </Col>
                    <Col span={displayState} style={{ marginBottom: 16 }}>
                        <ServiceTaskTracker />
                    </Col>
                    <Col span={displayState} style={{ marginBottom: 16 }}>
                        <MonthlyAvgTruckRepair />
                    </Col>
                    <Col span={displayState} style={{ marginBottom: 16 }}>
                        <DeselFuelCompareBetweenDate />
                    </Col>
                    <Col span={displayState} style={{ marginBottom: 16 }}>
                        <VehicleInspectionDaysInMonth />
                    </Col>
                </Row>

            </PageContainer>
        </>
    )
}