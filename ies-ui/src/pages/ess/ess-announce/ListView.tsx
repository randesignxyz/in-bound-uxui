import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"; 
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks"; 
import { message, Radio, Space, Spin, Tooltip,Flex,Button, Dropdown, Modal } from "antd";
import { useEffect, useRef,useState } from "react";
import { OpenEssDataItem,OpenAdvanceSearchParams } from "../data_ess"; 
import { ServicesEss } from '../service_ess_tran';  
import Status from "@/components/Status"; 
import { IssuesCloseOutlined, DownloadOutlined, HistoryOutlined, EditOutlined, RedoOutlined, EllipsisOutlined,SoundOutlined, ExportOutlined } from "@ant-design/icons";
import { history } from 'umi';
import { Model } from "../model";
import AppNewOpenForm from "./AppNewOpenForm"; 
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
        modals.showModal('CreateNewOpenForm');
    } 
    const setAdanceSearch = (id:number)=>{
        setStatus(id);
        actionRef?.current?.reloadAndRest?.();
    }
    
    const actionItem1 =(record:OpenEssDataItem):MenuProps["items"] =>[
        {
            key: "1",
            label: "Edit",
            itemIcon: <EditOutlined />,
            disabled:record.stepId==1?false:true,
            onClick: async () => {
                onOpenESS(record);
            }
        },
        // {
        //     key: "2",
        //     label: "Revoke",
        //     itemIcon: <HistoryOutlined />,
        //     disabled:record.stepId==2?false:true,
        //     onClick: async () => { 
        //         onOpenESS(record);
        //     }
        // },
        // {
        //     key: "3",
        //     label: <div title="it is meaning that all employee not yet editing info and will forward to next date!">Forwarding</div>, 
        //     itemIcon: <RedoOutlined />,
        //     disabled:record.stepId==1?false:true,
        //     onClick: async () => {
        //         onOpenESS(record);
        //     }
        // },
        {
            key: "4",
            label: <div title="Force to close announcement before expiry date!">Force to Close</div>,
            itemIcon: <IssuesCloseOutlined />, 
            style:{color:'red'},
            disabled:record.stepId==1?false:true,
            onClick: async () => {   
                Modal.confirm({
                    title: 'Force to Close',
                    content: 'Do you want to Force to Close?',
                    onOk: async () => {
                      try {         
                            record.stepId = 2;
                            await ServicesEss.closeAnnounce({...record})(requestActions).then(it=>{
                            message.success('create successfully.'); 
                            actionRef?.current?.reloadAndRest?.();
                        }) 
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
            tableProps={{
                actionRef: actionRef,
                toolbar: {
                    actions: [false],
                },
            }} 
            extraRightFilter={active>0?'':<Tooltip placement="bottom" title="Create new open ess"><Button icon={<SoundOutlined />} onClick={onOpenESS}>Open ESS </Button></Tooltip>}
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
                            { label: "Opening", value: "1" },
                            { label: "Closed", value: "2" },
                            { label: "Deleted", value: "3" }
                        ]}
                        onChange={(e) => {setAdanceSearch(e.target.value);}}
                    />
                </Space>
            }  
            columns={[
                {title: 'ID', dataIndex: 'id', sorter: 'id',width:'5%'},
                {title: 'Open Title', dataIndex: 'openTitle',
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
                {title: 'Started Date', dataIndex: 'start_date', render    : (_, r) => moment(r.startDate).format("DD-MMM-YYYY"),width:'7%'},
                {title: 'End Date', dataIndex: 'end_date', render    : (_, r) => moment(r.endDate).format("DD-MMM-YYYY"), width:'7%'},
                {title: 'Description', dataIndex:  'description', },
                {title: 'Created Date', dataIndex: 'created_date', render    : (_, r) => moment(r.createdDate).format("DD-MMM-YYYY"), width:'7%'},
                {title: 'Created By', dataIndex: 'createdBy', width:'7%'},
                {title: 'Status',width: 120, render:(_,r) =>{
                        var currentTime = new Date(); 
                        
                        var _status = 'PENDING';
                        if (r.stepId==1){
                            _status = "OPEN";
                        } else if (r.stepId==2){
                            _status = "CLOSED";
                        } else if (r.stepId==3){
                            _status = "DELETED";
                        }
                        //
                        if(moment(currentTime).format("DD-MMM-YYYY")>moment(r.createdDate).format("DD-MMM-YYYY")){
                            _status = "Expired";
                        }
                        return <div><Status text={_status}/></div>;
                    }
                },
                {   width: 50,align:'center',
                    render: (dom, r) => {   
                        return (<>
                                <Dropdown
                                        menu={{
                                            items:actionItem1(r),
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

        {modals.isVisible('CreateNewOpenForm') && <AppNewOpenForm
            open={modals.isVisible('CreateNewOpenForm')}
            onOpenModalChange={(v: any) => !v && modals.hideModal('CreateNewOpenForm')}
            refreshTable={refeshTable}
            data={openEssItem!!}  
        />}
           
    </Spin>
}