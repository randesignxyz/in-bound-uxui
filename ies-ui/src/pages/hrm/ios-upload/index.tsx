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
import { Button, Flex, message, Modal, Space } from 'antd';
import ImportFileButton from '@/components/ImportFileButton';
import { DataResponse, ImportDataItem } from '@/services/shared/data';
import UploadData from '@/pages/hrm/ios-upload/upload-data';
import { ActionType } from '@ant-design/pro-components';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import AdvanceSearchDrawer from '@/pages/hrm/ios-upload/AdvanceSearchEmpIOS';
import moment from 'moment';

const Index = () => {
  const [importData, setImportData] = useState<DataResponse<ImportDataItem>>();
  const services = EmpISOServiceAPI();
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<IOSEmployeeSearchParams>>({
    criteria: {
      advanceSearch: {
        searchValue: undefined,
        buIds: [],
        depIds: [],
        status: "ALL",
      },
      pagination: { current: 1, pageSize: 20 },
    },
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
      (adv?.buIds?.length ?? 0) > 0 ||
      (adv?.depIds?.length ?? 0) > 0 ||
      (adv?.subDepIds?.length ?? 0) > 0
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
          if(res.message==='ok' && res.id || 0 >0 ) {
            message.success("Deleted successfully.")
          refetch();
          }
        } catch (err) {
          Modal.error({ title: "Delete failed", content: String(err.message) });
        }
      },
    });
  };
  return (
    <>
      <PageWrapper<EmpISOData, IOSEmployeeSearchParams, undefined>
        tabRender={(item) => [
          {
            action: 'view',
            value: item?.empNo,
            tabLabel: `${item?.empNo} - ${item?.empName}`,
            // panel: () => (
            //   <Profile
            //     id={item?.empNo}
            //   />
            // ),
          },
        ]}
        listView={{
          type: "Table",
          title: "IOS Employee Profile",
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={advanceSearchIcon}
            />
          ),
          actionButtons: [
            <Space key="import-with-filter" align="center">
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
          onFilter: (params: any) => {
            setFilter((p,) => ({
              ...p,
              ...filter.pagination,
              criteria: {
                ...p.criteria,
                searchValue: params?.searchValue,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  status: params?.status || p.criteria?.advanceSearch?.status,
                  ...params
                },
              },
            }));
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
              pageSize: filter.pagination?.pageSize,
              onChange: (current, pageSize) =>
                setFilter((p) => ({
                  ...p,
                  pagination: { current, pageSize },
                })),
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
                  </Flex>
                },
              },
              {
                title: 'Employee ID',
                dataIndex: 'empNo',
                sorter: 'employeeCode',
                width: 115,
              },
              { title: "Employee Name", dataIndex: "empName" , width:120},
              { title: "Company", dataIndex: "buName" },
              { title: "Location", dataIndex: "location" },
              { title: "Function", dataIndex: "deptName" },
              { title: "Sub Function", dataIndex: "subDeptName" ,width:120},
              { title: "Position", dataIndex: "jobTitle" },
              { title: "Job Level", dataIndex: "jobLevel" },
              {
                title: "Start Date",
                dataIndex: "startedDate",
                width: 99,
                render: (_, entity) =>
                  entity.startedDate
                    ? moment(entity.startedDate).format("YYYY-MM-DD")
                    : "-",
              },
              {
                title: "Probation End Date",
                dataIndex: "probationEndDate",
                width: 140,
                render: (_, entity) =>
                  entity.probationEndDate
                    ? moment(entity.probationEndDate).format("YYYY-MM-DD")
                    : "-",
              },
              { title: "LM1 ID", dataIndex: "appraiser1No" , width:80},
              { title: "LM1 Name", dataIndex: "appraiser1" ,width:120},
              { title: "LM2/FM ID", dataIndex: "appraiser2No" , width: 80},
              { title: "LM2/FM Name", dataIndex: "appraiser2" ,width:120},
              { title: "Remark", dataIndex: "remark" },
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
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          setFilter((prev) => ({
            criteria: {
              ...prev.criteria,
              advanceSearch: {
                buIds: [],
                depIds: [],
                subDeptIds: []
              },
            },
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />
    </>
  );
};
export default Index;
