import { simpleRequestActions } from "@/services/model";
import { AccidentCreate, AccidentDTO } from "./data";
import { AccidentServiceAPI } from "./service";
import { Button, Modal } from "antd";
import { formatDate, formatter } from "@/pages/utils";
import { PlusOutlined } from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useRef, useState } from "react";
import DetailView from "./DetailView";
import AccidentModalForm from "./EntiryForm";
interface Props {
    vehicleId: string
}
export default ({ vehicleId }: Props) => {
    const requestActions = simpleRequestActions();
    const services = AccidentServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [state, setSate] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payloads?: AccidentDTO
        }
    }>();
    const [detailState, setDetailSate] = useState<{
        visible?: {
            name: "DRAWER";
            payloads?: AccidentDTO
        }
    }>();
    return (
        <>
            <ProTable<AccidentDTO>
                search={false}
                actionRef={actionRef}
                size='small'
                toolBarRender={() => [
                    <Button
                        icon={<PlusOutlined />}
                        type={"link"}
                        onClick={() => setSate({ visible: { name: "MODAL", type: "ADD" } })}
                    />
                ]}
                options={{
                    density: false,
                    setting: false
                }}
                request={async () => {
                    const data = await services.page({
                        criteria: {
                            advanceSearch: {
                                vehicleId: vehicleId
                            }
                        }
                    })
                    return Promise.resolve({
                        data:data.items,
                        sucess:true
                    })
                }}
                columns={[
                    {
                        key: "date",
                        title: "Accident Date",
                        valueType: "dateTime",
                        dataIndex: "accidentDate",
                        render: (_, r) => (<>
                            <Button
                                type="link"
                                onClick={() => setDetailSate({ visible: { name: "DRAWER", payloads: r } })}
                            >{formatDate(r.accidentDate)}</Button>
                        </>)
                    },
                    {
                        key: "drivername",
                        title: "Driver Name",
                        render: (_, r) => [r.driverName.firstName, r.driverName.lastName].filter(it => it).join("-")
                    },
                    {
                        key: "payment",
                        title: "Payment Out",
                        dataIndex: "payment",
                        render: (_, r) => formatter.format(r.payment)
                    },
                    {
                        key: "accidentType",
                        title: "Accident Type",
                        render: (_, r) => [r.accidentType?.name, r.lightConditions?.name, r.weather?.name, r.preAccident?.name].filter(it => it).join("/")
                    },
                    {
                        key: "createdBy",
                        title: "Create By",
                        dataIndex: "createdBy"
                    }
                ]}
            />
            <AccidentModalForm
                open={state?.visible?.name === "MODAL"}
                onCancel={() => setSate({ visible: undefined })}
                vehicleId={vehicleId}
                onSave={(data:AccidentCreate) => {
                    Modal.confirm({
                        title:"Save accident infomation",
                        content:"are you sure?",
                        onOk:()=>{
                            services.save(data).then(()=>{
                                setSate({visible:undefined});
                                actionRef.current?.reload?.();
                            })
                        }
                    })
                }}
            />
            <DetailView
                open={detailState?.visible?.name === "DRAWER"}
                onClose={() => setDetailSate({ visible: undefined })}
                data={detailState?.visible?.payloads}
            />

        </>
    )
} 