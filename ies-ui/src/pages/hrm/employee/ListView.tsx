import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import ImportFileButton from "@/components/ImportFileButton";
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks";
import { message, Radio, Space, Spin, Tooltip, Flex, Button, Modal } from "antd";
import { useRef } from "react";
import { EmployeeAdvanceSearchParams, EmployeeListItem } from "../data";
import { EmployeeServices } from "../services";  
 
import Status from "@/components/Status";
import { ExportOutlined, EditOutlined } from "@ant-design/icons";
// import { history } from 'umi';
import { useState } from 'react';
import EmployeeModal from './EmployeeModal'; 
import { history, useAccess,useModel } from '@umijs/max';
import AdvanceEmployeeSearch from "./AdvanceEmployeeSearch";
import Omit from "omit.js";

interface Props {
    onAdd?: (id?: number) => void;
    onEdit?: (id: number) => void;
}

export default ({ onAdd, onEdit }: Props) => { 
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const access = useAccess();  
 
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: EmployeeListItem } | { type: 'EDIT'; payload: EmployeeListItem } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);

    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>();       
    
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<EmployeeAdvanceSearchParams>({
    status: 'ACTIVE',
  });
     
    const onRequestHandler = async (params: TableViewSearchParams<EmployeeAdvanceSearchParams>) => {
        try { 
            return await EmployeeServices.list(params).query(requestActions);
        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
    }
    const saveEmployeeHandler = async (data: EmployeeListItem) => {
        Modal.confirm({
            title: 'Save employee profiles',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await EmployeeServices.EmployeeUpdate(data)(requestActions);
                    if (modalVisible?.type == 'EDIT') hideModal();
                    actionRef.current?.reloadAndRest?.();
                } catch (error: any) {
                    message.error(error.message || 'Failed to save employee profiles.');
                }
            },
        });
    }

    // const setAdanceSearch = (id:string)=>{
    //     setStatus(id);
    //     actionRef?.current?.reloadAndRest?.();
    // }
    return <Spin spinning = {loading}>
        <TableView<EmployeeListItem, { searchValue?: string; advanceSearch: EmployeeAdvanceSearchParams }> 
            hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
            tableProps={{
                actionRef: actionRef,
                toolbar: {
                    actions: [access.canAdmin == true ? <Tooltip placement="top" title="Import">
                        <ImportFileButton<{ id: number }> importedKey="EMPLOYEE"
                            // onDataResponse={(data) => {
                            //     console.log("------",data);

                            // }}
                            onHandleChange={status => {
                                setLoading(status == 'uploading')

                                if (status == 'done') {
                                    message.info("upload completed.")
                                }
                            }} />
                    </Tooltip> : '',

                    ],
                  },
            }} 
            advanceSearch
            actionHandlers={{ 
                onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
                onRequest: (criteria, pagination, sort) => 
                    onRequestHandler({
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
                    <Radio.Group optionType="button" defaultValue={"ACTIVE"}
                        options={[
                            { label: "All", value: "ALL" },
                            { label: "Active", value: "ACTIVE" },
                            { label: "Inactive", value: "INACTIVE" }
                        ]} 
                        // onChange={(e) => {setAdanceSearch(e.target.value);}}

                        value={advanceSearchParams.status}
                        onChange={(e) => {
                            setAdvanceSearchParams((v) => ({
                                ...v,
                                status: e.target.value,
                            }));
                            actionRef.current?.reloadAndRest?.();
                        }}
                    />
                </Space>
            }  
            columns={[
                {title: 'Employee ID', dataIndex: 'employeeCode', sorter: 'employeeCode',
                    render(_, entity) {
                    return <Flex gap={5}><Button
                        size="small"
                        type="link"
                        title="Open in new tab"
                        icon={<ExportOutlined />}
                        onClick={() => {
                            window
                                .open(
                                    `/profile/2/${entity.id}`,
                                )
                                ?.focus();
                        }}
                    /> <a onClick={() => { history.push(`/profile/2/${entity.id}`) }}>{entity.employeeCode}</a>
                    </Flex>
                },
                },
                { title: 'Full Name (KH)', dataIndex: 'employeeLocalName' },
                { title: 'Full Name (EN)', dataIndex: 'firstName', sorter: 'firstName', render(_, entity) { return (entity.firstName + " " + entity.lastName) } },
                // {title: 'Last Name', dataIndex: 'lastName', sorter: 'lastName'},
                // {title: 'SAP ID', dataIndex:  'sapId', sorter: 'sapId'},
                {title: 'Position', dataIndex: 'jobTitle', sorter: 'jobTitle'},
                {title: 'Function', dataIndex: 'department', sorter: 'department'},
                {title: 'Company', dataIndex: 'bu'},
                {title: 'Status', render:(_,r) =><Status text={r.status}/>},
                {width: 50,
                    hidden: !access.canAdmin,
                    render: (dom, r) => {  
                    return (<a onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
                                <EditOutlined/>
                            </a>
                        );
                    },
                }
            ]} 
        />
        {/*  advance search */}
        <AdvanceEmployeeSearch
          title="Advance Search"
          closable
          open={advanceSearch?.visible} 
          dataItem={modalVisible?.payload}
          onClose={() => {
            setAdvanceSearch({ visible: false });
          }}
          onReset={() => {  
            actionRef.current?.reloadAndRest?.();
          }}
          onSearch={(data) => {  
            setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
            actionRef.current?.reloadAndRest?.();
          }}
        />
        {/* new modal */}
        <EmployeeModal
            open={!!modalVisible?.type}
            onOpenChange={(visible) => hideModal(visible)}
            dataItem={modalVisible?.payload}
            onFinishFailed={(error) => {
                message.error(
                    <Space direction="vertical" align="start">
                        {error.errorFields.map((it) => (
                            <div>{it.errors.join(', ')}</div>
                        ))}
                    </Space>,
                );
            }}
            onFinish={(data) => {
                return saveEmployeeHandler({ ...data,employeeId:modalVisible?.payload.id||0});
            }}
        />
    </Spin>
}