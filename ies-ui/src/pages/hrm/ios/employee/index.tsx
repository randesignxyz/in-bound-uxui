import PageWrapper from "@/components/PageWrapper";
import { useQuery } from "@umijs/max";
import EmpoyeeIosDetail from "./detail";
import { simpleRequestActions } from "@/services/model";
import { EmployeeIOSAPI } from "./service";
import { useState } from "react";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";

export default function Employee() {
    const requestAction = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({

    })
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['hrm-ipo-employee'],
        queryFn: async () => EmployeeIOSAPI.page(filter).query(requestAction),
        refetchOnWindowFocus: false,
    })
    return <>
        <PageWrapper
            tabRender={(item) => [
                {
                    key: item?.id,
                    tabKey: item?.id,
                    tabLabel: "Detail",
                    action: "view",
                    panel: () => <EmpoyeeIosDetail id={item?.id ?? 0} />
                }
            ]}
            listView={{
                type: "Table",
                title: "Employee IOS List",
                onRefresh: () => refetch(),
                props: {
                    dataSource: data,
                    columns: [
                        {
                            title: "Employee ID",
                            dataIndex: "empNo"
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
                            title: "Department",
                            dataIndex: "deptName"
                        },
                        {
                            title: "Status",
                            dataIndex: "status"
                        }
                    ]
                }
            }}
        />
    </>
}