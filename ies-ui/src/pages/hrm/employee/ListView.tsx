import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import ImportFileButton from "@/components/ImportFileButton";
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks";
import { message, Radio, Space, Spin, Tooltip,Flex,Button,Modal } from "antd";
import { useRef } from "react";
import { EmployeeAdvanceSearchParams, EmployeeListItem } from "../data";
import { EmployeeServices } from "../services"; 
 
import Status from "@/components/Status";
import { ExportOutlined,EditOutlined } from "@ant-design/icons";
import { history } from 'umi';
import { useState } from 'react';
import EmployeeModal from './EmployeeModal';

interface Props {
    onAdd?: (id?: number) => void;
    onEdit?: (id: number) => void;
  }

export default ({ onAdd, onEdit }: Props) => {
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: EmployeeListItem } | { type: 'EDIT'; payload: EmployeeListItem } >();
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);

    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>(); 
     
    const onRequestHandler = async (params: TableViewSearchParams<EmployeeAdvanceSearchParams>) => {
        try {

            return await EmployeeServices.list(params).query(requestActions)

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

    return <Spin spinning = {loading}>
        <TableView<EmployeeListItem, { searchValue?: string; }> 
            tableProps={{
                actionRef: actionRef,
                toolbar: {
                    actions: [
                     <Tooltip placement="top" title="Import">
                        <ImportFileButton<{id: number}> importedKey="EMPLOYEE"
                        // onDataResponse={(data) => {
                        //     console.log("------",data);
                            
                        // }}
                        onHandleChange={status => {
                            setLoading(status == 'uploading')
                            
                            if(status == 'done') {
                                message.info("upload completed.")
                            }    
                        }}/>
                      </Tooltip>,
        
                    ],
                  },
            }} 
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
                    <Radio.Group optionType="button"
                        defaultValue={"ACTIVE"}
                        options={[
                            { label: "All", value: "ALL" },
                            // { label: "Employee Requested", value: "REQUESTED" },
                            // { label: "HR Requested", value: "REVIEWED" }
                        ]} 
                    />
                </Space>
            }  
            columns={[
                {title: 'Emp No', dataIndex: 'employeeCode', sorter: 'employeeCode',
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
                {title: 'Local Name', dataIndex: 'employeeLocalName'},
                {title: 'First Name', dataIndex: 'firstName', sorter: 'firstName'},
                {title: 'Last Name', dataIndex: 'lastName', sorter: 'lastName'},
                {title: 'SAP ID', dataIndex:  'sapId', sorter: 'sapId'},
                {title: 'Job title', dataIndex: 'jobTitle', sorter: 'jobTitle'},
                {title: 'Department', dataIndex: 'department', sorter: 'department'},
                {title: 'BU', dataIndex: 'bu'},
                {title: 'Status', render:(_,r) =><Status text={r.status}/>},
                {width: 50,
                render: (dom, r) => {  
                    return (<a onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
                                <EditOutlined/>
                            </a>
                        );
                    },
                }
            ]}

        />
           
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
                return saveEmployeeHandler({ ...data,employeeId:modalVisible?.payload.id});
            }}
        />
    </Spin>
}