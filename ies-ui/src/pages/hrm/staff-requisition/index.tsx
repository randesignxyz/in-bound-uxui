import React, { useRef, useState } from 'react';
import { PlusOutlined, ExportOutlined, FilterOutlined, SelectOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useAccess, history, useQuery } from "@umijs/max";
import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import { formatDate } from "@/pages/utils";
import { StaffRequisitionAdvanceSearchParams, StaffRequisitionRequest } from "../data";
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import RequestModal from "./RequestModal";
import AdvanceSearchDrawer from "./AdvanceEmployeeSearch";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ActionType } from '@ant-design/pro-components';

export default function StaffRequisitionPage() {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<StaffRequisitionAdvanceSearchParams>({});
  const [filter, setFilter] = useState<TableViewSearchParams<StaffRequisitionAdvanceSearchParams>>({
    criteria: {
      keyword: undefined,
      advanceSearch: {
        buIds: [],
        deptIds: [],
        integratedStatus: "ALL",
        status: "ALL",
      },
    },
    pagination: { current: 1, pageSize: 20 },
  });
  console.log(filter)
  const { data, isLoading, refetch } = useQuery(
    ["fetch-staff-requisition", filter],
    () => EmployeeServices.listStaffRequisition({ criteria: filter.criteria, pagination:filter.pagination}).query(requestActions),
    { refetchOnWindowFocus: false }
  );
  return (
    <>
      <PageWrapper<
          StaffRequisitionRequest,
          { searchValue?: string; advanceSearch?: StaffRequisitionAdvanceSearchParams },
          undefined
        >
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
                    onRefresh={refetch}
                  />
                ),
              },
              {
                action: "view",
                tabLabel: item?.formNo || `Form (${item?.instanceId})` || "Draft",
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
            : [
              {
                action: "view",
                tabLabel: item?.formNo || `Form (${item?.instanceId})` || "Draft",
                panel: (props) => (
                  <RequestModal
                    open
                    width="1000px"
                    id={item?.instanceId}
                    type="EDIT"
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
              icon={
                Object.values(advanceSearchParams || {}).some((v) => v !== undefined && v !== null && v !== "")
                  ? <FilterOutlined style={{ color: "red" }} />
                  : <SelectOutlined />
              }
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
            setFilter((p=>({
              criteria:{
                ...p.criteria,
                searchValue: params?.searchValue,
                advanceSearch:{
                  ...p.criteria?.advanceSearch,
                  status:params?.status
                }
              }
            })))
          },
          props: {
            dataSource: data?.items || [],
            loading: isLoading,
            pagination: {
              total: data?.total,
              current: filter.pagination?.current,
              pageSize: filter.pagination?.pageSize,
              onChange: (current, pageSize) =>{
                setFilter((p)=>({
                  criteria:{
                    ...p.criteria
                  },
                  pagination:{
                    current:current,
                    pageSize:pageSize
                  }
                }))
              }
            },
            scroll: { x: "max-content" },
            bordered: true,
            columns: [
              { align: "center", title: "#", width: 40, render: (_, __, index) => index + 1 },
              {
                title: "Form #",
                width: 160,
                sorter: true,
                render: (_, r) => (
                  <Flex gap={5}>
                    <Button
                      size="small"
                      type="link"
                      title="Open in new tab"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        window.open(`/external/data-form/staff_requisition_request_process/${r.instanceId}`)?.focus()
                      }
                    />
                    <a onClick={() => history.push(`/data-form/staff_requisition_request_process/${r.instanceId}`)}>
                      {r.formNo}
                    </a>
                  </Flex>
                ),
              },
              { title: "Requested By", dataIndex: "requester", sorter: true },
              { title: "Requested Date", dataIndex: "requestedDate", sorter: true, render: (_, r) => formatDate(r.requestedDate) },
              { title: "Position Hired", sorter: true, render: (_, r) => r.positionHired.name },
              { title: "BU", sorter: true, render: (_, r) => r.bu.name },
              { title: "Function", sorter: true, render: (_, r) => [r.department.name, r.subDepartment?.name].filter(Boolean).join(", ") },
              { title: "Req. Type", sorter: true, render: (_, r) => r.requisitionType.name },
              { title: "Preferred Start Date", sorter: true, render: (_, r) => formatDate(r.expectedJoinDate) },
              { title: "Status", render: (_, r) => <Status text={r.status} /> },
            ],
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
    </>
  );
}
