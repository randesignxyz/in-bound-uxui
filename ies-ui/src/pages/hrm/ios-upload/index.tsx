import React, { useMemo, useRef, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import {
  EmpISOData,
  IOSEmployeeSearchParams,
} from '@/pages/hrm/ios-upload/service/data';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { useQuery } from '@umijs/max';
import { EmpISOServiceAPI } from '@/pages/hrm/ios-upload/service/EmpISOService';
import { Button, Flex, message, Modal, Select, Space, Typography } from 'antd';
import ImportFileButton from '@/components/ImportFileButton';
import { DataResponse, ImportDataItem } from '@/services/shared/data';
import UploadData from '@/pages/hrm/ios-upload/upload-data';
import { ActionType, ProFormSelect } from '@ant-design/pro-components';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ExportOutlined } from '@ant-design/icons';
import AdvanceSearchDrawer from '@/pages/hrm/employee/AdvanceEmployeeSearch';

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
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const isAdvancedFiltered = () => {
    const adv = filter.criteria?.advanceSearch;
    return (
      (adv?.bu?.length ?? 0) > 0 ||
      (adv?.dept?.length ?? 0) > 0
    );
  };
  const advanceSearchIcon = useMemo(() => {
    return isAdvancedFiltered()
      ? <FilterOutlined style={{ color: "red" }} />
      : <SelectOutlined />;
  }, [filter.criteria?.advanceSearch]);
  const handleDelete = async (record: EmpISOData) => {
    Modal.confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this Employee IOS?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await services.DeleteEmployeeIOS(record.id);
          Modal.info({ title: "Delete Status", content: res.message });
          refetch();
        } catch (err) {
          Modal.error({ title: "Delete failed", content: String(err) });
        }
      },
    });
  };
  return (
    <>
      <PageWrapper<EmpISOData, IOSEmployeeSearchParams, undefined>
        tabRender={() => [
        ]}
        listView={{
          type: "Table",
          title: "IOS List",
          // statuses: [
          //   { option: { label: "ALL", value: "ALL" } },
          //   { option: { label: "Active", value: "ACTIVE", } },
          //   { option: { label: "Inactive", value: "INACTIVE" } },
          // ],
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={advanceSearchIcon}
            />
          ),
          actionButtons: [
            <Space key="import-with-filter" align="center">
              <Space size={6} align="center">
                <Typography.Text type="secondary">
                  Year:
                </Typography.Text>
                <Select
                  width={200}
                  placeholder="Year"
                  title="Year"
                  options={[
                    { label: "2026", value: 2 },
                  ]}
                  fieldProps={{
                    // value: filter.criteria?.appraisalPeriodId,
                    onChange: (value) => {
                      setFilter((prev) => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          appraisalPeriodId: value,
                        },
                      }));
                    },
                  }}
                />
              </Space>
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
         </Space>

          ],
          onRefresh: refetch,
          onFilter: (params, page, sort) => {
            setFilter((p) => ({
              criteria: {
                ...p.criteria,
                ...filter.criteria,
                searchValue: params?.searchValue,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  status: params?.status
                },
                sort: sort || p.criteria?.sort || {},
              },
              pagination: page || p.pagination,
            }))
          },
          props: {
            dataSource: data?.items || [],
            toolbar: {
            },
            loading: isLoading,
            rowKey: "employeeId",
            pagination: {
              total: data?.total,
              current: filter.pagination?.current,
              pageSize: filter.pagination?.pageSize
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
              { title: "Started DAte",dataIndex: "startedDate" },
              { title: "Probation EndDate", dataIndex: "probationEndDate" },
              { title: "LM1 No", dataIndex: "appraiser1No" },
              { title: "LM1 Name", dataIndex: "appraiser1" },
              { title: "LM2 No", dataIndex: "appraiser2No" },
              { title: "LM2/FM Name", dataIndex: "appraiser2" },
              { title: "Active", dataIndex: "active" },
              {
                width: 50, title: "Action",
                render: (dom, r) => {
                  return (
                    <Space>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        type="link"
                        onClick={() => handleDelete(r)}   // ✅ FIXED
                      />
                    </Space>
                  );
                }
              }
            ],
          },
        }}
      />
      <UploadData title="Imported Review List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={() => { actionRef.current?.reloadAndRest?.() }} />
      <AdvanceSearchDrawer
        open={advanceSearchVisible}
        onClose={() => setAdvanceSearchVisible(false)}
        onSearch={(params) => {
          setFilter((prev) =>
            ({
              criteria:{
                ...prev.criteria,
                advanceSearch: {
                  ...prev.criteria?.advanceSearch,
                  ...params,
                }
              }
            }))
          // setAdvanceSearchParams(params);
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </>
  );
};

export default Index;
