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
import { ActionType } from "@ant-design/pro-components";
import AdvanceSearchDrawer from '@/pages/hrm/staff-requisition/AdvanceEmployeeSearch';
import DetailProposal from "./detail";

export default function StaffProposalPage() {
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<SearchParams>>({
    criteria: {
      advanceSearch: {
        buIds: [],
        deptIds: [],
        integratedStatus: "ALL",
        status: "ALL",
      },
    },
  });

  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<AdvanceSearchParams>({});
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
          { searchValue?: string; advanceSearch?: SearchParams | SavePayLoad }
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
                <StaffProposalRequestForm{...props}
                                         visisble
                                         formKey={StaffProposalFormNames.processDefKey}
                                         onClose={() => {
                                              props?.onCloseTab?.();
                                               refetch()
                                         }}
                />
                ),
              },
              {
                action: "view",
                value: item?.formNo || item?.processInstId,
                tabLabel: item?.formNo || "Form",
                panel: (props) => (
                  <DetailProposal
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
              ...p,
              criteria:{
                ...p.criteria,
                keyword: params?.searchValue,
                advanceSearch:{
                  ...p.criteria?.advanceSearch,
                  status:params?.status
                }
              }
            })))
          },
          props: {
            actionRef,
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
              {
                title: "#",
                width: 40, // adjust width if needed
                align: "center",
                render: (_, entity, index) => (
                  <Flex gap={3} align="center">
                    <span>{index + 1}</span>
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

                    {/* Form link */}
                    <a
                      onClick={() =>
                        history.push(
                          `/data-form/${StaffProposalFormNames.processDefKey}/${entity.processInstId}`
                        )
                      }
                    >
                    </a>
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
                    style={{ color: "#1677ff", cursor: "pointer" }}
                    onClick={() => {
                      actionRef.current?.open?.({
                        action: "view",
                        value: entity.formNo || entity.processInstId,
                        tabLabel: entity.formNo,
                      });
                    }}
                  >
                     {entity.formNo}
                  </span>
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
