import React, { useState, useEffect, useRef } from "react";
import PageWrapper from "@/components/PageWrapper";
import {
  ProbationEvaluationEmpList,
  ProbationEmpStatusTotal,
} from "../../data.types";
import { createService } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { useAccess } from 'umi';
import Status from "@/components/Status";
import DataEntryFormView from "../../ProbationRequestModal"; // main form (create/view/edit)
import { Button, Grid, Space } from 'antd';
import { ExportOutlined, EyeOutlined } from "@ant-design/icons";
import { formatDate, formatDateTime } from "@/pages/utils";
import { ProbationEvaluationRequestFormNames } from "../../process-flow";
import { useQuery } from '@umijs/max';

interface SearchParams {
  status?: "ALL" | "PENDING" | "COMPLETED" | "REJECTED";
  pendingFilter?: string[];
  keyword?: string;
}
export default function ProbationListPage() {
  const requestActions = simpleRequestActions();
  const srv = createService({ request: requestActions });
  const access = useAccess();
  const pageRef = useRef<any>(null); // Ref for PageWrapper
  const { data, isLoading, refetch } = useQuery(
    ["probation-evaluation-page'", filter],
    () => srv.fetchPaging(filter),
    { refetchOnWindowFocus: false }
  );
  Grid.useBreakpoint();
  const [filter, setFilter] = useState<SearchParams>({ status: "ALL" });
  const [total, setTotal] = useState<ProbationEmpStatusTotal | null>(null);
  useEffect(() => {
    srv.findProbationEmpStatusTotal().then(setTotal);
  }, []);
  const refreshTotals = () => {
    srv.findProbationEmpStatusTotal().then(setTotal);
  };
  const supTitle = (count: number) =>
    count > 0 && (
      <sup
        style={{
          background: "#ff4d4f",
          color: "white",
          borderRadius: "10px",
          padding: "0 7px",
          fontSize: "12px",
          marginLeft: "6px",
          minWidth: "20px",
          height: "20px",
          lineHeight: "20px",
          display: "inline-block",
          textAlign: "center",
        }}
      >
        {count}
      </sup>
    );
  const openTab = (record: ProbationEvaluationEmpList) => {
    const tab = {
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
    };
    pageRef.current?.showTab?.(tab); // open tab via PageWrapper ref
  };
  return (
    <PageWrapper<ProbationEvaluationEmpList, SearchParams, unknown>
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
            value: item.formNo || item.instanceId,
            tabLabel: item.formNo || `Probation - ${item.empName}`,
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
        onFilter: (params) => {
          setFilter((prev) => ({ ...prev, ...params }));
        },
        onRefresh: refreshTotals,
        props: {
          dataSource: data?.items || [],
          pagination: {
            total: data?.total,
            current: filter.pagination?.current,
            pageSize: filter.pagination?.pageSize
          },
          scroll: { x: "max-content" },
          rowKey: (r) => r.instanceId,
          columns: [
            {
              title: "Form No #",
              width: 200,
              render: (_, record) => (
                <Space size={4}>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => openTab(record)}
                  />
                  <Button
                    type="link"
                    size="small"
                    icon={<ExportOutlined />}
                    onClick={() =>
                      window.open(
                        `/external/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${record.instanceId}`,
                        "_blank"
                      )?.focus()
                    }
                  />
                  <a onClick={() => openTab(record)} style={{ cursor: "pointer" }}>
                    {record.formNo}
                  </a>
                </Space>
              ),
            },
            { title: "Employee No", dataIndex: "empNo", sorter: true },
            { title: "Employee Name", dataIndex: "empName", sorter: true },
            { title: "Employee (KH)", dataIndex: "internalName" },
            { title: "Position", dataIndex: "jobTitle" },
            { title: "Job Level", dataIndex: "formTypeName" },
            { title: "Business Unit", dataIndex: "buName" },
            { title: "Function", dataIndex: "departmentName" },
            { title: "Modified By", dataIndex: "lastModifiedBy" },
            {
              title: "Modified Date",
              dataIndex: "lastModifiedDate",
              render: (_, r) =>
                r.lastModifiedDate && formatDateTime(r.lastModifiedDate, "DD-MMM-YYYY"),
            },
            { title: "Status", render: (_, r) => <Status text={r.status} /> },
            {
              title: "Due Date",
              dataIndex: "dueDate",
              render: (_, r) => r.dueDate && formatDate(r.dueDate, "DD-MMM-YYYY"),
            },
          ],
        },
      }}
    />
  );
}
