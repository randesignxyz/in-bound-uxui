
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import Status from "@/components/Status";
import { DrawerForm, DrawerFormProps, ModalForm, ProFormSegmented, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import { useState } from "react";
import { IOSService } from "./service";
import { simpleRequestActions } from "@/services/model";
import { Segmented } from "antd";


interface Props extends DrawerFormProps {
    onSubmit?: (data: any) => void
}


const BatchSubmitDrawer: React.FC<Props> = ({ onSubmit, ...props }) => {
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({});
    const { data, isFetching: iosFetching, isError } = useQuery({
        queryKey: ["ios-data", filter],
        queryFn: () => IOSService.page4Batch(filter),
        refetchOnWindowFocus: false,
        enabled: !!props.open
    });
    const [rowSelectionState, setRowSelectionState] = useState<number[]>([]);
    return (
        <>
            <DrawerForm
                {...props}
                title={"Batch Submite and Approve Form"}
                submitter={{
                    searchConfig: {
                        submitText: "Submit",
                        resetText: "Cancel"
                    },

                }}
                onFinish={async (param) => {
                    console.log(param);

                    onSubmit?.({
                        ids: rowSelectionState,
                        ...param
                    })
                }}

            >
                <ProTable
                    search={false}
                    options={false}
                    dataSource={data?.items}
                    loading={iosFetching}
                    style={{
                        marginTop: "-20px"
                    }}
                    rowSelection={{
                        preserveSelectedRowKeys: true,
                        onChange: (selectedRowKeys) => {
                            setRowSelectionState(selectedRowKeys as number[])
                        }
                    }}
                    headerTitle={<>
                        <ProFormSegmented
                            name="action"
                            initialValue={"SUBMITTED"}
                            request={async () => [
                                { label: "Submit", value: "SUBMITTED" },
                                { label: "Endorse", value: "ENDORSED" },
                                { label: "Approve", value: "APPROVED" },
                                { label: "Return", value: "RETURN" },
                            ]}
                            fieldProps={{
                                onChange: (value) => {
                                    setFilter((o) => ({
                                        ...o,
                                        criteria: {
                                            ...o.criteria,
                                            batchRequest: value
                                        }
                                    }))
                                }
                            }}
                        />
                    </>}
                    rowKey={"id"}
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


        </>
    )
}

export default BatchSubmitDrawer;