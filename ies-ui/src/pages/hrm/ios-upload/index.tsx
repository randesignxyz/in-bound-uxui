import React, { useRef, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import {
  EmpISOData,
  EmpISOSearchParams,
  IOSEmployeeSearchParams,
} from '@/pages/hrm/ios-upload/service/data';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@umijs/max';
import { EmpISOServiceAPI } from '@/pages/hrm/ios-upload/service/EmpISOService';
import { Button, Flex, message, Modal, Space } from 'antd';
import ImportFileButton from '@/components/ImportFileButton';
import { DataResponse, ImportDataItem } from '@/services/shared/data';
import UploadData from '@/pages/hrm/ios-upload/upload-data';
import { ActionType, ProFormSelect } from '@ant-design/pro-components';
import { EmployeeListItem } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import { simpleRequestActions } from '@/services/model';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ExportOutlined } from '@ant-design/icons';
import {
  KeySchema,
  RawCreateParams,
  record,
  ZodRecord,
  ZodString,
  ZodTypeAny,
} from '@umijs/utils/compiled/zod';

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
  const handleDelete = async (record: {
    <Value extends ZodTypeAny>(valueType: Value, params?: RawCreateParams): ZodRecord<ZodString, Value>;
    <Keys extends KeySchema, Value extends ZodTypeAny>(keySchema: Keys, valueType: Value, params?: RawCreateParams): ZodRecord<Keys, Value>
  }) => {
    Modal.confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this job?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await services.DeleteEmployeeIOS(record.id);
          Modal.info({ title: "Delete Status", content: res.empName + "Deleted successfully." });
          refetch();
        } catch (err) {
          Modal.error({ title: "Delete failed", content: String(err) });
        }
      },
    });
  };
  return (
    <>
      <PageWrapper<EmpISOData, EmpISOSearchParams, undefined>
        tabRender={() => [
          // {
          //   action: "add",
          //   tabIcon: <PlusOutlined />,
          //   tabLabel: "Add New",
          // },
        ]}
        listView={{
          type: "Table",
          title: "IOS List",
          statuses: [
            { option: { label: "ALL", value: "ALL" } },
            { option: { label: "Active", value: "Draft", } },
            { option: { label: "Submitted", value: "Submitted" } },
          ],
          advanceSearchButton: (
            <Button
              // onClick={() => setAdvanceSearchVisible(true)}
              icon={<ExportOutlined />}
            />
          ),
          onRefresh: refetch,
          onFilter: (params, page, sort) => {
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
                pageSize: page?.pageSize,
                page: page?.current,
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
              {
                title: '#',
                width: 40,
                dataIndex: 'employeeCode',
                sorter: 'employeeCode',
                render(_, entity, index) {
                  return <Flex gap={3} align="center">
                    <span>{index + 1}</span>
                    <Button
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
                    />
                  </Flex>
                },
              },
              {
                title: 'Employee ID',
                dataIndex: 'empNo',
                render: (_, entity) => (
                  <Flex gap={5} align="center">
                    <span style={{ color: "#1677ff", cursor: "pointer" }}>
                      {entity.empNo}
                    </span>
                  </Flex>
                ),
              },
              { title: "Employee Name", dataIndex: "empName" },
              { title: "Company", dataIndex: "buName" },
              { title: "Location", dataIndex: "location" },
              { title: "Function", dataIndex: "deptName" },
              { title: "Sub Function", dataIndex: "subDeptName" },
              { title: "Position", dataIndex: "jobTitle" },
              { title: "Job Level", dataIndex: "jobLevel" },
              { title: "LM1 Name", dataIndex: "appraiser1" },
              { title: "LM2/FM Name", dataIndex: "appraiser2" },
              { title: "Status", dataIndex: "status" },
              {
                width: 50, title: "Action",
                render: (dom, r) => {
                  return (
                      <Space>
                        <Button icon={<DeleteOutlined />} danger size="small" type="link" onClick={() => handleDelete(record)} />
                      </Space>
                  );
                },
              }
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
