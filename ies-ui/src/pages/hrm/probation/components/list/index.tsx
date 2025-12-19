import React, { useEffect, useRef, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import {
  ProbationEvaluationEmpList,
  ProbationEmpStatusTotal,
} from "../../data.types";
import { createService } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { useAccess } from "umi";
import Status from "@/components/Status";
import DataEntryFormView from "../../ProbationRequestModal";
import { Button, Grid, Space } from "antd";
import {
  ExportOutlined,
  EyeOutlined,
  FilterOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { formatDate, formatDateTime } from "@/pages/utils";
import { ProbationEvaluationRequestFormNames } from "../../process-flow";
import { useQuery } from "@umijs/max";
import { StaffRequisitionAdvanceSearchParams } from "@/pages/hrm/data";
import AdvanceEmployeeSearch from "@/pages/hrm/employee/AdvanceEmployeeSearch";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';

interface SearchParams {
  status?: "ALL" | "PENDING" | "COMPLETED" | "REJECTED";
  searchValue?: string;
  advanceSearch?: StaffRequisitionAdvanceSearchParams;
  pagination?: {
    current?: number;
    pageSize?: number;
  };
}

export default function ProbationListPage() {
  const requestActions = simpleRequestActions();
  const srv = createService({ request: requestActions });
  const access = useAccess();
  const pageRef = useRef<any>(null);
  Grid.useBreakpoint();
  const [filter, setFilter] = useState<TableViewSearchParams<SearchParams>>({
    status: "ALL",
    pagination: { current: 1, pageSize: 20 },
    advanceSearch: {
      buIds: [],
      deptIds: [],
      integratedStatus: "ALL",
      status: "ALL",
    },
  });

  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const [total, setTotal] = useState<ProbationEmpStatusTotal | null>(null);
  const { data, isLoading, refetch } = useQuery(
    ["probation-evaluation-page", filter],
    () => srv.fetchPaging(filter),
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    srv.findProbationEmpStatusTotal().then(setTotal);
  }, []);

  const refreshTotals = () => {
    srv.findProbationEmpStatusTotal().then(setTotal);
    refetch();
  };
  const supTitle = (count: number) =>
    count > 0 && (
      <sup
        style={{
          background: "#ff4d4f",
          color: "#fff",
          borderRadius: 10,
          padding: "0 7px",
          fontSize: 12,
          marginLeft: 6,
        }}
      >
        {count}
      </sup>
    );
  const openTab = (record: ProbationEvaluationEmpList) => {
    pageRef.current?.showTab?.({
      action: "view",
      value: record.formNo,
      tabLabel: record.formNo,
      panel: (props: any) => (
        <DataEntryFormView
          id={record.instanceId}
          type="VIEW"
          onCloseTab={props?.onCloseTab}
        />
      ),
    });
  };
  return (
    <>
      <PageWrapper<ProbationEvaluationEmpList, SearchParams, unknown>
        ref={pageRef}
        title="Probation Evaluation"
        tabRender={(item) => {
          const tabs: any[] = [];

          if (access.canCreateHrProbationEvaluationRequest) {
            tabs.push({
              action: "add",
              tabLabel: "New Probation Form",
              panel: (props: any) => (
                <DataEntryFormView
                  type="CREATE"
                  onCloseTab={() => {
                    props?.onCloseTab?.();
                    refreshTotals();
                  }}
                />
              ),
            });
          }

          if (item) {
            tabs.push({
              action: "view",
              value: item.formNo,
              tabLabel: item.formNo,
              panel: (props: any) => (
                <DataEntryFormView
                  id={item.instanceId}
                  type="VIEW"
                  onCloseTab={() => {
                    props?.onCloseTab?.();
                    refreshTotals();
                  }}
                />
              ),
            });
          }

          return tabs;
        }}
        listView={{
          type: "Table",
          title: "Probation Evaluation List",

          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={
                filter.criteria?.advanceSearch?.advanceSearch?.bu.length ||
                filter.criteria?.advanceSearch?.advanceSearch?.department.length ||
                filter.criteria?.advanceSearch?.status !== "ALL" ? (
                  <FilterOutlined style={{ color: "red" }} />
                ) : (
                  <SelectOutlined />
                )
              }
            />
          ),

          statuses: [
            { option: { label: "All", value: "ALL", default: true } },
            {
              option: {
                label: <>Pending {supTitle(total?.pending || 0)}</>,
                value: "PENDING",
              },
            },
            { option: { label: "Completed", value: "COMPLETED" } },
            { option: { label: "Rejected", value: "REJECTED" } },
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
                  buIds: params?.advanceSearch?.bu,
                  deptIds: params?.advanceSearch?.department,
                  status: params?.status,
                },
              },
            }));
          },
          props: {
            loading: isLoading,
            dataSource: data?.items || [],
            rowKey: "instanceId",
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
            columns: [
              {
                title: "Form No #",
                width: 200,
                render: (_, r) => (
                  <Space size={4}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => openTab(r)}
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        window.open(
                          `/external/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${r.instanceId}`,
                          "_blank"
                        )
                      }
                    />
                    <a onClick={() => openTab(r)}>{r.formNo}</a>
                  </Space>
                ),
              },
              { title: "Employee No", dataIndex: "empNo" },
              { title: "Employee Name", dataIndex: "empName" },
              { title: "Employee (KH)", dataIndex: "internalName" },
              { title: "Position", dataIndex: "jobTitle" },
              { title: "Job Level", dataIndex: "formTypeName" },
              { title: "Business Unit", dataIndex: "buName" },
              { title: "Function", dataIndex: "departmentName" },
              { title: "Modified By", dataIndex: "lastModifiedBy" },
              {
                title: "Modified Date",
                render: (_, r) =>
                  r.lastModifiedDate &&
                  formatDateTime(r.lastModifiedDate, "DD-MMM-YYYY"),
              },
              { title: "Status", render: (_, r) => <Status text={r.status} /> },
              {
                title: "Due Date",
                render: (_, r) =>
                  r.dueDate && formatDate(r.dueDate, "DD-MMM-YYYY"),
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
          setFilter((p) => ({
            ...p,
            advanceSearch: {
              buIds: [],
              deptIds: [],
              integratedStatus: "ALL",
              status: "ALL",
            },
          }));
          refetch();
        }}
        onSearch={(params) => {
          setFilter((p) => ({
            ...p,
            advanceSearch: { ...p.criteria?.advanceSearch, ...params },
          }));
          setAdvanceSearchVisible(false);
          refetch();
        }}
      />
    </>
  );
}
