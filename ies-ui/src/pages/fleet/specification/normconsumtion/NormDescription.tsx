import { ActionType, ProDescriptions } from "@ant-design/pro-components";
import { NormFuelConsumptionCreate, NormFuelConsumptionDTO } from "../data";
import { simpleRequestActions } from "@/services/model";
import { SpecificationServiceAPI } from "../service";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Modal } from "antd";
import NormFuelConsumtion from "./NormModalForm";

interface Props {
    vehicleId: string;
}
const NormDescription: React.FC<Props> = ({ vehicleId }) => {
    const requestActions = simpleRequestActions();
    const services = SpecificationServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [items, setItems] = useState<NormFuelConsumptionDTO>();
    const [state, setState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: NormFuelConsumptionCreate
        }
    }>();
    const loadData = async()=>{
        const data = await services.fetchNormFuelConsumption(vehicleId);
        setItems(data);
    }
    useEffect(()=>{
        loadData();
    }, [vehicleId]);
    return (
        <>
            <Card
                size="small"
                title="Fuel Consumption Norm"
                extra={<Button type="link" onClick={()=>setState({visible:{name:"MODAL", type:"ADD",payload:items }})}>Edit</Button>}
            >
                <ProDescriptions<NormFuelConsumptionDTO>
                    column={4}
                    loading={requestActions.request?.loading}
                    dataSource={items}
                    actionRef={actionRef}
                    contentStyle={{ fontWeight: 'bold' }}
                    columns={[
                        {
                            title: 'Tank Capacity',
                            key: '1',
                            dataIndex: 'tankCapacity',
                        },
                        {
                            title: 'Usage (WH2)',
                            key: '2',
                            dataIndex: 'usage',
                        },
                        {
                            title: 'Km/Month',
                            key: '3',
                            dataIndex: 'kilometer',
                        },
                        {
                            title: 'Usage Rate',
                            key: '4',
                            dataIndex: 'usageRate',
                        },
                        {
                            title: 'Remark',
                            key: '5',
                            dataIndex: 'remark',
                        },
                    ]}
                />
            </Card>
            <NormFuelConsumtion
                open={state?.visible?.name=="MODAL"}
                onCancel={()=>setState({visible:undefined})}
                onSave={(data:NormFuelConsumptionCreate)=>{
                    Modal.confirm({
                        title:"Save Norm Consumtion",
                        content:"Are you sure?",
                        onOk:()=>{
                            services.saveNormFuelConsumption({
                                ...data,
                                vehicleId:vehicleId
                            }).then(()=>{
                                setState({visible:undefined});
                                loadData();
                            });
                        }
                    })
                }}
                data={state?.visible?.payload}
            />
        </>
    )
}

export default NormDescription