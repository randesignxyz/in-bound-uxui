import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { ArrowRightOutlined, DeleteOutlined, EllipsisOutlined } from "@ant-design/icons"
import { Badge, Button, Dropdown, Modal, message } from "antd"
import ContractFormRequest from "./ContractFormRequest";
import { useEffect, useRef, useState } from "react";
import { ContractServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { ContractDTO, ContractRequestCreate } from "./data";
import { Paging } from "@/services/API";
import { history, useModel } from "@umijs/max";
import { ContractAdvanceSearchParams } from "@/pages/crm/contract/types";
import { MenuProps } from "antd/lib";
import { DMSPaths } from "..";
import { ActionType } from "@ant-design/pro-components";
import { DocumentServiceAPI } from "../documentation/service";



export default () => {
    const requestAction = simpleRequestActions();
    const services = ContractServiceAPI(requestAction); 
    const actionRef = useRef<ActionType>();
    const [contractRequest, setContractrRequest] = useState<{
        visible?: {
            name: "MODAL";

        }
    }>();
    
    const cacheList = useModel('dataList');
    const onRequestHandler = async (params: TableViewSearchParams<ContractAdvanceSearchParams>) => {
        
        try {
            return services.pageContractRequest(params).then((it) => {
                return cacheList.cacheDataList({
                    type: 'dms-contract',
                    criteria: params,
                    data: it,
                });
            }) as Promise<Paging<ContractDTO>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    };

    // const loadData = ()=>{
    //     DocumentServiceAPI(requestAction).pageDoc({
    //         criteria:{
    //           searchValue:""
    //         }
    //       });
    // }

    // useEffect(()=>{
    //     loadData();
    // }, []);

    const items =(record:ContractDTO):MenuProps["items"] =>[
        {
            key:"1",
            label:"View",
            itemIcon:<ArrowRightOutlined/>,
            onClick:()=> history.push(`${DMSPaths.contracts}/detail/${record.id}`)
        },
        {
            key:"2",
            label:"Delete",
            danger:true,
            itemIcon:<DeleteOutlined/>,
            onClick:()=>{
                Modal.confirm({
                    title:"Delete Contract",
                    content:"are you sure?",
                    onOk:()=>{
                        services.deleteContract(record.id).then(o=>{
                            actionRef.current?.reload?.();
                        });
                        
                    }
                });
                
            }
        },
    ]
    return (
        <>
            <TableView<ContractDTO,  { searchValue?: string }>
                
                actionHandlers={{
                    
                    onAdd:()=>setContractrRequest({visible:{name:"MODAL"}}),
                    onRequest: (criteria, pagination, sort) =>
                        onRequestHandler({
                            criteria: {
                                searchValue: criteria.searchValue || "",
                                // advanceSearch: advanceSearchParams,
                                sort,
                            },
                            pagination,
                        }),
                    onFirstLoad: () =>
                        cacheList.fetchDataList('dms-document').then((v) => {
                            if (v) {
                                return v.dataList;
                            } else {
                                return onRequestHandler({
                                    criteria: {
                                        searchValue: "",
                                        // advanceSearch: advanceSearchParams,
                                    },
                                });
                            }
                        }) as Promise<Paging<ContractDTO>>,
                }}
                tableProps={{
                    actionRef:actionRef
                }}
                columns={[
                    {
                        title: "Number",
                        render:(_,r)=><Button onClick={()=>history.push(`${DMSPaths.contracts}/detail/${r.id}`)} type={"link"}>{r.contractNumber}</Button>
                    },
                    
                    {
                        title: "Contract Description",
                        dataIndex: "description"
                    },
                    {
                        title:"Type",
                        dataIndex:"type"
                    },
                    {
                        title: "Company",
                        dataIndex: "companyName"
                    },
                    {
                        title:"Effective Date",
                        dataIndex:"effectiveDate"
                    },
                    {
                        title:"Expriry Date",
                        dataIndex:"expiryDate"
                    },
                    
                    // {
                    //     title: "Process By",
                    //     dataIndex: "createdBy"
                    // },
                    // {
                    //     title: "Created On",
                    //     dataIndex: "createdDate",
                    //     valueType:"date"
                    // },
                    // {
                    //     title: "Submitted On",
                    //     dataIndex: "createdDate",
                    //     valueType:"date"
                    // },
                    {
                        title: "Request Status",
                        render:(_,r)=><Badge color="green" text={r.status} />
                    },
                   
                    {
                        render: (_, r) => (
                            <Dropdown
                                menu={{
                                        items:items(r),
                                        style:{
                                            width:200
                                        }
                                    }}
                            >
                                <a><EllipsisOutlined/></a>
                            </Dropdown>
                        )
                    }
                ]}

            />


            <ContractFormRequest
                open={contractRequest?.visible?.name == "MODAL"}
                onCancel={() => setContractrRequest({ visible: undefined })}
                onSave={(data:ContractRequestCreate) => {
                    ContractServiceAPI(requestAction).saveRequest(data).then(o=>{
                        setContractrRequest({visible:undefined});
                    })

                }}

            />
        </>

    )
}
