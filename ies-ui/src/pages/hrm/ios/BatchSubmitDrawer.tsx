
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import Status from "@/components/Status";
import { DrawerForm, DrawerFormProps, ModalForm, ProFormSegmented, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import React, { useMemo, useState } from "react";
import { IOSService } from "./service";
import { Button, Row, Segmented, Space } from 'antd';
import { FilterOutlined, SelectOutlined } from '@ant-design/icons';
import BatchSumitAdvanceSearch from '@/pages/hrm/ios/BatchSumitAdvanceSearch';

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
  const isAdvancedFiltered = () => {
    const adv = filter.criteria?.advanceSearch;
    return (
      (adv?.buIds?.length ?? 0) > 0 ||
      (adv?.depIds?.length ?? 0) > 0 ||
      (adv?.subDepIds?.length ?? 0) > 0
    );
  };
  const advanceSearchIcon = useMemo(() => {
    return isAdvancedFiltered()
      ? <FilterOutlined style={{ color: "red" }} />
      : <SelectOutlined />;
  }, [filter.criteria?.advanceSearch]);
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
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
                    headerTitle={<div >
                      <Row gutter={16}>
                        <ProFormSegmented
                          name="action"
                          initialValue={"SUBMITTED"}
                          request={async () => [
                            { label: "Submit", value: "SUBMITTED" },
                            { label: "Endorse", value: "ENDORSED" },
                            { label: "Approve", value: "APPROVED" },
                            { label: "Send Back", value: "RETURN" },
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
                        <Button
                          style={{ margin: "0px 0px 0px 15px" }}
                          onClick={() => setAdvanceSearchVisible(true)}
                          icon={advanceSearchIcon}
                        />
                      </Row>
                    </div>}
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

          <BatchSumitAdvanceSearch
            open={advanceSearchVisible}
            onClose={() => setAdvanceSearchVisible(false)}
            onSearch={(params) => {
              setFilter((prev) =>
                ({
                  criteria:{
                    ...prev.criteria,
                    advanceSearch: {
                      ...prev.criteria?.advanceSearch,
                      ...params,
                    }
                  }
                }))
              setAdvanceSearchVisible(false);
            }}
            onReset={() => {
              setFilter((prev) => ({
                criteria: {
                  ...prev.criteria,
                  advanceSearch: {
                    buIds: [],
                    depIds: [],
                    subDeptIds: []
                  },
                },
                pagination: { ...prev.pagination, current: 1 },
              }));
            }}
          />
        </>
    )
}

export default BatchSubmitDrawer;
