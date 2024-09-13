import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import ImportFileButton from "@/components/ImportFileButton";
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks"; 
import { message, Radio, Space, Spin, Tooltip,Flex,Button } from "antd";
import { useRef,useState } from "react";
import { OpenEssDataItem,OpenAdvanceSearchParams } from "../data_ess"; 
import { ServicesEss } from '../service_ess_tran'; 
import { toReadable } from "@/pages/utils";
import Status from "@/components/Status";
import { DiffOutlined, SoundOutlined, ExportOutlined,EditOutlined } from "@ant-design/icons";
import { history } from 'umi';
import { Model } from "../model";
import AppNewOpenForm from "./AppNewOpenForm";
import { PageContainer, ProTable,} from '@ant-design/pro-components';
import moment from 'moment'; 

interface Props {
    onAdd?: (id?: number) => void;
    onEdit?: (id: number) => void;
  }
 
export default ({ onAdd, onEdit }: Props) => {
    const { data, modals } = Model();
    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>()
    const actionRefItem = useRef<ActionType>()
    const [status, setStatus] = useState(1);  
    const [statusItem, setStatusItem] = useState(1);  
    const [openEssItemList, setOpenEssItemList] = useState<OpenEssDataItem[]>([]);
    const [openEssItem, setOpenEssItem] = useState<OpenEssDataItem>();

    // useEffect(() => { 
    // }, [forceChange])
    // useEffect(() => {
    //     // refeshTable()
    // }, [forceRefresh])
    const refeshTable = () => {
        // setForceChange(v => v + 1)
        actionRef?.current?.reload?.()
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
            return await ServicesEss.listEssOpenItem(params,statusItem).query(requestActions)

        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
    }

    const onOpenESS  = (data:OpenEssDataItem) => { 
        setOpenEssItem(data);
        modals.showModal('CreateNewOpenForm');
    }
    const setAdanceSearchItem = (id:number)=>{
        setStatusItem(id);
        actionRefItem?.current?.reloadAndRest?.();
    }

    const setAdanceSearch = (id:number)=>{
        setStatus(id);
        actionRef?.current?.reloadAndRest?.();
    }
    
    const expandedRowRender = (id:number) => {  
        return (
            <TableView<OpenEssDataItem, { searchValue?: string; }>
                extraFilter={
                    <Space > 
                        <Radio.Group optionType="button"  defaultValue={"1"}
                            options={[
                                { label: "All", value: "0" },
                                { label: "Opening", value: "1" }, 
                                { label: "Rejected", value: "4" },
                                { label: "Verified", value: "3" },
                                { label: "Approval", value: "6" }
                            ]}
                            onChange={(e) => {setAdanceSearchItem(e.target.value);}}
                        />
                    </Space>
                } 
                tableProps={{
                    actionRef: actionRefItem,
                    toolbar: {
                        actions: false,
                    },
                }}  
                columns={[
                { width   :'5%',
                    title   : "Emp No", 
                    dataIndex : 'emp_no',
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
                { width:'7%',title: "Status",dataIndex: 'step_id',align:'center',
                valueEnum: {
                    1: 'Open',
                    2: 'Draft',
                    3: 'Verify',
                    4: 'Completed'  
                    }, 
                },
                {width: 50,align:'center',
                    render: (dom, r) => {  
                        return (<a onClick={() =>{}}>
                                    <EditOutlined/>
                                </a>
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
        );
    };
    return <Spin spinning = {loading}>
        <TableView<OpenEssDataItem, { searchValue?: string; }>
            tableProps={{
                actionRef: actionRef,
                toolbar: false 
                // { 
                //     actions: [
                //      <Tooltip placement="top" title="Import">
                //         <ImportFileButton<{id: number}> importedKey="EMPLOYEE"
                //         // onDataResponse={(data) => {
                //         //     console.log("------",data);
                            
                //         // }}
                //         onHandleChange={status => {
                //             setLoading(status == 'uploading')
                            
                //             if(status == 'done') {
                //                 message.info("upload completed.")
                //             }    
                //         }}/>
                //       </Tooltip>,
        
                //     ],
                //   },
            }} 
            extraRightFilter={<Tooltip placement="bottom" title="Create new open ess"><Button icon={<SoundOutlined />} onClick={onOpenESS}>Open ESS</Button></Tooltip>}
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
                        var _status = 'PENDING';
                        if (r.stepId=='1'){
                            _status = "OPEN";
                        } else if (r.stepId=='2'){
                            _status = "CLOSED";
                        } else if (r.stepId=='3'){
                            _status = "DELETED";
                        }
                        return <idv><Status text={_status}/></idv>;
                    }
                },
                {width: 50,align:'center',
                    render: (dom, r) => {  
                        return (<a onClick={() =>{onOpenESS(r);}}>
                                    <EditOutlined/>
                                </a>
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