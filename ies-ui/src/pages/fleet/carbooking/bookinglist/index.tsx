import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"; 
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks"; 
import { message, Radio, Space, Spin, Tooltip,Flex,Button, Dropdown, Modal } from "antd";
import { useEffect, useRef,useState } from "react";
import { OpenEssDataItem,OpenAdvanceSearchParams } from "../data_ft"; 
import { ServicesEss } from '../service_ft_tran';  
import Status from "@/components/Status"; 
import { IssuesCloseOutlined, CarOutlined, HistoryOutlined, EditOutlined, RedoOutlined, EllipsisOutlined,DeploymentUnitOutlined, ExportOutlined } from "@ant-design/icons";
import { history } from 'umi';
import { Model } from "./../model";
import NewRequestCar from "./NewRequestCar"; 
import moment from 'moment'; 
import { MenuProps } from "rc-menu";

interface Props {
    onAdd?: (id?: number) => void;
    onEdit?: (id: number) => void;
  }
 
export default ({ onAdd, onEdit }: Props) => {
    const { data, modals } = Model();
    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>();
    const [status, setStatus] = useState(1);   
    const [openEssItem, setOpenEssItem] = useState<OpenEssDataItem>();
    const [active, setActive] = useState(0);   
    
    //
    useEffect(()=> {
        initData();
    }, [])

    const initData = async () => {
        try {   
            const rs = await ServicesEss.essOpenActive().query(requestActions);
            setActive(rs.id);
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }
    }

 
    const refeshTable = () => { 
        actionRef?.current?.reload?.();
        initData();
    }
    const onRequestHandler = async (params: TableViewSearchParams<OpenAdvanceSearchParams>) => {
        try {   
            return await ServicesEss.listEssOpen(params,status).query(requestActions);
        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
    } 

    const onOpenESS  = (data:OpenEssDataItem) => { 
        setOpenEssItem(data);
        modals.showModal("CreateNewOpenForm");
    } 
    const setAdanceSearch = (id:number)=>{
        setStatus(id);
        actionRef?.current?.reloadAndRest?.();
    }
    
    const actionItem1 =(record:OpenEssDataItem,isExp:number):MenuProps["items"] =>[
        {
            key: "1",
            label: <><EditOutlined /> Edit</>,
            // itemIcon: <EditOutlined />,
            disabled:record.empClosed==0?false:true,
            onClick: async () => {
                onOpenESS(record);
            }
        },
        {
            key: "2",
            label: <><HistoryOutlined /> Approval</>,
            // itemIcon: <HistoryOutlined />,
            disabled:record.stepId==2?false:true,
            onClick: async () => { 
                onOpenESS(record);
            }
        },
        {
            key: "3",
            label: <><RedoOutlined /> Rejected</>, 
            // itemIcon: <RedoOutlined />,
            disabled:record.stepId==1?false:true,
            onClick: async () => {
                onOpenESS(record);
            }
        },
        {
            key: "4",
            label: <><DeploymentUnitOutlined /> Diagram</>,
            // itemIcon: <IssuesCloseOutlined />, 
            style:{color:'red'},
            disabled:record.stepId==1?false:true 
        } 
       
    ]
     
    return <Spin spinning = {loading}>
        <TableView<OpenEssDataItem, { searchValue?: string; }>
            tableProps={{
                actionRef: actionRef,
                toolbar: {
                    actions: [false],
                },
            }} 
            extraRightFilter={<Tooltip placement="bottom"><Button icon={<CarOutlined />} onClick={(e)=>onOpenESS(null)}>New Request Car</Button></Tooltip>}
            actionHandlers={{ 
                onRequest: (criteria, pagination, sort) => onRequestHandler({
                    criteria: {
                        ...criteria,
                       
                        sort,
                      },
                      pagination,
                    // sort
                })
            }}
            extraFilter={
                <Space > 
                    <Radio.Group optionType="button"  defaultValue={"1"}
                        options={[
                            { label: "All", value: "0" },
                            { label: "Pending", value: "1" },
                            { label: "Approved", value: "2" },
                            { label: "Rejected", value: "3" } 
                        ]}
                        onChange={(e) => {setAdanceSearch(e.target.value);}}
                    />
                </Space>
            }  
            columns={[
                {title: 'ID', dataIndex: 'id', width:'3%'},
                {title: 'Destination', dataIndex: 'openTitle', width:'250px',
                    render(_, entity) {
                        return <Flex gap={5}><Button
                            size="small"
                            type="link"
                            title="Open in new tab"
                            icon={<ExportOutlined />}
                            onClick={() => {
                                window
                                    .open(
                                        `/ess/details/${entity.id}`,
                                    )
                                    ?.focus();
                            }}
                        /> <a onClick={() => { history.push(`/ess/details/${entity.id}`) }}>{entity.openTitle}</a>
                        </Flex>
                    },
                },
                {title: 'Purpose', dataIndex: 'id', width:'250px'},
                {title: 'Number of Person', dataIndex: 'id',align:'center',width: 120 },
                {title: 'License Plate', dataIndex: 'id',align:'center',width: 120 }, 
                {title: 'Occupy Date', dataIndex: 'startDate', align:'center',render    : (_, r) => moment(r.startDate).format("DD-MMM-YYYY"),width: 120 },
                {title: 'Start Hour', dataIndex: 'endDate', align:'center',render    : (_, r) => moment(r.endDate).format("HH:ss"), width: 120 },
                {title: 'End Hour', dataIndex: 'endDate', align:'center',render    : (_, r) => moment(r.endDate).format("HH:ss"), width: 120 },
                {title: 'Total Hour', dataIndex: 'id',align:'center',width: 120 }, 
                {title: 'Requested Date', dataIndex: 'createdDate', align:'center',render    : (_, r) => moment(r.createdDate).format("DD-MMM-YYYY"), width: 120 },
                {title: 'Requested By', dataIndex: 'createdBy', align:'center',width: 120 },
                {title: 'Status',width: 90, align:'center',render:(_,r) =>{
                        var currentTime = new Date(); 
                        
                        var _status = 'PENDING';
                        
                        //checking expiry
                        if(moment(currentTime).format("DDMYYYY")>moment(r.endDate).format("DDMYYYY")&&r.empClosed==0){
                            _status = "Expired";
                        }else{
                            if (r.stepId==1){
                                _status = "Pending";
                            } else if (r.stepId==2){
                                _status = "Approved";
                            } else if (r.stepId==3){
                                _status = "Rejected";
                            }

                        } 
                        return <div><Status text={_status}/></div>;
                    }
                },
                {   width: 50,align:'center',
                    render: (dom, r) => {   
                        var _val=0;
                        var currentTime = new Date(); 
                        if(moment(currentTime).format("DDmmYYYY")>moment(r.endDate).format("DDmmYYYY")&&r.empClosed==0){
                            _val = 1;
                        } 
                        return (<>
                                <Dropdown
                                    menu={{
                                        items:actionItem1(r,_val),
                                        style:{
                                            width:200
                                        }
                                    }}
                                ><EllipsisOutlined />
                                </Dropdown>  
                                </>
                            );
                        },
                    } 
            ]} 
            // expandable={{ 
            //     expandedRowRender: (r) => expandedRowRender(r.id) 
            // }}

        />

        {modals.isVisible('CreateNewOpenForm') && <NewRequestCar
            open={modals.isVisible('CreateNewOpenForm')}
            onOpenModalChange={(v: any) => !v && modals.hideModal('CreateNewOpenForm')}
            refreshTable={refeshTable}
            data={openEssItem!!}  
        />}
           
    </Spin>
}