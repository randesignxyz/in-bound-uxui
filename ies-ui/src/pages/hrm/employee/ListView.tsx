import React, { useRef, useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { EmployeeAdvanceSearchParams, EmployeeListItem } from '../data';
import { EmployeeServices } from '../services';
import { useAccess, useQuery } from '@umijs/max';
import DataEntryFormView from './DataEntry';
import AdvanceEmployeeSearch from './AdvanceEmployeeSearch';
import ImportFileButton from '@/components/ImportFileButton';
import UploadData from '@/pages/hrm/employee/upload-data';
import { Button, Flex, message, Modal } from 'antd';
import { EditOutlined, ExportOutlined, FilterOutlined, SelectOutlined } from '@ant-design/icons';
import { simpleRequestActions } from '@/services/model';
import { ImportDataItem, ImportDataResponse } from '@/services/shared/data';
import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ActionType } from '@ant-design/pro-components';
import AdvanceSearchDrawer from '@/pages/hrm/probation/components/list/AdvanceEmployeeSearch';

const Status = ({ text }: { text: string }) => (
  <span style={{ color: text === 'ACTIVE' ? 'green' : 'red' }}>{text}</span>
);

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

const EmployeeList = ({ onAdd, onEdit }: Props) => {
  const access = useAccess();
  const services = EmployeeServices;
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const [filter, setFilter] = useState<TableViewSearchParams<EmployeeAdvanceSearchParams>>({
    criteria: { advanceSearch: { status: 'ALL' } },
  });
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  // const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [modalVisible, setModalVisible] = useState<{ type: 'ADD' | 'EDIT'; payload: EmployeeListItem }>();
  const [importData, setImportData] = useState<ImportDataResponse>()
  const [loading, setLoading] = useState(false);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<EmployeeAdvanceSearchParams>({
    status: "ACTIVE",
  });
  const { data, isLoading, refetch } = useQuery(["list-employee", filter], () => services.list(filter));
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
  const saveEmployeeHandler = async (data: EmployeeListItem) => {
    Modal.confirm({
      title: 'Save employee profiles',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.EmployeeUpdate(data)(requestActions);
          hideModal();
          actionRef.current?.reloadAndRest?.();
        } catch (error: any) {
          message.error(error.message || 'Failed to save employee profiles.');
        }
      },
    });
  };

  // const handleAdvanceSearch = (values: EmployeeAdvanceSearchParams) => {
  //   setFilter((prev) => ({
  //     criteria: { ...prev.criteria, advanceSearch: values },
  //   }));
  //   setAdvanceSearchVisible(false);
  // };

  const actionButtons = [
    access.canAdmin && (
      <ImportFileButton<{ id: number }>
        key="importEmployee"
        importedKey="EMPLOYEE"
        onHandleChange={(status) => {
          setLoading(status === 'uploading');
          if (status === 'done') message.info('Upload completed.');
        }}
      />
    ),
    access.canAccessHrESSImportTraing && (
      <ImportFileButton<ImportDataItem>
        key="importTraining"
        label="Import Training"
        importedKey="ESS_IMPORT_TRAINING_LIST"
        onDataResponse={(data) => setImportData(data)}
        onHandleChange={(status) => {
          if (status === 'done') message.info('Data uploaded.');
        }}
      />
    ),
  ].filter(Boolean);

  return (
    <div>
      <PageWrapper<EmployeeListItem, EmployeeAdvanceSearchParams, unknown>
        tabRender={(item) =>
          access.canAdmin
            ? [
              {
                action: 'add',
                tabLabel: 'New Employee',
                panel: (props) => (
                  <DataEntryFormView
                    type="CREATE"
                    onCloseTab={() => {
                      props?.onCloseTab?.();
                      refetch();
                    }}
                  />
                ),
              },
              {
                action: 'view',
                value: item?.id,
                tabLabel: `${item?.employeeCode}`,
                panel: (props) => <DataEntryFormView id={item?.id} type="VIEW" onCloseTab={() => props?.onCloseTab?.()} />,
              },
            ]
            : [
              {
                action: 'view',
                value: item?.id,
                tabLabel: `${item?.employeeCode}`,
                panel: (props) => <DataEntryFormView id={item?.id} type="EDIT" onCloseTab={() => props?.onCloseTab?.()} />,
              },
            ]
        }
        listView={{
          type: 'Table',
          title: 'Employees List',
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearch({ visible: true })}
              icon={
                Object.values(advanceSearchParams).some(
                  (v) => v !== undefined && v !== null && v !== ''
                )
                  ? <FilterOutlined style={{ color: 'red' }} />
                  : <SelectOutlined />
              }
            />
          ),
          statuses: [
            { option: { label: 'All', value: 'ALL', default: true } },
            { option: { label: 'Active', value: 'ACTIVE' } },
            { option: { label: 'Inactive', value: 'INACTIVE' } },
          ],
          actionButtons,
          onRefresh: refetch,
          onFilter: (params) => {
            setFilter((p) => ({
              criteria: {
                ...p.criteria,
                searchValue: params?.searchValue,
                advanceSearch: {
                  ...p.criteria.advanceSearch,
                  status: params?.status ?? p.criteria.advanceSearch?.status ?? 'ALL',
                },
              },
            }));
          },
          props: {
            dataSource: data?.items || [],
            pagination: {
              total: data?.total,
              current: filter.pagination?.current,
              pageSize: filter.pagination?.pageSize,
            },
            loading: isLoading || loading,
            scroll: { x: 'max-content' },
            bordered: true,
            columns: [
              {
                title: 'Employee ID',
                dataIndex: 'employeeCode',
                sorter: true,
                render(_, entity) {
                  return (
                    <Flex gap={5}>
                      <Button
                        size="small"
                        type="link"
                        title="Open in new tab"
                        icon={<ExportOutlined />}
                        onClick={() => window.open(`/profile/2/${entity.id}`)?.focus()}
                      />
                      <a onClick={() => window.history.pushState({}, '', `/profile/2/${entity.id}`)}>
                        {entity.employeeCode}
                      </a>
                    </Flex>
                  );
                },
              },
              { title: 'Full Name (KH)', dataIndex: 'employeeLocalName' },
              {
                title: 'Full Name (EN)',
                dataIndex: 'firstName',
                sorter: true,
                render(_, entity) {
                  return entity.lastName + ' ' + entity.firstName;
                },
              },
              { title: 'Position', dataIndex: 'jobTitle', sorter: true },
              { title: 'Function', dataIndex: 'department', sorter: true },
              { title: 'Company', dataIndex: 'bu' },
              { title: 'Status', render: (_, r) => <Status text={r.status} /> },
              access.canAdmin
                ? {
                  width: 50,
                  render: (_, r) => <a onClick={() => setModalVisible({ type: 'EDIT', payload: r })}><EditOutlined /></a>,
                }
                : {},
            ],
          },
        }}
      />

      {access.canAccessHrESSImportTraing &&
        <UploadData title="ESS Training List" onCancel={() => setImportData(undefined)} open={!!importData} datasources={importData} onFinish={()=> {actionRef.current?.reloadAndRest?.()}} />}
      {modalVisible && (
        <DataEntryFormView
          type={modalVisible.type === 'ADD' ? 'CREATE' : 'EDIT'}
          id={modalVisible.payload?.id}
          onCloseTab={hideModal}
          onSave={saveEmployeeHandler}
        />
      )}
      <AdvanceSearchDrawer
        open={advanceSearchVisible}
        onClose={() => setAdvanceSearchVisible(false)}
        onSearch={(params) => {
          setFilter((prev) =>
            ({ ...prev, advanceSearch: { ...prev.advanceSearch, ...params } }));
          setAdvanceSearchParams(params);
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          setFilter((prev) => ({ ...prev, advanceSearch: { status: "ALL", integratedStatus: "ALL", bu_id: [] , department_id: [] } }));
          setAdvanceSearchParams({});
          setAdvanceSearchVisible(false);
        }}
      />
    </div>
  );
};
export default EmployeeList;
