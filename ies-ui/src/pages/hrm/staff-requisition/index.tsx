import React, { useState } from "react";
import { PlusOutlined, ExportOutlined, FilterOutlined, SelectOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useAccess, useModel, history, useQuery } from "@umijs/max";
import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import { formatDate } from "@/pages/utils";
import { StaffRequisitionAdvanceSearchParams, StaffRequisitionRequest } from "../data";
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import RequestModal from "./RequestModal";
import AdvanceSearchDrawer from "./AdvanceEmployeeSearch";

export default function StaffRequisitionPage() {
  const access = useAccess();
  const requestActions = simpleRequestActions();

  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<StaffRequisitionAdvanceSearchParams>({});
  const [filter, setFilter] = useState<{
    searchValue?: string;
    advanceSearch?: StaffRequisitionAdvanceSearchParams;
  }>({
    advanceSearch: { status: "ALL", integratedStatus: "ALL" },
  });

  const { data, isLoading, refetch } = useQuery(
    ["fetch-staff-requisition", filter],
    () => EmployeeServices.listStaffRequisition({ criteria: filter }).query(requestActions),
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
              type="link"
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
            setFilter((prev) => ({
              ...prev,
              searchValue: params?.searchValue,
              advanceSearch: { ...prev.advanceSearch, status: params?.status },
            }));
          },
          props: {
            dataSource: data?.items || [],
            loading: isLoading,
            pagination: {
              total: data?.total,
              current: filter.advanceSearch?.current,
              pageSize: filter.advanceSearch?.pageSize,
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
          setFilter((prev) => ({ ...prev, advanceSearch: { ...prev.advanceSearch, ...params } }));
          setAdvanceSearchParams(params);
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          setFilter((prev) => ({ ...prev, advanceSearch: { status: "ALL", integratedStatus: "ALL" } }));
          setAdvanceSearchParams({});
          setAdvanceSearchVisible(false);
        }}
      />
    </>
  );
}
