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
import { MenuProps } from "rc-menu";
import { ProfileServicesEss } from "@/pages/profile/service_ess";


interface Props {
    profile: OpenEssDataItem;
}

 
export default ({ profile }: Props) =>{
    const { data, modals } = Model();
    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>()
    const actionRefItem = useRef<ActionType>()
    const [status, setStatus] = useState(3);  
    const [statusItem, setStatusItem] = useState(3);
    
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

    const onRequestItemHandler = async (params: TableViewSearchParams<OpenAdvanceSearchParams>) => {
        try {    
            return await ServicesEss.listEssOpenItem(params,profile.id,statusItem).query(requestActions)

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
    const actionItem =(record:OpenEssDataItem):MenuProps["items"] =>[
        {
            key: "1",
            label: "View Info",
            itemIcon: <EyeOutlined />,
            onClick: async () => {
                window.open(`/profile/1/${record.empId}`,)?.focus();
            }
        },
        {
            key: "2",
            label: "Force Approval",
            itemIcon: <CheckOutlined />,
            disabled:(record.stepId==6||record.stepId==4|| record.stepId==2)?true:false,
            onClick: async () => { 
                Modal.confirm({
                    title: 'Force Approval',
                    content: 'Do you want to force approval?',
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
            label: "Force Rejected",
            itemIcon: <ExclamationCircleOutlined />,
            style:{color:'red'},
            disabled:(record.stepId==6||record.stepId==4 || record.stepId==2)?true:false,
            onClick: async () => {
                Modal.confirm({
                title: 'Force Rejected',
                content: 'Do you want to force Rejected?',
                onOk: async () => {
                  try {  
                    const rs = await ServicesEss.essInfoDetail(record.empId,profile.id).query(requestActions);  
                    await ProfileServicesEss.saveEssProfile({...rs?.profile_draft,id: record.empId, empId: record.empId,step:4,openEssId:profile.id,otherFile:[],remark:'',status:true})(requestActions);
                    actionRefItem?.current?.reloadAndRest?.();
                  } catch (error: any) {
                    message.error(error.message || 'Failed to created.');
                  }
                },
              });  
            }
        },
        {
            key: "4",
            label: "Force Cancel Update",
            itemIcon: <CloseCircleOutlined />,
            disabled:(record.stepId==6)?true:false,
            style:{color:'red'},
            onClick: async () => {
                Modal.confirm({
                    title: 'Force Cancel Update',
                    content: 'Do you want to force cancel update?',
                    onOk: async () => {
                      try {  
                        const rs = await ServicesEss.essInfoDetail(record.empId,profile.id).query(requestActions);  
                        await ProfileServicesEss.saveEssProfile({...rs?.profile_draft,id: record.empId, empId: record.empId,step:0,openEssId:profile.id!!,otherFile:[],remark:'',status:true})(requestActions);
                        actionRefItem?.current?.reloadAndRest?.();
                      } catch (error: any) {
                        message.error(error.message || 'Failed to created.');
                      }
                    },
                  });  
            }
        } 
       
    ]
    return <Spin spinning = {loading}>
        <TableView<OpenEssDataItem, { searchValue?: string; }>
                extraFilter={
                    <Space > 
                    <Radio.Group optionType="button" defaultValue={"3"}
                        options={[
                            { label: "All", value: "0" },
                            { label: "Review", value: "3" },
                            { label: "Rejected", value: "4" },
                            // { label: "Verified", value: "3" },
                            { label: "Approval", value: "6" }
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
                { width   :'5%',
                    title   : "Emp No", 
                    dataIndex : 'empNo',
                    sorter    : false,
                    hideInForm: false, 
                }, 
                { title: "Local Name",dataIndex: 'internalName'},   
                { width:'12%',title: "First Name",dataIndex:'firstName',search: false}, 
                { width:'12%',title: "Last Name",dataIndex:'lastName',search: false}, 
                { width:'7%',title: "Integrated ID",dataIndex:'integratedId',search: false}, 
                { width:'12%',title: "Job Title",dataIndex:'jobTitle',search: false}, 
                { width:'12%',title: "Department",dataIndex:'departmentName',search: false}, 
                { width:'12%',title: "BU",dataIndex: 'buName' },
                {title: 'Status',width: 120, render:(_,r) =>{
                        var _status = 'PENDING';
                        if (r.stepId==1){
                            _status = "STARTED";
                        } else if (r.stepId==4){
                            _status = "REJECTED";
                        } else if (r.stepId==3){
                            _status = "REVIEW";
                        } else if (r.stepId==6){
                            _status = "APPROVAL";
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
                    onRequest: (criteria, pagination, sort) => onRequestItemHandler({
                        criteria: {
                            ...criteria,
                           
                            sort,
                          },
                          pagination,
                        // sort
                    })
                }} 
                pagination={false}
            />
    </Spin>
}