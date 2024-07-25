import PageWrapper from "@/components/PageWrapper"
import { Tag } from "antd";
import { LeadAdvanceSearchParams } from "./data";
import { LeadDetail } from "@/services/sale/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useQuery } from "@umijs/max";
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { LeadServiceAPI } from "./services";
import LeadEntryFormView from "./LeadEntryFormView";
import LeadDetailView from "./LeadDetailView";
import { PlusOutlined } from "@ant-design/icons";


interface Props {

}

const LeadMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = LeadServiceAPI(requestActions);
    const [filter, setFilter] = useState<TableViewSearchParams<LeadAdvanceSearchParams>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-lead-list', filter], () => services.listLead(filter), {
        refetchOnWindowFocus: false
    });
    return (
        <>
            <PageWrapper<LeadDetail, LeadAdvanceSearchParams, {}>
                tabRender={items => [
                    {
                        tabLabel: "Add New",
                        action: "add",
                        panel: ({ onUpdateTab, key }) => <LeadEntryFormView
                            type="new"
                            title="Add Lead Entry"
                            id={items?.id}
                            onView={(id?:number) => {
                                onUpdateTab("view", id, undefined, key);
                                refetch();
                            }}
                            onBack={() => onUpdateTab("add", undefined, undefined, key)}
                        />
                    },
                    {
                        tabLabel: `Edit ${items?.internalName
                                ? items?.internalName
                                : [items?.firstName, items?.lastName].join(" ")
                            }`,
                        action: "edit",
                        panel: ({ onUpdateTab, key }) => <LeadEntryFormView
                            type="edit"
                            title="Edit Lead Entry"
                            id={items?.id}
                            onView={(r) => {
                                onUpdateTab("view", items, undefined, key);
                                refetch();
                            }}
                            onBack={() => onUpdateTab("add", undefined, undefined, key)}
                        />
                    },
                    {
                        tabLabel: `view ${items?.internalName}`,
                        action: "view",
                        panel: ({ onUpdateTab, key }) => <LeadDetailView
                            onEdit={(items) => onUpdateTab("edit",items, undefined, key )}
                            id={items?.id}
                        />
                    }
                ]}
                listView={{
                    type: "Table",
                    title: "Lead List",
                    actionButtons:[
                        {
                            icon:<PlusOutlined/>,
                            type:"link",
                            addNewTab:true
                        }
                    ],
                    onRefresh: refetch,
                    onFilter: (param, page, sort) => {
                        setFilter(o => ({
                            criteria: {
                                ...o,
                                searchValue: param?.searchValue,
                                sort: sort
                            },
                            pagination: page
                        }))
                    },
                    props: {
                        dataSource: data?.items,
                        loading: isFetching,
                        pagination: {
                            total: data?.total
                        },
                        columns: [
                            {
                                title: 'Shop Name',
                                dataIndex: 'internalName',
                                actionProps: (items) => ({
                                    label: `${items.internalName
                                            ? items.internalName
                                            : [items.firstName, items.lastName].join(" ")
                                        }`,
                                    type: "view",
                                })
                            },
                            {
                                title: 'First Name',
                                dataIndex: 'firstName',
                            },
                            {
                                title: 'Last Name',
                                dataIndex: 'lastName',
                            },
                            {
                                title: 'Phone Number',
                                dataIndex: 'phone',
                            },
                            {
                                title: 'Salesperson',
                                render: (_, r) => {
                                    return `${r.salesperson?.salespersonCode} - ${r.salesperson?.salespersonName}`;
                                },
                            },
                            {
                                title: 'Outlet Type',
                                render: (_, r) => {
                                    return <Tag color="processing">{r.outletType?.name}</Tag>;
                                },
                            },
                            {
                                title: 'Province',
                                render: (_, r) => {
                                    return r.province?.name;
                                },
                            },
                            {
                                title: 'Commene',
                                render: (_, r) => {
                                    return r.commune?.name;
                                },
                            },
                            {
                                title: 'District',
                                render: (_, r) => {
                                    return r.district?.name;
                                },
                            },

                            {
                                title: 'Village',
                                render: (_, r) => {
                                    return r.village?.name;
                                },
                            },
                        ]
                    }
                }}

            />
        </>
    )
}

export default LeadMainPage