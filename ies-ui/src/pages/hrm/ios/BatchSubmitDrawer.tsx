
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import Status from "@/components/Status";
import { DrawerForm, DrawerFormProps, ProTable } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import { useState } from "react";
import { IOSService } from "./service";
import { simpleRequestActions } from "@/services/model";


interface Props extends DrawerFormProps {

}


const BatchSubmitDrawer: React.FC<Props> = ({ ...props }) => {
    const requestAction = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({});
    const { data, isFetching: iosFetching, isError } = useQuery({
        queryKey: ["ios-data", filter],
        queryFn: () => IOSService.page(filter).query(requestAction),
        refetchOnWindowFocus: false,
        enabled: props.open
    });
    const [rowSelectionState, setRowSelectionState] = useState<number[]>([]);
    return (
        <DrawerForm
            {...props}
            title={"Batch Submite and Approve Form"}
        >
            <ProTable
                search={false}
                options={false}
                dataSource={data?.items}
                loading={iosFetching}
                rowSelection={{
                    selectedRowKeys: rowSelectionState,
                    preserveSelectedRowKeys: true,
                    onChange: (selectedRowKeys) => {
                        setRowSelectionState(selectedRowKeys as number[])
                    }
                }}
                pagination={{
                    pageSize: 20,
                    total: data?.total,
                    current: filter?.pagination?.current,
                    onChange: (page, pageSize) => {
                        setFilter((o) => ({
                            ...o,
                            pagination: {
                                current: page,
                                pageSize: pageSize
                            }
                        }))
                    }
                }}
                columns={[
                    {
                        title: "Employee ID",
                        dataIndex: "empNo",
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
                        title: "Company",
                        dataIndex: "buName"
                    },

                    {
                        title: "Function",
                        dataIndex: "deptName"
                    },
                    {
                        title: "Sub Function",
                        dataIndex: "subDeptName"
                    },

                    {
                        title: "Status",
                        dataIndex: "status",
                        render: (_: any, r: any) => <Status text={r.status} />
                    },
                    {
                        title: "Action Required By",
                        dataIndex: "currentActionBy"
                    }
                ]}
            />
        </DrawerForm>
    )
}

export default BatchSubmitDrawer;