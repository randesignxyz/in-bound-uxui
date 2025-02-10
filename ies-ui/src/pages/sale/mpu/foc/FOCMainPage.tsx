import PageWrapper from "@/components/PageWrapper"
import { useQuery } from "@umijs/max";
import { Button, Modal, Space, Tag, Typography } from "antd"
import { useRef, useState } from "react";
import { FOCServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { RollbackOutlined, RotateRightOutlined } from "@ant-design/icons";
import FOCDetail from "./Detail";

interface Props {

}

const FOCMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [filter, setFilter] = useState<TableViewSearchParams<FOCSearchParam>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })
    const { data, isFetching, refetch } = useQuery(['fetch-po-list', filter], () => FOCServiceAPI(requestActions).page(filter), {
        refetchOnWindowFocus: false,
        keepPreviousData: false
    });
    const expendableRender = (parent: any) => {
        return (
            <ProTable
                search={false}
                options={false}
                ghost
                dataSource={parent.foc}
                pagination={false}
                columns={[
                    {
                        title: "Item Code",
                        dataIndex: "itemCode"
                    },
                    {
                        title: "Item Name",
                        dataIndex: "itemName"
                    },
                    {
                        title: "Quantity",
                        dataIndex: "quantity"
                    },
                    {
                        title: "Used",
                        dataIndex: "usingQty"
                    },
                    {
                        title: "Remaining",
                        dataIndex: "usingQty"
                    },
                    
                ]}
            />
        );
    };
    return (
        <PageWrapper
            tabRender={(item)=>[
                {
                    action:"view",
                    tabLabel: [item?.assignedToCode, item?.assignedTo].filter(p => p).join("-"),
                    tabKey:item?.id,
                    panel:({ onCloseTab, onUpdateTab, key })=><FOCDetail
                        id={item?.id}
                    />
                }
            ]}
            listView={{
                type: "Table",
                title: "Free of Charge List",
                statuses: [
                    { option: { label: "All", value: "ALL" } },
                    { option: { label: "Pending", value: "Pending" } },
                    { option: { label: "Completed", value: "Completed" } },
                ],
                onRefresh: refetch,
                onFilter(params, page, sort) {
                    setFilter(v => ({
                        criteria: {
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                status: params?.status
                            }
                        },
                        pagination: { ...page },
                        sort: sort
                    }))
                },
                props: {
                    dataSource: data?.items,
                    actionRef: actionRef,
                    loading: isFetching,
                    expandable: { expandedRowRender: expendableRender },
                    columns: [
                        {
                            title: "Received By",
                            actionProps: (r) => ({
                                type: 'view',
                                label: [r.assignedToCode, r.assignedTo].filter(p => p).join("-") || 'n/a',
                            }),
                        },
                        {
                            title: "Distributor",
                            render: (_, r) => [r.distributorCode, r.distributorName].filter(p => p).join("-")
                        },
                        {
                            title: "Received Date",
                            dataIndex: "requestedDate",
                            valueType: "date"
                        },
                        // {
                        //     title: "Settlement Date",
                        //     dataIndex: "poDate",
                        //     valueType: "date"
                        // },
                        {
                            title: "Item Count",
                            render: (_, r) => r.foc?.length
                        },
                        {
                            title: "Status",
                            render: (_, r) => <Tag bordered={false} color={r.foc?.[0]?.status == "Completed" ? "success" : "processing"} >{r.foc?.[0]?.status}</Tag>
                        },
                        {
                            title: "Action",
                            render: (_, r) => <Button size="small"
                                hidden={r.foc?.[0]?.status == "Completed" ? true : false}
                                onClick={() => {
                                    Modal.confirm({
                                        title: `Return FOC borrowed From ${r.distributorCode}`,
                                        content: <Space direction="vertical">
                                            <Typography.Text>Make return stock to distrubutor for closed foc.</Typography.Text>
                                            <Typography.Text type="warning">are you sure?</Typography.Text>
                                        </Space>,
                                        onOk: async () => {
                                            FOCServiceAPI(requestActions).closedFOC({id:r.id});
                                            actionRef.current?.reload?.();
                                        }
                                    })
                                }}
                                type="link" icon={<RotateRightOutlined />}>Close</Button>
                        }
                    ]
                }
            }}
        />
    )
}


export default FOCMainPage