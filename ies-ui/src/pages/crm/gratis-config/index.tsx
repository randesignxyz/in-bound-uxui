import CrudWrapper from "@/components/DataCrud/CrudWrapper"
// import { CrmPaths } from ".."
import { GratisConfigurationOtherListView } from "./components/list"
import  TermDetail  from "./components/detail"
import { useEffect, useState } from "react"
import TermModalForm from "./components/TermModalForm"
import { simpleRequestActions } from "@/services/model"
import { MultiRequest } from "@/services/apiGateway"
import { LookupData } from "@/services/data"
import { ContractServices } from "../contract/services"
import { CrmPaths } from ".."
import { Flex, Menu, MenuProps, theme } from "antd"
import Sider from "antd/es/layout/Sider"
import { Content } from "antd/es/layout/layout"

type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
    {
        label: "Gratis Configuration",
        type: 'group',
        children: [
            { label: "Trade Incentive", key: "gratis-direct" },
            { label: "Retail Incentive", key: "gratis-indirect" },
            { label: "Brand/Display/Exclusive", key: "gratis-other" }
        ]
    },
    // {
    //     label: "Purchase Order",
    //     type: 'group',
    //     children: [
    //         { label: "Display/Exclusive", key: "po-setting" }
    //     ]
    // }
]
export default () => {
    const requestActions = simpleRequestActions()
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number , cb?: () => void } | {type: 'EDIT', id?: number, cb?:() => void  }>()
    const [forceRefresh, setForceRefresh] = useState<number>(0)
    const [lookupData, setLookupData] = useState<{
        contractTypes?: LookupData[];
      }>();
      useEffect(()=>{
        loadData()
      },[])
      const loadData= async ()=>{       
        const rs = await MultiRequest<{
          contractTypes: LookupData[];
        }>([
          ContractServices.listContractType().queryParams,
        ])(requestActions);  
        setLookupData(rs);
      }

    const [setting, setSetting] = useState<string>('gratis-other')

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const onClick: MenuProps['onClick'] = (e) => {
        setSetting(e.key)
    };

    return<Flex>
         <Sider style={{ background: colorBgContainer, height: '88vh' }} width={200} >
            <Menu
                mode="inline"
                onClick={onClick}
                items={items}
            />
        </Sider>
        <Content style={{ padding: '0 5px', minHeight: 280 }}>    
          {setting=='gratis-other' && <GratisConfigurationOtherListView contractTypes={lookupData?.contractTypes}  onDetail={r => r} onAdd = {() => setModalVisible({type: 'ADD',cb:()=>{ setForceRefresh(v=> v+1);setModalVisible(undefined)}})} forceRefresh={forceRefresh}/>}
          {/* <CrudWrapper baseURL={CrmPaths.terms}>
          {
              (view, id, navigate) => {
                  switch (view) {
                      case 'list': return <TermListView contractTypes={lookupData?.contractTypes}  onDetail={r => navigate?.goToDetail?.({ id: r.id })} onAdd = {() => setModalVisible({type: 'ADD',cb:()=>{ setForceRefresh(v=> v+1);setModalVisible(undefined)}})} forceRefresh={forceRefresh}/>
                      case 'detail': return <TermDetail termId={id as number || 0}/>
                      default: throw new Error('Not supported')
                  } 
              }
          }
          </CrudWrapper> */}
        </Content>
        {/* {modalVisible?.type  && <TermModalForm onRefresh={modalVisible.cb} contractTypes={lookupData?.contractTypes}  open = {true} onOpenChange = {visible => !visible && setModalVisible(undefined)}/>} */}
    </Flex>
}