import { ActionType, ProTable } from "@ant-design/pro-components";
import { BatteryVehicleCreate, BatteryVehicleDTO, NormFuelConsumptionDTO } from "../data";
import { simpleRequestActions } from "@/services/model";
import { SpecificationServiceAPI } from "../service";
import { useRef, useState } from "react";
import { Button, Card, Modal, Space } from "antd";
import BatteryModalForm from "./BatteryModalForm";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";

interface Props {
    vehicleId: string;
}
const BatteryDescription: React.FC<Props> = ({ vehicleId }) => {
    const requestActions = simpleRequestActions();
    const services = SpecificationServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [state, setState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: BatteryVehicleDTO
        }
    }>();
    return (
        <>
            <Card
                size="small"
                title="Battery"
                extra={
                <Space>
                    <Button type="link"  onClick={() => setState({ visible: { name: "MODAL", type: "ADD" } })}>New</Button>
                    <Button type="link"  onClick={() => actionRef.current?.reload?.() } icon={<ReloadOutlined/>}/>
                </Space>
            }
            >
                <ProTable<BatteryVehicleDTO>
                    toolBarRender={false}
                    search={false}
                    size="small"
                    request={async () => {
                        const data = await services.listBattery(vehicleId);

                        return Promise.resolve({
                            data: data,
                            success: true,
                        });
                    }}
                    actionRef={actionRef}
                    columns={[
                        {
                            title: 'Band',
                            key: 'brand',
                            dataIndex: 'brand',
                        },
                        {
                            title: 'Code',
                            key: 'code',
                            dataIndex: 'code',
                        },
                        {
                            title: 'Power',
                            key: 'power',
                            dataIndex: 'power',
                        },
                        {
                            title: 'Quantity',
                            key: 'quantity',
                            dataIndex: 'quantity',
                        },
                        {
                            title: 'Production Date',
                            key: 'productionDate',
                            dataIndex: 'productionDate',
                        },
                        {
                            title: 'Durability',
                            key: 'durability',
                            dataIndex: 'durability',
                        },
                        {
                            title: 'Purchase Date',
                            key: 'purchase',
                            valueType: 'date',
                            dataIndex: 'purchaseDate',
                        },
                        {
                            render: (_, r) => {
                                return (
                                    <>
                                        <Button
                                            icon={<EditOutlined />}
                                            type="link"
                                            onClick={() => {
                                                setState({visible:{name:"MODAL",type:"ADD",payload:r}})
                                            }}
                                        />
                                    </>
                                );
                            },
                        },
                    ]}
                />
            </Card>
            <BatteryModalForm
                open={state?.visible?.name == "MODAL"}
                onCancel={() => setState({ visible: undefined })}
                onSave={(data: BatteryVehicleCreate) => {
                    Modal.confirm({
                        title: "Save Norm Consumtion",
                        content: "Are you sure?",
                        onOk: () => {
                            services.saveBattery({
                                ...data,
                                vehicleId: vehicleId
                            }).then(() => {
                                setState({ visible: undefined });
                                actionRef.current?.reload?.();    
                            });
                        }
                    })
                }}
                data={state?.visible?.payload}
            />
        </>
    )
}

export default BatteryDescription