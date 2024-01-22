import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import ImportFileButton from "@/components/ImportFileButton";
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-table";
import { useSafeState } from "ahooks";
import { message, Spin, Tooltip } from "antd";
import { useRef } from "react";
import { EmployeeAdvanceSearchParams, EmployeeListItem } from "../data";
import { EmployeeServices } from "../services";
import { toReadable } from "@/pages/utils";
import Status from "@/components/Status";

interface Props {
    onAdd?: (id?: number) => void;
    onEdit?: (id: number) => void;
  }

export default ({ onAdd, onEdit }: Props) => {

    const requestActions = simpleRequestActions()
    const [loading, setLoading] = useSafeState(false)
    const actionRef = useRef<ActionType>()

    const onRequestHandler = async (params: TableViewSearchParams<EmployeeAdvanceSearchParams>) => {
        try {

            return await EmployeeServices.list(params).query(requestActions)

        } catch (error: any) {
            message.error(error.message)
            return Promise.reject()
        }
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
            columns={[
                {title: 'Emp No', dataIndex: 'employeeCode', sorter: 'employeeCode'},
                {title: 'Local Name', dataIndex: 'employeeLocalName'},
                {title: 'First Name', dataIndex: 'firstName', sorter: 'firstName'},
                {title: 'Last Name', dataIndex: 'lastName', sorter: 'lastName'},
                {title: 'SAP ID', dataIndex:  'sapId', sorter: 'sapId'},
                {title: 'Job title', dataIndex: 'jobTitle', sorter: 'jobTitle'},
                {title: 'Department', dataIndex: 'department', sorter: 'department'},
                {title: 'BU', dataIndex: 'bu'},
                {title: 'Status', render:(_,r) =><Status text={r.status}/>},
            ]}

        />
           
    </Spin>
}