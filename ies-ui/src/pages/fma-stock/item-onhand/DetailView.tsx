// import { simpleRequestActions } from "@/services/model"
// import { PageContainer, ProCard, ProTable } from "@ant-design/pro-components"
// import { Button, Descriptions, Space, Spin } from "antd"
// import { useEffect, useState } from "react"
// import { createService } from "./services"
// import { ItemDetail } from "./data.types"
// import { history } from 'umi';
// import { EditOutlined, SelectOutlined } from "@ant-design/icons"
// import { Divider } from "rc-menu"
// import ItemTran from "./components/ItemTran"

// interface Props{
//     itemId: number
// }
// export default({itemId}:Props) => {

//     const requestActions = simpleRequestActions()
//     const srv = createService(requestActions)
//     const [itemDetail, setItemDetail] = useState<ItemDetail>()
//     const isExternal = () => history.location.pathname.includes("/external/stock/item/");
//     const handleBackHandler = () => {
//         history.back();
//     };
//     useEffect(()=>{
//         initData()
//     },[])
//     const initData=()=>{
//         srv.fetchItem(itemId).then(rs=>{
//             setItemDetail(rs)
//         })
//     };

//     return (<Spin spinning={requestActions.request?.loading || false}>
//         <PageContainer
//             breadcrumb={undefined}
//             onBack={!isExternal() ? handleBackHandler : undefined}
//             title={`Item Code: ${itemDetail?.itemCode}`}
//             extra={
//                 <Space>
//                     <Button icon={<EditOutlined/>}>Edit</Button>
//                 </Space>
//             }
//         ><Space direction="vertical">
//             <ProCard
//                 title='Item Info'
//                 headerBordered={true}

//             >
//                 <Descriptions >
//                     <Descriptions.Item label='Item Code' style={{ fontWeight: 'bolder' }}>{itemDetail?.itemCode}</Descriptions.Item>
//                     <Descriptions.Item label='Abr.' style={{ fontWeight: 'bolder' }}>{itemDetail?.itemAbr}</Descriptions.Item>
//                     <Descriptions.Item label='Item Name' style={{ fontWeight: 'bolder' }}>{itemDetail?.itemName}</Descriptions.Item>
//                     <Descriptions.Item label='Active' style={{ fontWeight: 'bolder' }}>{itemDetail?.active}</Descriptions.Item>
//                     <Descriptions.Item label='UoM' style={{ fontWeight: 'bolder' }}>{itemDetail?.defaultUoM}</Descriptions.Item>
//                     <Descriptions.Item label='Decription' span={2}>{itemDetail?.decription}</Descriptions.Item>
//                 </Descriptions>
//             </ProCard>
            
//             <ProCard
//                 title='Item Transaction'
//                 headerBordered={true}
//             >
//                 <ItemTran/>
               
//             </ProCard>
//             </Space>
//         </PageContainer>
        
//     </Spin>)
// }