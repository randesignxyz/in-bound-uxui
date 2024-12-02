// import { simpleRequestActions } from "@/services/model";
// import { history, useAccess, useModel } from 'umi';
// import { createService } from "../services";
// import TableView, { FetchPagingParams } from "@/components/DataCrud/TableView";
// import { Paging } from "@/services/API";
// import { ItemList, SearchItemParams } from "../data.types";
// import { Button, Space, message } from "antd";
// import { LightFilter, ProFormSelect } from "@ant-design/pro-components";
// import { SelectOutlined } from "@ant-design/icons";

// interface Props{

// }
// type LightFilterProp = {
//     groupIds?: number[]
// }

// export default({}:Props) => {
//     const cacheList = useModel('dataList');
//     const requestActions = simpleRequestActions();
//     const services = createService(requestActions);
//     const onRequestHandler = async (params: FetchPagingParams<SearchItemParams&{keyword?:string}>)=>{
//         try {
//             return services.fetchPaging(params).then((it) => {
//             return cacheList.cacheDataList({
//                 type: 'fma-item-list',
//                 criteria: params,
//                 data: it,
//             });
//             }) as Promise<Paging<ItemList>>;
//         } catch (error: any) {
//             message.error(error.message);
//             return Promise.reject();
//         }
//     }
    
//     function onAdd(): void {
//         throw new Error("Function not implemented.");
//     }

//     return <TableView<ItemList, SearchItemParams> 
//         extraFilter={<Space>                
//             <LightFilter<LightFilterProp> 
//                 onValuesChange={(_, values) => {
//                     const groupIds = values.groupIds;
//                 }}
//             >
//                 <ProFormSelect 
//                     name="groupIds"
//                     label="For the compnay"
//                     mode="multiple"                  
//                 />
//             </LightFilter>
//         </Space>
//         }
//         actionHandlers={{
//             onAdd: onAdd,
//             onRequest: (criteria, pagination, sort) => onRequestHandler({
//                 criteria: {
//                 ...criteria,
//                 searchValue: criteria?.searchValue ?? '',
//                 // advanceSearch: advanceSearchParams,
//                 // sort,
//                 },
//                 pagination,
//                 sort,
//             })
//         }}
//         columns={[
//             {
//                 title: 'Item Code',
//                 sorter: 'itemCode',
//                 width: 120,
//                 render: (_, rd) => <Space>
//                     <Button
//                         type="link"
//                         icon={<SelectOutlined />}
//                         onClick={async () => {
//                             window.open(`/external/stock/item/detail/${rd.id}`, '_blank')?.focus();
//                         }}
//                     />
//                 </Space>
//             },
//             {
//                 title:'Abr.',
//                 dataIndex: 'itemAbr'
//             },
//             {
//                 title:'Item Name',
//                 dataIndex: 'itemName'
//             },                
//             {
//                 title:'Qty',
//                 dataIndex: 'qty',
//                 align: 'right'
//             },                
//             {
//                 title:'UoM',
//                 dataIndex: 'defaultUoM'
//             },                
//             {
//                 title:'Description',
//                 dataIndex: 'description'
//             }
//         ]}        
//     />
// }