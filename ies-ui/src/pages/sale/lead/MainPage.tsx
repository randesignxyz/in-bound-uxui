import PageWrapper from "@/components/PageWrapper"
import { Button, message, Modal, Tag } from "antd";
import { LeadAdvanceSearchParams } from "./data";
import { LeadDetail } from "@/services/sale/data";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useAccess, useQuery } from "@umijs/max";
import { useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { LeadServiceAPI } from "./services";
import LeadEntryFormView from "./LeadEntryFormView";
import LeadDetailView from "./LeadDetailView";
import { EditOutlined, PlusOutlined, SwapOutlined } from "@ant-design/icons";
import ChangeSalepersonForm from "./ChangeSalepersonForm";


interface Props {

}

const LeadMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = LeadServiceAPI(requestActions);
    const access = useAccess();
    const [filter, setFilter] = useState<TableViewSearchParams<LeadAdvanceSearchParams>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-lead-list', filter], () => services.listLead(filter), {
        refetchOnWindowFocus: false
    });
    const [ changeSalepersonState, setChangeSalepersonState] = useState<{
        visible?:{
            name:"MODAL",
            payloads?:any
        }
    }>();
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
                        },
                        <Button disabled={!access.canAccessDSD} icon={<SwapOutlined />} type="link" onClick={()=>setChangeSalepersonState({visible:{name:"MODAL"}})}  >Tranfer Lead</Button>
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
                                            : [items.firstName, items.lastName].filter(p=>p).join(" ")
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
                                    return [r.salesperson?.salespersonCode, r.salesperson?.salespersonName].filter(p=>p).join(" - ")
                                    // return `${r.salesperson?.salespersonCode} - ${r.salesperson?.salespersonName}`;
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

            <ChangeSalepersonForm
                open={changeSalepersonState?.visible?.name=="MODAL"}
                onCancel={()=>setChangeSalepersonState({visible:undefined})}
                onSave={(data)=>{
                    Modal.confirm({
                        title:`Update customers to other salesperson`,
                        content:"are you sure?",
                        onOk:async()=>{
                            services.updateCustomerOwner(data).then(()=>{
                                message.success("Sucess!");
                                setChangeSalepersonState({
                                    visible:undefined
                                });
                                refetch(); 
                            }).catch(error=>message.error(error.message))
                        }
                    })
                }}  
            />
        </>
    )
}

export default LeadMainPage