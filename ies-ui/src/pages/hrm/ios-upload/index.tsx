import React, { useRef, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import {
  EmpISOData,
  EmpISOSearchParams,
  IOSEmployeeSearchParams,
} from '@/pages/hrm/ios-upload/service/data';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@umijs/max';
import { EmpISOServiceAPI } from '@/pages/hrm/ios-upload/service/EmpISOService';
import { Button, message, Modal } from 'antd';
import ImportFileButton from '@/components/ImportFileButton';
import { DataResponse, ImportDataItem } from '@/services/shared/data';
import UploadData from '@/pages/hrm/ios-upload/upload-data';
import { ActionType } from '@ant-design/pro-components';
import { EmployeeListItem } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import { simpleRequestActions } from '@/services/model';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ExportOutlined } from '@ant-design/icons';

const Index = () => {
  const [importData, setImportData] = useState<DataResponse<ImportDataItem>>();
  const services = EmpISOServiceAPI();
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<IOSEmployeeSearchParams>>({
    criteria: { advanceSearch: { searchValue: 'ALL' } }
  })
  const { data, isLoading, refetch } = useQuery(
    ["fetch_ios_emp_master_page", filter],
    () => services.ListAll(filter),
    { refetchOnWindowFocus: false }
  );
  const requestActions = simpleRequestActions();
  const [modalVisible, setModalVisible] = useState<{ type: 'ADD'; payload: EmployeeListItem } | { type: 'EDIT'; payload: EmployeeListItem }>();
  const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
  const saveEmployeeIPOHandler = async (data: EmployeeListItem) => {
    Modal.confirm({
      title: 'Save employee profiles',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await EmployeeServices.EmployeeUpdate(data)(requestActions);
          if (modalVisible?.type === 'EDIT') hideModal();
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to save employee profiles.');
        }
      },
    });
  }

  console.log(filter);


  return (
    <>
      <PageWrapper<EmpISOData, EmpISOSearchParams, undefined>
        tabRender={() => [
          {
            action: "add",
            tabIcon: <PlusOutlined />,
            tabLabel: "Add New",
          },
        ]}
        listView={{
          type: "Table",
          title: "ISO List",
          statuses: [
            { option: { label: "ALL", value: "All" } },
            { option: { label: "Draft", value: "Draft", } },
            { option: { label: "Submitted", value: "Submitted" } },
            { option: { label: "Revert", value: "Revert" } }
          ],
          advanceSearchButton: (
            <Button
              // onClick={() => setAdvanceSearchVisible(true)}
              icon={<ExportOutlined />}
            />
          ),
          onRefresh: refetch,
          onFilter: (params, page,sort) =>{
            setFilter((params) => ({
              criteria: {
                ...params.criteria,
                ...filter.criteria
              }
            }))
          },
          actionButtons: [
            <ImportFileButton<ImportDataItem>
              importedKey="IMPORT_EMPLOYEE_IPO"
              onDataResponse={data => {
                setImportData(data)
              }}
              key={"IMPORT_EMP_IOS_LIST"}
              onHandleChange={(status) => {
                if (status === 'done') {
                  message.info('Data uploaded.');
                }
              }}
            />
          ],
          onFilter(params, page, sort) {
            setFilter({
              criteria: params,
              pagination: {
                pageSize: page.pageSize,
                page: page.current,
              }
            })
          },
          props: {
            dataSource: data?.items || [],
            toolbar: {
            },
            loading: isLoading,
            rowKey: "employeeId",
            pagination: {
              total: data?.total,
            },
            columns: [
              { title: "#", render: (_, __, index) => index + 1 },
              { title: "Employee Id", dataIndex: "empNo" },
              { title: "Employee Name", dataIndex: "empName" },
              { title: "Company", dataIndex: "buName" },
              { title: "Location", dataIndex: "location" },
              { title: "Function", dataIndex: "deptName" },
              { title: "Sub Function", dataIndex: "subDeptName" },
              { title: "Position", dataIndex: "jobTitle" },
              { title: "Job Level", dataIndex: "jobLevel" },
              { title: "Appraiser 1", dataIndex: "appraiser1" },
              { title: "Appraiser 2", dataIndex: "appraiser2" },
              { title: "Status", dataIndex: "status" },
              { title: "Action", dataIndex: "action" },
            ],
          },
        }}
      />
      {/*<UploadData title="Imported List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />*/}
      <UploadData title="Imported Review List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={() => { actionRef.current?.reloadAndRest?.() }} />
    </>
  );
};

export default Index;
