import PageWrapper from "@/components/PageWrapper"
import { StockStoreAdvanceSearchParams, StockStoreLess } from "@/services/sale/data"
import { formatDate } from "@/pages/utils"
import { EditOutlined, ExportOutlined, FileOutlined, PlusOutlined } from "@ant-design/icons"
import { Tag, Tooltip } from "antd"
import { SalePaths } from ".."
import { uniqueId } from "lodash"
import { history, useAccess, useQuery } from "@umijs/max"
import { Model } from "./model"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { useRef, useState } from "react"
import StockStoreDetail from "./Detail"
import { ActionType } from "@ant-design/pro-components"
import StockStoreForm from "./components/StockStoreForm"

interface Props {

}

const StoreMainPage: React.FC<Props> = () => {
    const access = useAccess();
    const { state, actions, modals } = Model();
    const actionRef = useRef<ActionType>();
    const [filter, setFilter] = useState<TableViewSearchParams<StockStoreAdvanceSearchParams>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })
    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => actions.loadListItem(
        filter.criteria,
        filter.pagination,
    ), {
        refetchOnWindowFocus: false
    });
    
    return <>
        <PageWrapper<StockStoreLess, StockStoreAdvanceSearchParams, {}>
            tabRender={item => [
                {
                    action: "add",
                    tabIcon: <FileOutlined />,
                    tabLabel: 'New Stock',
                    panel:(props) =><StockStoreForm type="new"/>
                }, {
                    action: 'copy',
                    tabLabel: item?.name ? `Copy (#${item.name})` : 'Copy',
                    tabKey: `copy-${item?.id}-${uniqueId('copy')}`,
                }, {
                    action: 'view',
                    value: item?.name || "n/a",
                    tabLabel: item?.name || 'Draft',
                    panel:(props) =><StockStoreDetail id={item?.id} />
                }
            ]}
            listView={{
                type: "Table",
                title:"Store List",
                onFilter:(params, page, sort)=> {
                    setFilter(v=>({
                            ...v,
                            criteria:{
                                searchValue:params?.searchValue,
                                advanceSearch:{
                                    status:params?.status ||"ALL"
                                },
                                sort:sort
                            },
                            pagination:{...page}
                    }))
                },
                actionButtons:[
                    {
                        icon:<PlusOutlined/>,
                        type:"link",
                        addNewTab:true
                    }
                ],
                statuses:[
                    {option:{label:"All", value:"ALL", default:true}},
                    {option:{label:"Open", value:"open"}},
                    {option:{label:"Closed", value:"closed"}},
                ],
                onRefresh:refetch,
                props: {
                    dataSource:data?.items,
                    actionRef:actionRef,
                    loading:isFetching,
                    pagination:{
                        total:data?.total,
                    },
                    columns: [
                        {
                            title: 'Store Name',
                            key: 'name',
                            actionProps: (item) => ({
                                type: 'view',
                                label: item.name || 'n/a',
                                actionButtons: [
                                    { icon: <ExportOutlined />, type: 'link', size: 'small', onClick: () => window.open(`/external/sale/store/detail/${item.id}`, '_blank')?.focus() }
                                ]
                            }),
                        },
                        {
                            title: 'Store Type',
                            render: (_, r) => {
                                return r.members?.find((it) => it.isRequester)?.role;
                            },
                        },
                        {
                            title: 'Vehicle',
                            render: (_, r) => {
                                return r.vehicle?.plateNumber;
                                //   return (
                                //     <a onClick={() => history.push(`${SalePaths.teamWork}/detail/${r.teamWork?.id}`)}>
                                //       {r.teamWork?.teamName}
                                //     </a>
                                //   );
                            },
                        },
                        {
                            title: 'Created Date',
                            render: (_, r) => {
                                return formatDate(r.createdDate);
                            },
                        },
                        {
                            title: 'Status',
                            align: 'center',
                            render: (_, r) => {
                                const color =
                                    r.status === 'pending'
                                        ? 'default'
                                        : //: r.status === 'approved'
                                        r.status === 'Open'
                                            ? 'success'
                                            : r.status === 'canceled' || r.status === 'Closed'
                                                ? 'magenta'
                                                : 'warning';
                                return (
                                    <span>
                                        <Tag color={color}>{r.status}</Tag>
                                    </span>
                                );
                            },
                        },
                        {
                            title: 'Description',
                            dataIndex: 'description',
                        },
                        access.canOpenStore ? 
                        {
                            title: '',
                            align: 'center',
                            render: (_, r) => {
                                return (
                                    <Tooltip title="Edit" key="edit">       
                                        <EditOutlined
                                            style={{ color: '#448DF7' }}
                                            onClick={() => history.push(`${SalePaths.store}/edit/${r.id}`)}
                                        />
                                    </Tooltip>
                                );
                                // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
                            },
                        }
                            : {},
                    ]
                }
            }}
        />
    </>

}

export default StoreMainPage