import PageWrapper from "@/components/PageWrapper";
import IOSForm from "./IOSForm";
import { useQuery } from "@umijs/max";
import { IOSService } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import AdvancSearch from "./AdvancSearch";
import { Button } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";


export default () => {
    const requestAction = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({});
    const [advanceSearchState, setAdvanceSearchState] = useState<{ visible?: { open: boolean, payload?: any } }>();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['ipo-list', filter],
        queryFn: () => IOSService.page(filter).query(requestAction),
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 0,
        cacheTime: 0,
    })
    return (
        <>
            <PageWrapper
                tabRender={(item) => [
                    {
                        tabKey: item?.id?.toString(),
                        tabLabel: `${item?.empNo} - ${item?.empName}`,
                        action: "edit",
                        actionLabel: "Edit IOS",
                        panel: ({ }) => <IOSForm id={item?.id} />
                    },
                    {
                        tabKey: item?.id?.toString(),
                        tabLabel: `${item?.empNo} - ${item?.empName}`,
                        action: "view",
                        actionLabel: "Detail IOS",
                        panel: ({ onCloseTab }) => <IOSForm id={item?.id} onCancel={() => onCloseTab?.()} />
                    }
                ]}
                listView={{
                    type: "Table",
                    title: "IOS Performance Review",
                    onRefresh: refetch,
                    onFilter(params, page, sort) {
                        setFilter({
                            criteria: {
                                ...params
                            },
                            pagination: page,

                        })
                    },
                    statuses: [
                        { option: { label: "Submmited", value: "Submitted" } },
                        { option: { label: "Approved", value: "Approved" } },
                        { option: { label: "Rejected", value: "Rejected" } }
                    ],
                    advanceSearchButton: <Button icon={<FileSearchOutlined style={{ color: filter.criteria?.advanceSearch ? "red" : "" }} />}
                        onClick={() => setAdvanceSearchState({ visible: { open: true } })}
                    />,
                    props: {
                        dataSource: data?.items,
                        loading: isLoading,
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
                                title: "Sub Function",
                                dataIndex: "subDeptName"
                            },
                            {
                                title: "Function",
                                dataIndex: "deptName"
                            },
                            {
                                title: "Company",
                                dataIndex: "buName"
                            },

                            // {
                            //     title: "Date",
                            //     dataIndex: "createdDate",
                            //     valueType: "date"
                            // },
                            {
                                title: "Status",
                                dataIndex: "status"
                            }
                        ]
                    }
                }}
            />
            <AdvancSearch {...advanceSearchState?.visible}
                onCancel={() => setAdvanceSearchState({ visible: { open: false } })}
                onFinish={async (param) => {
                    setFilter((p) => ({
                        criteria: {
                            ...p.criteria,
                            advanceSearch: { ...param }
                        }
                    }))
                }}
                onReset={() => {
                    setFilter((p) => ({
                        criteria: {
                            ...p.criteria,
                            advanceSearch: undefined
                        }
                    }))
                }}
            />
        </>
    )
};
