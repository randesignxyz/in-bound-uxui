import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import PageWrapper from "@/components/PageWrapper"
import { formatDate } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model";
import { StockControlLess, StockStoreAdvanceSearchParams } from "@/services/sale/data";
import { EditOutlined, FileOutlined } from "@ant-design/icons";
import { useAccess, useModel, useQuery } from "@umijs/max"
import { Spin, Tooltip } from "antd"
import { uniqueId } from "lodash";
import { useState } from "react";
import { SuggestionServiceAPI } from "../services";

interface Props {

}

const Mainpage: React.FC<Props> = () => {
    const access = useAccess();
    const cacheList = useModel('dataList');
    const requestActions = simpleRequestActions();
    const suggestionService = SuggestionServiceAPI(requestActions);
    const [filter, setFilter] = useState<TableViewSearchParams<StockStoreAdvanceSearchParams>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })

    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => suggestionService.(filter), {
        refetchOnWindowFocus: false
    })
    return <Spin spinning={false}>
        <PageWrapper<StockControlLess,StockStoreAdvanceSearchParams, {}>
            tabRender={item => [
                {
                    action: "add",
                    tabIcon: <FileOutlined />,
                    tabLabel: 'New PR',
                    // panel: (props) => <DataEntryView
                    //     onCloseTab={() => {
                    //         props?.onCloseTab?.()
                    //         refetch()
                    //     }} openInTab onBack={() => { }} type="CREATE" />,
                }, {
                    action: 'copy',
                    tabLabel: item?.stockName ? `Copy (#${item.stockName})` : 'Copy',
                    tabKey: `copy-${item?.id}-${uniqueId('copy')}`,
                    // panel: (props) => item?.id && <DataEntryView onCloseTab={() => {
                    //     props?.onCloseTab?.()
                    //     refetch()
                    // }} id={item.id} type="CREATE" openInTab />,
                    // tabIcon: <CopyFilled />
                }, {
                    action: 'view',
                    value: item?.stockName || "n/a",
                    tabLabel: item?.stockName || 'Draft',
                    // panel: (props) => item?.processStatus == 'DRAFT' ? <DataEntryView onCloseTab={() => {
                    //     props?.onCloseTab?.()
                    //     refetch()
                    // }} id={item.id} type="EDIT" openInTab /> : <Form openInTab formKey="requisition_request_process" id={item?.instanceId} />,
                }
            ]}
            listView={{
                type: "Table",
                props: {
                    dataSource: [],
                    columns: [
                        {
                            title: 'Store Name',
                            render: (_, r) => {
                                return r.stockName ? r.stockName : '-';
                            },
                        },
                        {
                            width: 120,
                            title: 'Request Date',
                            align: 'right',
                            render: (_, r) => {
                                return formatDate(r.requestedDate);
                            },
                        },
                        {
                            title: 'Serial Number',
                            dataIndex: 'referenceNo',
                        },

                        {
                            title: 'Number Plate',
                            dataIndex: 'plateNumber',
                        },
                        // {
                        //   title: 'Status',
                        //   align: 'center',
                        //   render: (_, r) => {
                        //     const color =
                        //       r.status === 'pending'
                        //         ? 'default'
                        //         : r.status === 'open'
                        //         ? 'success'
                        //         : r.status === 'canceled' || r.status === 'closed'
                        //         ? 'magenta'
                        //         : 'warning';
                        //     return (
                        //       <span>
                        //         <Tag color={color}>{r.status}</Tag>
                        //       </span>
                        //     );
                        //   },
                        // },

                        {
                            title: 'Approved By',
                            render: (_, r) => {
                                return r.approvedBy ? r.approvedBy : '-';
                            },
                        },
                        {
                            width: 120,
                            title: 'Approved Date',
                            align: 'right',
                            render: (_, r) => {
                                return r.approvedDate ? formatDate(r.approvedDate) : 'YYYY-MM-DD';
                            },
                        },
                        access.canAccessTabWarehouse
                            ? {
                                render: (_, r) => {
                                    return (
                                        ['approved', 'count stock'].includes(r.status) && (
                                            <Tooltip title="Edit" key="edit">
                                                <EditOutlined
                                                    style={{ color: '#448DF7' }}
                                                    onClick={() => {
                                                        if (r.status === 'count stock') {
                                                            setCountModal({ open: true, record: r });
                                                        } else {
                                                            setAddNewModal({ open: true, record: r });
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        )
                                    );
                                },
                            }
                            : {},
                    ]
                }
            }}
        />
    </Spin>
}


export default Mainpage