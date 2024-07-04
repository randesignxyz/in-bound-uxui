import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { Button, Card, Col, Flex, Modal, Row, Tag, message } from "antd";
import { TireAssignCreate, TireAssignParam, TireVehicleDTO } from "../specification/data";
import { simpleRequestActions } from "@/services/model";
import { TireServiceAPI } from "./service";
import { useRef, useState } from "react";
import { ActionType, ProDescriptions, ProList } from "@ant-design/pro-components";
import TiresInterface from "../components/Tires";
import { formatDate } from "@/pages/utils";
import { Vehicle } from "../vehicle/data";
import TireAssigntoVehicleModal from "./AssignTireVehicle";
import { SpecificationServiceAPI } from "../specification/service";

interface Props {
    vehicleId: string
}

const TireVehicleAssignListView: React.FC<Props> = ({ vehicleId }) => {
    const requestAction = simpleRequestActions();
    const services = TireServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    const [tireDataList, setTireDataList] = useState<TireVehicleDTO[]>();
    const [tireDataLists, setTireDataLists] = useState<TireVehicleDTO[]>();
    const [tireInfo, setTireInfo] = useState<any>();
    const [tireFormState, setTireFormState] = useState<{
        visible?: {
            name: "MODAL",
            payload?: Vehicle
        }
    }>();
    const onRequestHandler = async (params: TableViewSearchParams<TireAssignParam>) => {
        try {
            const data = await services.page({
                criteria: {
                    advanceSearch: {
                        vehicleId: vehicleId,
                        tirePosition: params.criteria?.advanceSearch?.tirePosition
                    },
                    sort: params.criteria?.sort
                }
            });
            if (params.criteria?.advanceSearch?.tirePosition == null) {
                setTireDataList(data.items);
            }
            setTireDataLists(data.items);
            return Promise.resolve({
                data: data.items,
                success: true
            })
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    };
    return (
        <>
            <Card
                size="small"
                title="Tires"
                key={'tires'}
                extra={[
                    <Button
                        type="link"
                        onClick={() => setTireFormState({visible:{name:"MODAL"}})}
                    >
                        Tire Configuration
                    </Button>,
                ]}
            >
                <Row gutter={12}>
                    <Col xl={8} >
                        <Flex vertical gap={10}>
                            <Card>
                                <ProDescriptions
                                    dataSource={tireInfo}
                                    column={1}
                                    columns={[
                                        {
                                            label: "Position",
                                            dataIndex: "label",
                                        },
                                    ]}
                                />
                            </Card>
                                <TiresInterface
                                    onTireClick={(e) => {
                                        setTireInfo(e)
                                        onRequestHandler({
                                            criteria: {
                                                advanceSearch: {
                                                    vehicleId: vehicleId,
                                                    tirePosition: e?.value || "Sa"
                                                }
                                            }
                                        });
                                    }}
                                    dataSource={tireDataList?.map(it => ({ value: it.tirePosition, key: it.tirePosition, }))}
                                    key={Math.random()}
                                />
                        </Flex>
                    </Col>
                    <Col xl={16} sm={24} md={24}>
                        {/* <ProTable
                        search={false}
                        size="small"
                        // request={ onRequestHandler}
                        request={(params, sorter, filter) => {
                            console.log(sorter);
                            return onRequestHandler({
                                criteria: {
                                    sort: sorter
                                }
                            })
                        }}
                        dataSource={tireDataLists}
                        actionRef={actionRef}
                        columns={[
                            {
                                key: 'operation',
                                title: 'Operation',
                                sorter: "operation",
                                dataIndex: "operation",

                            },
                            {
                                key: 'tireSize',
                                title: 'Tire Size',
                                // sorter:"tireWidth",
                                sorter: (a, b) => a.tireWidth - b.wheelDiameter,
                                render: (_, r) => [r.tireWidth, r.wheelDiameter].filter((it) => it).join('/'),
                            },
                            {
                                key: 'tireInfo',
                                sorter: 'brand',
                                title: 'Tire Info',
                                render: (_, r) => [r.brand, r.model, r.code].filter((it) => it).join('/'),
                            },

                            {
                                key: 'position',
                                title: 'Position',
                                dataIndex: 'tirePosition',
                                sorter: 'tirePosition',
                            },
                            {
                                key: 'durability',
                                title: 'Durability',
                                dataIndex: 'durability',
                                sorter: 'durability',
                            },
                            {
                                key: 'purchaseDate',
                                title: 'Purchase Date',
                                valueType: 'date',
                                dataIndex: 'purchaseDate',
                                sorter: 'purchaseDate',
                            },
                            {
                                key: 'lastModified',
                                title: 'Last Modified by',
                                dataIndex: 'lastModifiedBy',
                                sorter: 'lastModifiedBy',
                            },
                            {
                                title: "Status",
                                dataIndex: "status",
                                sorter: "status",
                                render: (_, r) => <Badge text={r.status} status={r.status == "using" ? "processing" : "error"} />
                            },
                            {
                                render: (_, r) => {
                                    return (
                                        <>
                                            <Button
                                                icon={<EditOutlined />}
                                                type="link"
                                                onClick={() => {
                                                    // setTireItemState((v) => ({
                                                    //   ...v,
                                                    //   visible: { name: 'modal', type: 'Edit', payload: { enity: r } },
                                                    // }));
                                                }}
                                            />
                                        </>
                                    );
                                },
                            },
                        ]}
                    /> */}
                        <ProList<TireVehicleDTO>
                            headerTitle={"Tires History"}
                            options={{
                                reload: true,
                                density:false,
                                setting:false
                            }}
                            pagination={{
                            }}
                            metas={{
                                title: {
                                    dataIndex: "tirePosition"
                                },
                                subTitle: {
                                    render: (_, r) => <Flex>
                                        <Tag color="blue">{r.operation}</Tag>
                                        <Tag color="cyan">{r.createdBy}</Tag>
                                    </Flex>
                                },
                                actions: {
                                    render: (_, r) => [
                                        <a>{formatDate(r.purchaseDate)}</a>
                                    ],  
                                },
                                description: {
                                    render: (_, r) => (
                                        <ProDescriptions
                                            dataSource={r}
                                            column={3}
                                            size="small"
                                            columns={[
                                                {
                                                    title: "model",
                                                    dataIndex: "model"
                                                },
                                                {
                                                    title: "Brand",
                                                    dataIndex: "brand"
                                                },
                                                {
                                                    title: "Code",
                                                    dataIndex: "code"
                                                },
                                                {
                                                    title: "Tire Width",
                                                    dataIndex: "tireWidth"
                                                },
                                                {
                                                    title: "Wheel Diameter ",
                                                    dataIndex: "wheelDiameter"
                                                },
                                                {
                                                    title: "Durability",
                                                    dataIndex: "durability"
                                                },
                                                {
                                                    title: "Production Date",
                                                    dataIndex: "productionDate",
                                                    valueType: "date"
                                                },
                                                {
                                                    title: "Purchase Date",
                                                    dataIndex: "purchaseDate",
                                                    valueType: "date"
                                                }
                                            ]}
                                        />
                                    )
                                },
                            }}
                            dataSource={tireDataLists}
                            expandable={{
                                showExpandColumn: true
                            }}
                            actionRef={actionRef}
                            request={(params, sorter, filter) => {
                                return onRequestHandler({
                                    criteria: {
                                        sort: sorter
                                    }
                                })
                            }}
                        />
                    </Col>
                </Row>
                <TireAssigntoVehicleModal
                    open={tireFormState?.visible?.name === "MODAL"}
                    onCancel={() => setTireFormState({ visible: undefined })}
                    vehicleId={vehicleId}
                    onSave={(data:TireAssignCreate)=>{
                        Modal.confirm({
                          title:"Save tire for vehicle",
                          content:"are your sure record your enter is correct?",
                          onOk:async()=>{
                            SpecificationServiceAPI(requestAction).saveVehicleTire(data);
                            setTireFormState({visible:undefined});
                            actionRef.current?.reloadAndRest?.()
                          }
                        })
                    }}
                />
            </Card>
        </>
    )
}

export default TireVehicleAssignListView