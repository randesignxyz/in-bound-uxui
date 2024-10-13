import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"; 
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks"; 
import { message, Radio, Space, Spin, Dropdown, Modal } from "antd";
import { useEffect, useRef,useState } from "react";
import { OpenEssDataItem,OpenAdvanceSearchParams } from "../data_ess"; 
import { ServicesEss } from '../service_ess_tran';   
import { EyeOutlined, ExclamationCircleOutlined, CheckOutlined, EllipsisOutlined } from "@ant-design/icons";
import Status from "@/components/Status";
import { Divider, MenuProps } from "rc-menu";
import { ProfileServicesEss } from "@/pages/profile/service_ess";
import { ProFormTextArea } from "@ant-design/pro-components";

import Omit from "omit.js";
import AdvanceOpenItemSearch from "./AdvanceOpenItemSearch";


interface Props {
    profile: OpenEssDataItem;
}

 
export default ({ profile }: Props) =>{  
    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>()
    const actionRefItem = useRef<ActionType>();
    
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: OpenEssDataItem } | { type: 'EDIT'; payload: OpenEssDataItem } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);

    // canAccessHrViewEmployeeMenuItem
    const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
    const [advanceSearchParams, setAdvanceSearchParams] = useState<OpenAdvanceSearchParams>({
        status: '3',
    });
    
    var _valueText = "";
    useEffect(()=> {
        initData();
      }, [profile])
    
      const initData = async () => {
        // console.log(profile);
      }
   
    const onRequestItemHandler = async (params: TableViewSearchParams<OpenAdvanceSearchParams>) => {
        try {   
            // return {items : await ServicesEss.listEssOpenItem(profile.id,statusItem).query(requestActions)}
            return await ServicesEss.listEssOpenItem(params,profile.id).query(requestActions); 
        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
    }
 
    // const setAdanceSearchItem = (id:number)=>{
    //     setStatusItem(id);
    //     actionRefItem?.current?.reloadAndRest?.();
    // }
 
    const onTextChange = (val:string)=>{ 
        // setRemarks({valueText:val});
        _valueText = val;
    } 
    const actionItem =(record:OpenEssDataItem):MenuProps["items"] =>[
        {
            key: "1",
            label: "Review Updates",
            itemIcon: <EyeOutlined />,
            disabled:([3,4,5,6].find((element) => element == record.stepId))?false:true,
            onClick: async () => {
                window.open(`/profile/1/${record.empId}`,)?.focus();
            }
        },
        {
            key: "2",
            label: "Approve",
            itemIcon: <CheckOutlined />,
            disabled:([4,3,5].find((element) => element == record.stepId))?false:true,
            onClick: async () => { 
                Modal.confirm({
                    title: 'Approve',
                    content: 'Do you want to approve?',
                    onOk: async () => {
                      try {  
                        const rs = await ServicesEss.essInfoDetail(record.empId,profile.id).query(requestActions);  
                        await ProfileServicesEss.approvalEssProfile({...rs?.profile_draft,id: record.empId, empId: record.empId,step:6,openEssId:profile.id,otherFile:[],remark:'',status:true})(requestActions);
                        actionRefItem?.current?.reloadAndRest?.();
                      } catch (error: any) {
                        message.error(error.message || 'Failed to created.');
                      }
                    },
                  });  
            }
        },
        {
            key: "3",
            label: "Reject",
            itemIcon: <ExclamationCircleOutlined />,
            style:{color:[3].find((element) => element == record.stepId)?'red':''},
            disabled:([3].find((element) => element == record.stepId))?false:true,
            onClick: async () => {
                Modal.confirm({
                title: 'Reject', 
                content: <div><ProFormTextArea name={"comment"} fieldProps={{onChange: (e) => {onTextChange(e.currentTarget.value);}}} placeholder={"Entry Message"} /></div>,
                onOk: async () => {
                  try {  
                    const rs = await ServicesEss.essInfoDetail(record.empId,profile.id).query(requestActions);  
                    await ProfileServicesEss.approvalEssProfile({...rs?.profile_draft,id: record.empId, empId: record.empId,step:4,openEssId:profile.id,otherFile:[],remark:_valueText,status:true})(requestActions);
                    actionRefItem?.current?.reloadAndRest?.();
                  } catch (error: any) {
                    message.error(error.message || 'Failed to created.');
                  }
                },
              });  
            }
        },
        // {
        //     key: "4",
        //     label: "Cancel Update",
        //     itemIcon: <CloseCircleOutlined />, 
        //     disabled:([3,2,5].find((element) => element == record.stepId))?false:true,
        //     style:{color:record.stepId<3?'red':''},
        //     onClick: async () => {
        //         Modal.confirm({
        //             title: 'Cancel Update',
        //             content: 'Do you want to cancel update?',
        //             onOk: async () => {
        //               try {  
        //                 const rs = await ServicesEss.essInfoDetail(record.empId,profile.id).query(requestActions);  
        //                 await ProfileServicesEss.saveEssProfile({...rs?.profile_draft,id: record.empId, empId: record.empId,step:8,openEssId:profile.id!!,otherFile:[],remark:'',status:true})(requestActions);
        //                 actionRefItem?.current?.reloadAndRest?.();
        //               } catch (error: any) {
        //                 message.error(error.message || 'Failed to created.');
        //               }
        //             },
        //           });  
        //     }
        // }, 
        // { // using for rollback cancel update
        //     key: "8",
        //     label: "Re Edit Profile",
        //     itemIcon: <CloseCircleOutlined />,
        //     disabled:record.stepId==8?false:true, 
        //     onClick: async () => {
        //         Modal.confirm({
        //             title: 'Re Cancelled Update',
        //             content: 'Do you want to re-edit profile after cancel update?',
        //             onOk: async () => {
        //               try {  
        //                 const rs = await ServicesEss.essInfoDetail(record.empId,profile.id).query(requestActions);  
        //                 await ProfileServicesEss.saveEssProfile({...rs?.profile_draft,id: record.empId, empId: record.empId,step:33,openEssId:profile.id!!,otherFile:[],remark:'',status:true})(requestActions);
        //                 actionRefItem?.current?.reloadAndRest?.();
        //               } catch (error: any) {
        //                 message.error(error.message || 'Failed to created.');
        //               }
        //             },
        //           });  
        //     }
        // } 
       
       
    ]
    return <Spin spinning = {loading}>
        <TableView<OpenEssDataItem, { searchValue?: string; advanceSearch: OpenAdvanceSearchParams }>
            hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)} 
            tableProps={{
                actionRef: actionRefItem,
                toolbar: {
                    actions: [false],
                },
            }} 
            columns={[
            { width   :'10%',
                title   : "Employee ID", 
                dataIndex : 'empNo',
                sorter    : false,
                hideInForm: false, 
            }, 
            { title: "Full Name (KH)",dataIndex: 'internalName'},   
            { width:'12%',title: "Full Name (EN)",dataIndex:'firstName',search: false,render:(_,r) =>{return(r.lastName+" "+r.firstName)}}, 
            // { width:'12%',title: "Last Name",dataIndex:'lastName',search: false}, 
            // { width:'7%',title: "Integrated ID",dataIndex:'integratedId',search: false}, 
            { width:'12%',title: "Position",dataIndex:'jobTitle',search: false}, 
            { width:'12%',title: "Function",dataIndex:'departmentName',search: false}, 
            { width:'12%',title: "Company",dataIndex: 'buName' },
            {title: 'Status',width: 120, render:(_,r) =>{
                    var _status = 'Pending';
                    if (r.stepId==2){
                        _status = "Started";
                    } else if (r.stepId==4){
                        _status = "Rejected";
                    } else if (r.stepId==3){
                        _status = "Reviewing";
                    } else if (r.stepId==6){
                        _status = "Approved";
                    }else if (r.stepId==8){
                        _status = "Cancelled Update";
                    }
                    else if (r.stepId==7){
                        _status = "Re-Submit Updated";
                    }
                    return <div><Status text={_status}/></div>;
                }
            },                 
            {   width: 50,align:'center', 
                render: (dom, r) => {  
                    return (
                        <Dropdown
                            menu={{
                                items:actionItem(r),
                                style:{
                                    width:200
                                }
                            }}
                            ><EllipsisOutlined />
                            </Dropdown>
                            // <a onClick={() => { window.open(`/profile/1/${r.empId}`,)?.focus(); }}><EditOutlined/></a>
                        );
                    },
                }
            ]} 
            
            advanceSearch
            actionHandlers={{ 
                onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
                onRequest: (criteria, pagination, sort) => 
                    onRequestItemHandler({
                        criteria: {
                            ...criteria,
                            advanceSearch: advanceSearchParams,
                            sort,
                        },
                        pagination,
                    }) 
            }}
            extraFilter={
                <Space > 
                <Radio.Group optionType="button" defaultValue={"3"}
                    options={[
                        { label: "All", value: "0" },
                        { label: "Started", value: "2" },
                        { label: "Review", value: "3" },
                        { label: "Rejected", value: "4" },
                        { label: "Approved", value: "6" },
                        // { label: "Cancel Update", value: "8" }
                    ]}
                    // onChange={(e) => {setAdanceSearchItem(e.target.value);}}

                    value={advanceSearchParams.status}
                    onChange={(e) => {
                        setAdvanceSearchParams((v) => ({
                            ...v,
                            status: e.target.value,
                        }));
                        actionRefItem.current?.reloadAndRest?.();
                    }}
                />
                </Space>
            }   
        />
        
        {/*  advance search */}
        <AdvanceOpenItemSearch
          title="Advance Search"
          closable
          open={advanceSearch?.visible} 
          dataItem={modalVisible?.payload}
          onClose={() => {
            setAdvanceSearch({ visible: false });
          }}
          onReset={() => {  
            actionRefItem.current?.reloadAndRest?.();
          }}
          onSearch={(data) => {  
            setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
            actionRefItem.current?.reloadAndRest?.();
          }}
        />
    </Spin>
}