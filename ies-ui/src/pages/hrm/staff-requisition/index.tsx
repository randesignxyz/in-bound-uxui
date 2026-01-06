import React, { useRef, useState, useMemo } from 'react';
import {
  PlusOutlined,
  ExportOutlined,
  FilterOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useAccess, useQuery } from "@umijs/max";
import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import { formatDate } from "@/pages/utils";
import {
  StaffRequisitionAdvanceSearchParams,
  StaffRequisitionRequest,
} from "../data";
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import RequestModal from "./RequestModal";
import AdvanceSearchDrawer from "./AdvanceEmployeeSearch";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ActionType } from '@ant-design/pro-components';
import Form from '@/pages/process-flow/form';
export default function StaffRequisitionPage() {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [filter, setFilter] =
    useState<TableViewSearchParams<StaffRequisitionAdvanceSearchParams>>({
      criteria: {
        keyword: undefined,
        advanceSearch: {
          buIds: [],
          depIds: [],
          integratedStatus: "ALL",
          status: "ALL",
        },
         pagination: { current: 1, pageSize: 20 },
      },
    });

  const { data, isLoading, refetch } = useQuery(
    ["fetch-staff-requisition", filter],
    () =>
      EmployeeServices.listStaffRequisition(filter).query(requestActions),
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
  return (
    <>
      <PageWrapper<
          StaffRequisitionRequest,
          { searchValue?: string; advanceSearch?: StaffRequisitionAdvanceSearchParams },
          undefined
        >
        actionRef={actionRef}  // important for open tab
        tabRender={(item) =>
          access.canRequestHrStaffRequisition
            ? [
              {
                action: "add",
                tabIcon: <PlusOutlined />,
                tabLabel: "New Request",
                panel: (props) => (
                  <RequestModal
                    open
                    width="1000px"
                    onOpenChange={() => props?.onCloseTab?.()}
                    onRefresh={() => actionRef.current?.reloadAndRest?.()}
                  />
                ),
              },
              {
                action: "view",
                tabLabel: item?.formNo || `Form (${item?.instanceId})`,
                panel: (props) => (
                  <Form openInTab formKey="staff_requisition_request_process" id={item?.instanceId} />
                ),
              }

            ]
            : [
              {
                action: "view",
                tabLabel: item?.formNo || `Form (${item?.instanceId})`,
                panel: (props) => (
                  <RequestModal
                    open
                    width="1000px"
                    id={item?.instanceId}
                    type="VIEW"
                    onOpenChange={() => props?.onCloseTab?.()}
                  />
                ),
              },
            ]
        }
        listView={{
          type: "Table",
          title: "Staff Requisition Requests",
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={advanceSearchIcon}
            />
          ),
          statuses: [
            { option: { label: "All", value: "ALL", default: true } },
            { option: { label: "Pending", value: "PENDING" } },
            { option: { label: "Completed", value: "COMPLETED" } },
            { option: { label: "Rejected", value: "REJECTED" } },
            { option: { label: "Canceled", value: "CANCELED" } },
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
                  status: params?.status
                    || p.criteria?.advanceSearch?.status,
                },
              },
              // pagination: { current: 1, pageSize: 20 },
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
                  ...p,
                  pagination: { current, pageSize },
                })),
            },
            scroll: { x: "max-content" },
            bordered: true,
            columns: [
              {
                title: "#",
                width: 40,
                align: "center",
                render: (_, r, i) => (
                  <Flex gap={5} align="center">
                    <span>{i + 1}</span>
                    <Button
                      size="small"
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        window.open(
                          `/external/data-form/staff_requisition_request_process/${r.instanceId}`
                        )?.focus()
                      }
                    />
                  </Flex>
                ),
              },
              {
                title: "Form #",
                width: 160,
                actionProps: (item) => ({
                  type: 'view',
                  label: item.formNo,
                }),
                render: (_, entity) => (
                  <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => {
                      actionRef.current?.open?.({
                        action: 'view',
                        value: entity, // ✅ pass full entity
                        tabLabel: entity.formNo,
                        key: entity.instanceId, // optional unique key
                      });
                    }}
                  >
                    {entity.formNo}
                  </span>
                ),
              },
              { title: "Requested By", dataIndex: "requester" },
              { title: "Requested Date", render: (_, r) => formatDate(r.requestedDate) },
              { title: "Position Hired", render: (_, r) => r.positionHired.name },
              { title: "BU", render: (_, r) => r.bu.name },
              { title: "Function", render: (_, r) =>
                  [r.department.name, r.subDepartment?.name].filter(Boolean).join(", ")
              },
              { title: "Req. Type", render: (_, r) => r.requisitionType.name },
              { title: "Preferred Start Date", render: (_, r) => formatDate(r.expectedJoinDate) },
              { title: "Status", render: (_, r) => <Status text={r.status} /> },
            ],
          },
        }}
      />
      <AdvanceSearchDrawer
        open={advanceSearchVisible}
        onClose={() => setAdvanceSearchVisible(false)}
        // dataItem={filter.criteria?.advanceSearch}
        onSearch={(params) => {
          setFilter((prev) => ({
            ...prev,
            criteria: {
              ...prev.criteria,
              advanceSearch: {
                ...prev.criteria?.advanceSearch,
                buIds: params.buIds || [],
                depIds: params.depIds || [],
              },
            },
            pagination: { ...prev.pagination, current: 1 },
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
                buIds: [],
                depIds: [],
              },
            },
            pagination: { ...prev.pagination, current: 1 },
          }));
          setAdvanceSearchVisible(false);
        }}
      />
    </>
  );
}
