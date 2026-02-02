import PageWrapper from "@/components/PageWrapper";
import IOSForm from "./IOSForm";
import IOSDetail from "./detail";
import { useQuery } from "@umijs/max";
import { IOSService } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";


export default () => {
    const requestAction = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({})
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['ipo-list', filter],
        queryFn: () => IOSService.page(filter).query(requestAction),
        refetchOnWindowFocus: false,
        // refetchOnMount: false,
        // refetchOnReconnect: false,
        retry: false,
        staleTime: 0,
        cacheTime: 0,
    })
    return (
        <PageWrapper
            tabRender={(item) => [
                {
                    tabKey: "add",
                    tabLabel: "Add IOS",
                    action: "add",
                    actionLabel: "Add IOS",
                    panel: ({ }) => <IOSForm actions={item?.iosWorkFlow?.actions} />
                },
                {
                    tabKey: "edit",
                    tabLabel: "Edit IOS",
                    action: "edit",
                    actionLabel: "Edit IOS",
                    panel: ({ }) => <IOSForm id={item?.id} />
                },
                {
                    tabKey: item?.id?.toString(),
                    tabLabel: `${item?.empNo} - ${item?.empName}`,
                    action: "view",
                    actionLabel: "Detail IOS",
                    panel: ({ }) => <IOSDetail id={parseInt(item.id?.toString() || "0")} />
                }
            ]}

            listView={{
                type: "Table",
                title: "IOS Performance Review",
                loading: isLoading,
                onRefresh: refetch,
                onFilter(params, page, sort) {
                    setFilter({
                        criteria: {
                            ...params
                        },
                        pagination: page,

                    })
                },
                props: {
                    dataSource: data?.items,
                    pagination: {
                        total: data?.total
                    },
                    columns: [

                        {
                            title: "Employee ID",
                            dataIndex: "empNo",
                            actionProps: (item) => ({
                                label: item.empNo,
                                action: "view",
                                type: "view",

                            })
                        },
                        {
                            title: "Employee Name",
                            dataIndex: "empName"
                        },
                        {
                            title: "Position",
                            dataIndex: "jobTitle"
                        },
                        {
                            title: "Date",
                            dataIndex: "createdDate",
                            valueType: "date"
                        },
                        {
                            title: "Status",
                            dataIndex: "status"
                        },
                        {
                            title: "Action",
                            dataIndex: "action",
                            actionProps: (item) => ({
                                label: <EditOutlined />,
                                action: "edit",
                                type: "edit",
                            }),

                        }
                    ]
                }
            }}
        />
    )
};
