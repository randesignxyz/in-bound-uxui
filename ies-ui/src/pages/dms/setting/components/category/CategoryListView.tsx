import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons"
import { Badge, Dropdown, MenuProps, Modal, message } from "antd"
import { CategoryCreate, CategoryDTO, CategorySearchParam } from "./data";
import { simpleRequestActions } from "@/services/model";
import { Paging } from "@/services/API";
import { CategoryServiceAPI } from "./service";
import { useModel } from "@umijs/max";
import CategoryEntryFormModal from "./CategoryEntryForm";
import { useEffect, useRef, useState } from "react";
import { ActionType } from "@ant-design/pro-components";

interface Props {
    actionKey?:string;
}

export default ({actionKey}:Props)=>{
    const requestAction = simpleRequestActions();
    const services  = CategoryServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    const [state, setState] = useState<{
        visible?:{
            name:"modal";
            type:"ADD" |"EDIT";
            payLoad?:{record?:CategoryDTO}
        }
    }>();
    const items =(r?:CategoryDTO):MenuProps["items"] =>[
        // {
        //     key:"1",
        //     label:"View",
        //     itemIcon:<ArrowRightOutlined/>
        // },
        {
            key:"2",
            label:"Edit",
            itemIcon:<EditOutlined/>,
            onClick:()=>setState({visible:{name:"modal", type:"EDIT", payLoad:{record:r}}})
        },
        {
            type:"divider"
        },
        // {
        //     key:"3",
        //     label:"Trash",
        //     itemIcon:<DeleteOutlined/>
        // },
        {
            key:"4",
            label:"Delete",
            danger:true,
            itemIcon:<DeleteOutlined/>
        },
    ];
    const cacheList = useModel('dataList');
    const onRequestHandler = async (params: TableViewSearchParams<CategorySearchParam>) => {
        try {
          return services.page(params).then((it) => {
            return cacheList.cacheDataList({
              type: 'dms-category',
              criteria: params,
              data: it,
            });
          }) as Promise<Paging<CategoryDTO>>;
        } catch (error: any) {
          message.error(error.message);
          return Promise.reject();
        }
      };

      
    const onSave =async (data:CategoryCreate)=>{
        Modal.confirm({
            title: "Save Accessory record",
            content: " are you sure?",
            onOk: async () => {
                const response = await services.save(data) as ({
                    message: string,
                    data: string,
                });
                setState((v) => ({ ...v, visible: undefined }));
                message.success(response.message);
                actionRef.current?.reloadAndRest?.();
            }
        })

    }
    useEffect(()=>{
    }, [actionKey]);
    

    return (
        <>
            <TableView<CategoryDTO, {searchValue:string}>
                cache
                columns={[
                    {
                        title:"Name",
                        dataIndex:"name",

                    },
                    {
                        title:"Modified Date",
                        dataIndex:"modifiedDate",
                        valueType:"date"
                    },
                    {
                        title:"Status",
                        dataIndex:"status",
                        render:(_,r)=> <Badge text={r.status} status={r.status==="active"?"processing":"error"}/>
                    },
                    {
                        title:"Created By",
                        dataIndex:"createdBy"
                    },
                    {
                        render:(_,r)=>{
                            return(<>
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
                            </>)
                        }
                    },
                ]}

                tableProps={{
                    actionRef:actionRef
                }}
                actionHandlers={{
                    onAdd:()=>setState({visible:{name:"modal", type:"ADD"}}),
                    onRequest: (criteria, pagination, sort) =>
                      onRequestHandler({
                        criteria: {
                          ...criteria,
                          sort,
                        },
                        pagination,
                      }),
                    onFirstLoad: () =>
                      cacheList.fetchDataList('dms-category').then((v) => {
                        if (v) {
                        //   setAdvanceSearchParams({
                        //     ...v.creteria?.criteria,
                        //     status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                        //   });
                          return v.dataList;
                        } else {
                          return onRequestHandler({
                            criteria: {
                                searchValue:""
                            //   advanceSearch: advanceSearchParams,
                            },
                          });
                        }
                      }) as Promise<Paging<CategoryDTO>>,
                  }}
               
            />


            <CategoryEntryFormModal
                open={state?.visible?.name === "modal"}
                onCancel={() => setState(v => ({ ...v, visible: undefined }))}
                onSave={onSave} 
                data={state?.visible?.payLoad?.record}
                />
        </>
    )
}