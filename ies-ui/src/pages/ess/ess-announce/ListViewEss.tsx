import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"; 
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks"; 
import { message, Radio, Space, Spin, Tooltip,Flex,Button, Dropdown, Modal } from "antd";
import { useEffect, useRef,useState } from "react";
import { OpenEssDataItem,OpenAdvanceSearchParams } from "../data_ess"; 
import { ServicesEss } from '../service_ess_tran';  
import { Model } from "../model"; 
import { EyeOutlined, ExclamationCircleOutlined, CheckOutlined, CloseCircleOutlined, HeartOutlined, EllipsisOutlined } from "@ant-design/icons";
import Status from "@/components/Status";
import { history } from 'umi';
import { Divider, MenuProps } from "rc-menu";
import { ProfileServicesEss } from "@/pages/profile/service_ess";
import { ProFormTextArea } from "@ant-design/pro-components";

import { useAccess } from '@umijs/max';

interface Props {
    profile: OpenEssDataItem;
}

 
export default ({ profile }: Props) =>{
    const access = useAccess();  
    const { data, modals } = Model();
    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>()
    const actionRefItem = useRef<ActionType>()
    const [status, setStatus] = useState(3);  
    const [statusItem, setStatusItem] = useState(3);
    
    var _valueText = "";
    useEffect(()=> {
        initData();
      }, [profile])
    
      const initData = async () => {
        // console.log(profile);
      }
  
    const onRequestHandler = async (params: TableViewSearchParams<OpenAdvanceSearchParams>) => {
        try {   
            return await ServicesEss.listEssOpen(params,status).query(requestActions)

        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
    }

    const onRequestItemHandler = async () => {
        try {  
            
            // if(access.ROLE_OFL_NVC_WHM_CASUAL==true){ 
            //     params.criteria.permissionLevel = 'ROLE_HR_OFL-NVC_WHM_CASUAL';
            // }
            // else if(access.ROLE_HR_OMM_ENG_PRD_CASUAL==true){ 
            //     params.criteria.permissionLevel = 'ROLE_HR_OMM_ENG_PRD_CASUAL';
            // }
            // else if(access.ROLE_HR_NVC_PRD_CASUAL==true){ 
            //     params.criteria.permissionLevel = 'ROLE_HR_NVC_PRD_CASUAL';
            // }
            // else if(access.ROLE_OFL_NVC_OMM_FMA_CASUAL==true){ 
            //     params.criteria.permissionLevel = 'ROLE_HR_OFL-NVC-OMM_FMA_CASUAL';
            // } 
            // else if(access.ROLE_HR_OFL_DEL_CASUAL==true){ 
            //     params.criteria.permissionLevel = 'ROLE_HR_OFL_DEL_CASUAL';
            // }
            // else if(access.ROLE_HR_OMD_DEL_CASUAL==true){ 
            //     params.criteria.permissionLevel = 'ROLE_HR_OMD_DEL_CASUAL';
            // }
            // else{
            //     params.criteria.permissionLevel = '0';
            // }
            
            return {items : await ServicesEss.listEssOpenItem(profile.id,statusItem,'').query(requestActions)}

        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
    }
 
    const setAdanceSearchItem = (id:number)=>{
        setStatusItem(id);
        actionRefItem?.current?.reloadAndRest?.();
    }

    const setAdanceSearch = (id:number)=>{
        setStatus(id);
        actionRef?.current?.reloadAndRest?.();
    } 
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
        <TableView<OpenEssDataItem, { searchValue?: string; }>
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
                        onChange={(e) => {setAdanceSearchItem(e.target.value);}}
                    />
                    </Space>
                } 
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
                actionHandlers={{ 
                    onRequest: (criteria, pagination, sort) => onRequestItemHandler()
                }} 
                pagination={false}
            />
    </Spin>
}