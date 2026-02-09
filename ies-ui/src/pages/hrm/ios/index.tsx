import PageWrapper from "@/components/PageWrapper";
import IOSForm from "./IOSForm";
import { history, useQuery } from "@umijs/max";
import { IOSService } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useRef, useState } from 'react';
import { simpleRequestActions } from "@/services/model";
import AdvancSearch from './AdvancSearch';
import { Button, message } from 'antd';
import { FileSearchOutlined } from "@ant-design/icons";
import ImportFileButton from '@/components/ImportFileButton';
import { DataResponse, ImportDataItem } from '@/services/shared/data';
import UploadData from '@/pages/hrm/ios/upload-data';
import { ActionType } from '@ant-design/pro-components';


export default () => {
    const requestAction = simpleRequestActions();
  const [importData, setImportData] = useState<DataResponse<ImportDataItem>>();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({});
  const actionRef = useRef<ActionType>();
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
                    onStatusRender: false,
                    statuses: [],
                    onRefresh: refetch,
                    onFilter(params, page, sort) {
                        setFilter({
                            criteria: {
                                ...params
                            },
                            pagination: page,

                        })
                    },
                  actionButtons: [
                      <ImportFileButton<ImportDataItem>
                        importedKey="IMPORT_OBJECTIVE_IOS"
                        onDataResponse={data => {
                          setImportData(data)
                        }}
                        key={"IMPORT_OBJECTIVE_IOS"}
                        onHandleChange={(status) => {
                          if (status === 'done') {
                            message.info('Data uploaded.');
                          }
                        }}
                      />
                  ],
                    // statuses: [
                    //     { option: { label: "Submmited", value: "Submitted" } },
                    //     { option: { label: "Approved", value: "Approved" } },
                    //     { option: { label: "Rejected", value: "Rejected" } }
                    // ],
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
                            // {
                            //     title: "Action",
                            //     dataIndex: "action",
                            //     actionProps: (item) => ({
                            //         label: "View",
                            //         action: "view",
                            //         type: "view",
                            //         onClick: () => {
                            //             window
                            //                 .open(
                            //                     `/external/hrm/ios/detail/${item?.id}`,
                            //                 )
                            //                 ?.focus();
                            //         }
                            //     })
                            // },
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
                                dataIndex: "status"
                            },
                            {
                                title: "Action Required By",
                                dataIndex: "currentActionBy"
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
          <UploadData title="Imported Review List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={() => { actionRef.current?.reloadAndRest?.() }} />
        </>
    )
};
