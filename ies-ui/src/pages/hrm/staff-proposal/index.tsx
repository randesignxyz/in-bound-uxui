import React, { useRef, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { history, useAccess, useQuery } from "@umijs/max";
import {
  AdvanceSearchParams,
  SavePayLoad,
  SearchParams,
  StaffProposalDetail,
  StaffProposalFormNames,
  StaffProposalListItem,
} from './data.types';
import { createService } from "./services";
import { simpleRequestActions } from "@/services/model";
import {
  PlusOutlined,
  ExportOutlined,
  FilterOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { formatDateTime } from "@/pages/utils";
import StaffProposalRequestForm from "./StaffProposalRequestForm";
import Status from "@/components/Status";
import { Button, Flex } from "antd";
import type { TableViewSearchParams } from "@/components/DataCrud/TableView";
import AdvanceEmployeeSearch from "@/pages/hrm/employee/AdvanceEmployeeSearch";
import { ActionType } from "@ant-design/pro-components";

export default function StaffProposalPage() {
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<SearchParams>>({
    criteria: {
      keyword: undefined,
      status: "ALL",
      advanceSearch: {
        buIds: [],
        deptIds: [],
        integratedStatus: "ALL",
        status: "ALL",
      },
    },
    pagination: { current: 1, pageSize: 20 },
  });

  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [advanceSearchParams, setAdvanceSearchParams] =
    useState<AdvanceSearchParams>({
      buIds: [],
      deptIds: [],
      integratedStatus: "ALL",
      status: "ALL",
    });


  const { data, isLoading, refetch } = useQuery(
    ["fetch-paging-staff-proposal", filter],
    () => services.fetchPaging(filter),
    { refetchOnWindowFocus: false }
  );

  return (
    <>
      <PageWrapper<
          StaffProposalListItem,
          StaffProposalDetail,
          SearchParams | SavePayLoad
        >
        tabRender={(item) =>
          access.canRequestHrStaffProposal
            ? [
              {
                action: "add",
                value: "new",
                tabIcon: <PlusOutlined />,
                tabLabel: "New Form",
                panel: (props) => (
                  <StaffProposalRequestForm
                    visisble
                    formKey="NEW"
                    onClose={() => {
                      props?.onCloseTab?.();
                      refetch();
                    }}
                  />
                ),
              },
              {
                action: "view",
                value: item?.formNo || item?.processInstId,
                tabLabel: item?.formNo || "Form",
                panel: (props) => (
                  <StaffProposalRequestForm
                    id={item?.processInstId}
                    type="VIEW"
                    onCloseTab={() => props?.onCloseTab?.()}
                  />
                ),
              },
            ]
            : [
              {
                action: "view",
                value: item?.formNo,
                tabLabel: item?.formNo || "Form",
                panel: (props) => (
                  <StaffProposalRequestForm
                    id={item?.processInstId}
                    type="EDIT"
                    onCloseTab={() => props?.onCloseTab?.()}
                  />
                ),
              },
            ]
        }
        listView={{
          type: "Table",
          title: "Staff Proposal Requests",
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={
                advanceSearchParams.buIds?.length ||
                advanceSearchParams.deptIds?.length ||
                advanceSearchParams.status !== "ALL" ? (
                  <FilterOutlined style={{ color: "red" }} />
                ) : (
                  <SelectOutlined />
                )
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
            setFilter((p) => ({
              ...p,
              criteria: {
                ...p.criteria,
                keyword: params?.searchValue,
                status: params?.status,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  buIds: params?.bu,
                  deptIds: params?.department,
                  status: params?.status,
                },
              },
            }));
          },
          props: {
            actionRef,
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
                render: (_, __, index) => index + 1,
              },
              {
                title: "Form #",
                width: 160,
                render: (_, entity) => (
                  <Flex gap={6}>
                    <Button
                      size="small"
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        window.open(
                          `/external/data-form/${StaffProposalFormNames.processDefKey}/${entity.processInstId}`,
                          "_blank"
                        )
                      }
                    />
                    <a
                      onClick={() =>
                        history.push(
                          `/data-form/${StaffProposalFormNames.processDefKey}/${entity.processInstId}`
                        )
                      }
                    >
                      {entity.formNo}
                    </a>
                  </Flex>
                ),
              },
              { title: "Requested By", dataIndex: "requestedBy" },
              {
                title: "Requested Date",
                render: (_, r) => formatDateTime(r.requestedDate),
              },
              { title: "Employee", dataIndex: "empName" },
              { title: "Job Title", dataIndex: "jobTitle" },
              { title: "BU", dataIndex: "bu" },
              { title: "Function", dataIndex: "department" },
              { title: "Report To", dataIndex: "reportTo" },
              {
                title: "Status",
                width: 120,
                render: (_, r) => <Status text={r.status} />,
              },
            ],
          },
        }}
      />
      <AdvanceEmployeeSearch
        title="Advance Search"
        open={advanceSearchVisible}
        closable
        onClose={() => setAdvanceSearchVisible(false)}
        onReset={() => {
          const reset = {
            buIds: [],
            deptIds: [],
            integratedStatus: "ALL",
            status: "ALL",
          };
          setAdvanceSearchParams(reset);
          setFilter((p) => ({
            ...p,
            criteria: { ...p.criteria, advanceSearch: reset },
          }));
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(params) => {
          setAdvanceSearchVisible(false);
          actionRef.current?.reloadAndRest?.();
            setFilter((p) => ({
              ...p,
              criteria: {
                ...p.criteria,
                keyword: params?.searchValue,
                status: params?.status,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  buIds: params?.buIds,
                  deptIds: params?.department,
                  status: params?.status,
                },
              },
            }));
        }}
      />
    </>
  );
}
