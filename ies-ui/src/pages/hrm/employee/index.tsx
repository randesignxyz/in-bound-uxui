import React, { useRef, useState, useMemo } from 'react';
import {
  PlusOutlined,
  ExportOutlined,
  FilterOutlined,
  SelectOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Flex } from "antd";
import { useAccess, history, useQuery } from "@umijs/max";
import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import {
  EmployeeAdvanceSearchParams,
  EmployeeListItem,
} from '../data';
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import RequestModal from "./EmployeeModal";
import AdvanceSearchDrawer from "./AdvanceEmployeeSearch";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ActionType } from '@ant-design/pro-components';

export default function EmployeePage() {
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
      },
      // pagination: { current: 1, pageSize: 20 },
    });
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
      (adv?.advanceSearch?.buId?.length ?? 0) > 0 ||
      (adv?.advanceSearch?.department?.length ?? 0) > 0
    );
  };
  const advanceSearchIcon = useMemo(() => {
    return isAdvancedFiltered()
      ? <FilterOutlined style={{ color: "red" }} />
      : <SelectOutlined />;
  }, [filter.criteria?.advanceSearch]);

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
                action: 'add',
                tabLabel: 'New Employee',
                panel: (props) => (
                  <RequestModal
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
                tabLabel: item?.employeeCode,
                panel: () => (
                  <RequestModal
                    type="VIEW"
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
                  <RequestModal
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
        dataItem={filter.criteria?.advanceSearch}
        onSearch={(params) => {
          setFilter((prev) => ({
            ...prev,
            criteria: {
              ...prev.criteria,
              advanceSearch: {
                ...prev.criteria?.advanceSearch,
                buId: params.buId || [],
                department: params.department || [],
              },
            },
            // pagination: { ...prev.pagination, current: 1 },
          }));
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          setFilter((prev) => ({
            ...prev,
            criteria: {
              ...prev.criteria,
              advanceSearch: {
                ...prev.criteria?.advanceSearch,
                buId: [],
                department: [],
              },
            },
            // pagination: { ...prev.pagination, current: 1 },
          }));
          setAdvanceSearchVisible(false);
        }}
      />
    </>
  );
}
