import { Card, Col, Drawer, DrawerProps, Flex, Row, Tabs, Typography } from "antd"
import { AccessoriesDTO } from "./data"
import { ActionType, ProDescriptions, ProList } from "@ant-design/pro-components"
import { simpleRequestActions } from "@/services/model"
import { ActivityLogDTO } from "../data"
import { formatDateTime } from "@/pages/utils"
import moment from "moment"
import { Tag } from "antd/lib"
import { AccessoryServiceAPI } from "./service"
import { useEffect, useRef } from "react"
import ImageViewer from "@/pages/crm/components/ImageViewer"
import numeral from "numeral"

interface Props extends DrawerProps {
    data?: AccessoriesDTO;
}
const AccessoryDetailView = ({ data, ...props }: Props) => {
    const requestAction = simpleRequestActions();
    const service = AccessoryServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    useEffect(() => {
        actionRef.current?.reloadAndRest?.();
    }, [props.open, data]);

    return (
        <Drawer
            {...props}
            title="Accessory Detail"
            width={720}
        >
            <Flex gap={12}>
                <Card
                    styles={{
                        body:{
                            padding:"5px"
                        }
                    }}
                >
                    <ImageViewer
                        width={180}
                        fileId={
                            data?.imageId ?
                             data?.imageId :
                              ""}
                    />
                </Card>
                <ProDescriptions
                    column={1}
                    style={{
                        fontWeight: "500"
                    }}
                    dataSource={data}
                    columns={[
                        {
                            title: "Name",
                            dataIndex: "name",
                        },
                        {
                            title: "Part Number",
                            dataIndex: "partNumber",
                        },

                        {
                            title: "Quantity",
                            dataIndex: "qty",
                            render: (_, r) => <Typography.Text type="warning">{numeral(r.qty).format("0,000.00")} {r.unitType}</Typography.Text>
                        },
                        {
                            title: "Unit Cost",
                            dataIndex: "unitCost",
                            valueType: "money",
                            render: (_, r) => <Typography.Text type="warning">{numeral(r.unitCost).format("$ 0,000.00")}</Typography.Text>,
                            contentStyle: {
                                color: "success"
                            }
                        },
                        {
                            title: "Status",
                            render: (_, r) => <Typography.Text type={r.status == "Active" ? "success" : "danger"}>{r.status}</Typography.Text>
                        }
                    ]}
                />
            </Flex>
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
                                    fontWeight: "500"
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
                                        render: (_, r) => r.category?.name
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
                                        dataIndex: "qty",
                                        render: (_, r) => <Typography.Text type="warning">{numeral(r.qty).format("0,000.00")}</Typography.Text>
                                    },
                                    {
                                        title: "Unit Cost",
                                        dataIndex: "unitCost",
                                        render: (_, r) => <Typography.Text type="warning">{numeral(r.unitCost).format("$ 0,000.00")}</Typography.Text>
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
                                        span: 2
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
                                request={async (params = {} as Record<string, any>) => {
                                    const dataList = await service.pageActivityLog({
                                        criteria: {
                                            searchValue: "",
                                            advanceSearch: {
                                                source: "ACCESSORY",
                                                referenceIntId: data?.id
                                            },
                                        },
                                        pagination: {
                                            current: params.current,
                                        }
                                    });
                                    return Promise.resolve({
                                        data: dataList.items,
                                        success: true
                                    })
                                }}
                                pagination={{
                                }}
                                actionRef={actionRef}
                                metas={{
                                    title: {
                                        dataIndex: "activity"
                                    },
                                    subTitle: {
                                        render: (_, r) => (<>
                                            <Tag color="blue" bordered={false}>{`by ${r.createdBy} `}</Tag>
                                            <Tag color="cyan" bordered={false}>{moment(moment(r.createdDate)).fromNow()}</Tag>
                                        </>)
                                    },
                                    description: {
                                        render: (_, r) => (<>
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