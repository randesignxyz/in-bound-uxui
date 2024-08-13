import { Col, Drawer, DrawerProps, Row, Image, Tabs } from "antd"
import { AccessoriesDTO } from "./data"
import { ActionType, ProDescriptions, ProList } from "@ant-design/pro-components"
import { simpleRequestActions } from "@/services/model"
import { ActivityLogDTO } from "../data"
import { formatDateTime } from "@/pages/utils"
import moment from "moment"
import { Tag } from "antd/lib"
import { AccessoryServiceAPI } from "./service"
import { useEffect, useRef } from "react"

interface Props extends DrawerProps {
    data?: AccessoriesDTO;
}
const AccessoryDetailView = ({ data, ...props }: Props) => {
    const requestAction = simpleRequestActions();
    const service = AccessoryServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    useEffect(()=>{
        actionRef.current?.reloadAndRest?.();
    },[props.open]);

    return (
        <Drawer
            {...props}
            title="Accessory Detail"
            width={720}
        >
            <Row gutter={6}>
                <Col span={7}>
                    <Image
                        width={180}
                        height={180}
                        src="error"
                        fallback="data:image/png;base64,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"
                    />
                </Col>
                <Col span={17}>
                    <ProDescriptions
                        column={2}
                        style={{
                            fontWeight:"500"
                        }}
                        dataSource={data}
                        columns={[
                            {
                                title: "Name",
                                dataIndex: "name",
                                span: 2,
                            },
                            {
                                title: "Part Number",
                                dataIndex: "partNumber",
                                span:2
                            },
                           
                            {
                                title: "Quantity",
                                dataIndex: "qty",
                                render:(_,r)=>`${r.qty} ${r.unitType}`
                            },
                            {
                                title: "Unit Cost",
                                dataIndex: "unitCost",
                                valueType:"money",
                                contentStyle:{
                                    color:"success"
                                }
                            },
                        ]}
                    />
                </Col>
            </Row>
            <Tabs
                items={[
                    {
                        label: "Details",
                        key: "1",
                        children: (
                            <ProDescriptions
                                column={2}
                                dataSource={data}
                                style={{
                                    fontWeight:"500"
                                }}
                                columns={[
                                    {
                                        title: "Name",
                                        dataIndex: "name",
                                        span: 2,
                                    },
                                    {
                                        title: "Part Number",
                                        dataIndex: "partNumber"
                                    },
                                    {
                                        title: "Category",
                                        dataIndex: "category",
                                        render:(_,r)=>r.category?.name
                                    },
                                    {
                                        title: "Brand",
                                        dataIndex: "brand"
                                    },
                                    {
                                        title: "Model",
                                        dataIndex: "model"
                                    },
                                    {
                                        title: "Serial Number",
                                        dataIndex: "serialNumber"
                                    },
                                    {
                                        title: "Quantity",
                                        dataIndex: "qty"
                                    },
                                    {
                                        title: "Unit Cost",
                                        dataIndex: "unitCost"
                                    },
                                    {
                                        title: "Unit Cost",
                                        dataIndex: "unitCost",
                                        valueType: "money",
                                        
                                    },
                                    {
                                        title: "Unit Type",
                                        dataIndex: "unitType"
                                    },
                                    {
                                        title: "Warehouse",
                                        dataIndex: "warehouse"
                                    },
                                    {
                                        title: "Vendor",
                                        dataIndex: "vendor"
                                    },
                                    {
                                        title: "Manufacturer",
                                        dataIndex: "manufacturer",
                                        span:2
                                    },
                                    {
                                        title: "Description",
                                        dataIndex: "description"
                                    },
                                ]}
                            />
                        )
                    },
                    {
                        label: "History",
                        key: "2",
                        children: (
                            <ProList<ActivityLogDTO>
                                request={async(params = {} as Record<string, any>)=>{
                                    const dataList = await service.pageActivityLog({
                                        criteria:{
                                            searchValue:"",
                                            advanceSearch:{
                                                source:"ACCESSORY",
                                                referenceIntId:data?.id
                                            },
                                        },
                                        pagination:{
                                            current:params.current,
                                        }
                                    });
                                    return Promise.resolve({
                                        data:dataList.items,
                                        success:true
                                    })
                                }}
                                pagination={{
                                }}
                                actionRef={actionRef}
                                metas={{
                                    title: {
                                        dataIndex: "activity"
                                    },
                                    subTitle:{
                                        render:(_,r)=>(<>
                                            <Tag color="blue" bordered={false}>{`by ${r.createdBy} `}</Tag>
                                            <Tag color="cyan" bordered={false}>{moment(moment(r.createdDate)).fromNow()}</Tag>
                                        </>)
                                    },
                                    description:{
                                        render:(_,r)=>(<>
                                            <span>{`${r.remark} `}</span>
                                            </>
                                        )
                                    },
                                    actions: {
                                        render: (_, r) => <a>{formatDateTime(r.createdDate)}</a>
                                    }
                                }}
                            />
                        )
                    },
                ]}
            />
        </Drawer>
    )
}

export default AccessoryDetailView