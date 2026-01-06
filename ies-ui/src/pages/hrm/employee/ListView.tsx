import React, { useRef, useState, useMemo } from 'react';
import {
  ExportOutlined,
  FilterOutlined,
  SelectOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Flex, message, Modal, Space, Tooltip } from 'antd';
import { useAccess, useQuery } from "@umijs/max";
import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import {
  EmployeeAdvanceSearchParams,
  EmployeeListItem,
} from '../data';
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import DataEntry from "./DataEntry";
import AdvanceSearchDrawer from "./AdvanceEmployeeSearch";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ActionType } from '@ant-design/pro-components';
import ImportFileButton from '@/components/ImportFileButton';
import { ImportDataItem, ImportDataResponse } from '@/services/shared/data';
import EmployeeModal from './EmployeeModal';
import UploadData from '@/pages/hrm/employee/upload-data';
import Profile from "../../profile/index";

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}
export default ({ onAdd, onEdit }: Props) => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [filter, setFilter] =
    useState<TableViewSearchParams<EmployeeAdvanceSearchParams>>({
      criteria: {
        keyword: undefined,
        advanceSearch: {
          buId: [],
          department: [],
          integratedStatus: "ALL",
          status: "ALL",
        },
        pagination: { current: 1, pageSize: 20 },
      },
    });
  const [advanceSearchParams, setAdvanceSearchParams] = useState<EmployeeAdvanceSearchParams>({});
  const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: EmployeeListItem } | { type: 'EDIT'; payload: EmployeeListItem } >();
  const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
  const [importData, setImportData] = useState<ImportDataResponse>()
  const [loading, setLoading] = useState(false);
  const { data, isLoading, refetch } = useQuery(
    ["list-employee", filter],
    () =>
      EmployeeServices.list({
        criteria: filter.criteria,
        pagination: filter.pagination,
      }).query(requestActions),
    { refetchOnWindowFocus: false }
  );
  const isAdvancedFiltered = () => {
    const adv = filter.criteria?.advanceSearch;
    return (
      (adv?.advanceSearch?.buIds?.length ?? 0) > 0 ||
      (adv?.advanceSearch?.depIds?.length ?? 0) > 0
    );
  };
  const advanceSearchIcon = useMemo(() => {
    return isAdvancedFiltered()
      ? <FilterOutlined style={{ color: "red" }} />
      : <SelectOutlined />;
  }, [filter.criteria?.advanceSearch]);

  const saveEmployeeHandler = async (data: EmployeeListItem) => {
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

  return (
    <>
      <PageWrapper<
          EmployeeListItem,
          { searchValue?: string; advanceSearch?: EmployeeAdvanceSearchParams },
          undefined
        >
        tabRender={(item) =>
          access.canAdmin
            ? [
              {
                action: 'view',
                value: item?.id,
                tabLabel: `${item?.employeeCode} - ${item?.firstName} ${item?.lastName}`,
                panel: () => (
                  <Profile
                    id={item?.id}
                    onSuccess={refetch}
                  />
                ),
              },
            ]
            : [
              {
                action: 'view',
                value: item?.id,
                tabLabel: item?.employeeCode,
                panel: () => (
                  <DataEntry
                    type="EDIT"
                    id={item?.id}
                    onSuccess={refetch}
                  />
                ),
              },
            ]
        }
        listView={{
          type: "Table",
          title: "Employee List",
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={advanceSearchIcon}
            />
          ),
          statuses: [
            { option: { label: "All", value: "ALL", default: true } },
            { option: { label: "Active", value: "ACTIVE" } },
            { option: { label: "Inactive", value: "INACTIVE" } },
          ],
          onRefresh: refetch,
          onFilter: (params) => {
            setFilter((p) => ({
              ...p,
              criteria: {
                ...p.criteria,
                searchValue: params?.searchValue,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  status: params?.status || p.criteria?.advanceSearch?.status,
                },
              },
            }));
          },
          props: {
            toolbar: {
              actions: [access.canAdmin === true ? <Tooltip placement="top" title="Import">
                <ImportFileButton<{ id: number }> importedKey="EMPLOYEE" onHandleChange={status => {
                  setLoading(status === 'uploading')
                  if (status === 'done') {
                    message.info("upload completed.")
                  }
                }} />
              </Tooltip> : '',
                access.canAccessHrESSImportTraing === true ?<ImportFileButton<ImportDataItem>
                  label='Import Training'
                  importedKey="ESS_IMPORT_TRAINING_LIST"
                  onDataResponse={data => {
                    setImportData(data)
                  }}
                  key={'ESS-IMPORT-TRAINING-LIST'}
                  onHandleChange={(status) => {
                    if (status === 'done') {
                      message.info('Data uploaded.');
                    }
                  }}
                />:''
              ],
            },
            dataSource: data?.items || [],
            loading: isLoading,
            pagination: {
              total: data?.total,
              current: filter.pagination?.current,
              pageSize: filter.pagination?.pageSize,
              onChange: (current, pageSize) =>
                setFilter((p) => ({
                  criteria: { ...p.criteria },
                  pagination: { current, pageSize },
                })),
            },
            scroll: { x: "max-content" },
            bordered: true,
            columns: [
              {title: '#',
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
                dataIndex: 'employeeCode',
                sorter: 'employeeCode',
                width: 150,
                actionProps: (item) => ({
                  type: 'view',
                  label: item.employeeCode,
                }),
                render: (_, entity) => (
                  <Flex gap={5} align="center">
                    <span style={{ color: "#1677ff", cursor: "pointer" }}>
                  {entity.id}
                  </span>
                  </Flex>
                ),
              },
              { title: 'Full Name (KH)', dataIndex: 'employeeLocalName' },
              { title: 'Full Name (EN)', dataIndex: 'firstName', sorter: 'firstName',
                render(_, entity) { return ( entity.lastName+ " " +entity.firstName ) } },
              {title: 'Position', dataIndex: 'jobTitle', sorter: 'jobTitle'},
              {title: 'Function', dataIndex: 'department', sorter: 'department'},
              { title: 'Company', dataIndex: 'bu' },
              { title: 'Status', render: (_, r) => <Status text={r.status} /> },
              {width: 50,
                hidden: !access.canAdmin,
                render: (dom, r) => {
                  return (<a onClick={() => setModalVisible({ type: 'EDIT', payload: r })}>
                      <EditOutlined/>
                    </a>
                  );
                },
              }
            ]
          },
        }}
      />
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
          setAdvanceSearchParams(params);
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          actionRef.current?.reloadAndRest?.();
        }}
      />
      <EmployeeModal
        open={!!modalVisible?.type}
        onOpenChange={(visible) => hideModal(visible)}
        dataItem={modalVisible?.payload}
        onFinishFailed={(error) => {
          message.error(
            <Space direction="vertical" align="start">
              {error.errorFields.map((it) => (
                // eslint-disable-next-line react/jsx-key
                <div>{it.errors.join(', ')}</div>
              ))}
            </Space>,
          );
        }}
        onFinish={(data) => {
          return saveEmployeeHandler({ ...data,employeeId:modalVisible?.payload.id||0});
        }}
      />
      {access.canAccessHrESSImportTraing &&
        <UploadData title="ESS Training List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />}
    </>
  );
}
