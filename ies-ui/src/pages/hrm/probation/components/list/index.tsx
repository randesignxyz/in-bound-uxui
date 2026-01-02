import React, { useEffect, useRef, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import {
  ProbationEvaluationEmpList,
  ProbationEmpStatusTotal,
} from "../../data.types";
import { createService } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { useAccess, history } from "umi";
import Status from "@/components/Status";
import DataEntryFormView from '../../ProbationRequestModal';
import { Button, Grid, Space } from 'antd';
import {
  ExportOutlined,
  EyeOutlined,
  FilterOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { Model } from "../../model";
import { formatDate, formatDateTime } from "@/pages/utils";
import { ProbationEvaluationRequestFormNames } from "../../process-flow";
import { useQuery } from '@umijs/max';
import {
  ProbationAdvanceSearchParams,
} from '@/pages/hrm/data';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import AdvanceSearchDrawer from './AdvanceEmployeeSearch';
import { ActionType } from '@ant-design/pro-components';
import ProbationEvaluationQuickView from '@/pages/hrm/probation/components/quick-view';
import ProbationRequestModal from '../../ProbationRequestModal';
import ViewForm from "../../process-flow/ViewForm"
import Form from '@/pages/process-flow/form';

export default function ProbationListPage() {
  const requestActions = simpleRequestActions();
  const [forceChange, setForceChange] = useState<number>(0)
  const [appraisalEmp, setAppraisalEmp] = useState<ProbationEvaluationEmpList>()
  const actionRef = useRef<ActionType>();
  const refeshTable = () => {
    setForceChange(v => v + 1)
    actionRef?.current?.reload?.()
  }
  const [advanceSearchParams, setAdvanceSearchParams] = useState<ProbationAdvanceSearchParams>({});
  const srv = createService({ request: requestActions });
  const access = useAccess();
  const { modals } = Model();
  const quickViewHandler = (appEmp: ProbationEvaluationEmpList) => {
    modals.showModal('QuickViewAppraisalForm');
    setAppraisalEmp(appEmp)
  }
  const pageRef = useRef<any>(null);
  Grid.useBreakpoint();
  const [filter, setFilter] = useState<TableViewSearchParams<ProbationAdvanceSearchParams>>({
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
      <PageWrapper<ProbationEvaluationEmpList, ProbationAdvanceSearchParams, undefined>
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
              panel: (props: any) => item?.formNo || item?.instanceId ?
                <ViewForm
                  type="VIEW"
                  onCloseTab={() => {
                    props?.onCloseTab?.();
                    refreshTotals();
                  }} id={item.instanceId} openInTab
                /> : <Form openInTab formKey={ProbationEvaluationRequestFormNames.processDefKey} id={item.instanceId} />
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
                Object.values(advanceSearchVisible || {}).some((v) => v !== undefined && v !== null && v !== "")
                  ? <FilterOutlined style={{ color: "red" }} />
                  : <SelectOutlined />
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
                title: '#',
                flex: 1,
                width: 40, // adjust as needed
                render: (_: any, r: any, i: number) => (
                  <Space size={1} align="center">
                    {/* Row number */}
                    <span>{i + 1}</span>

                    <Button
                      size="small"
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={async () => {
                        window
                          .open(
                            `/external/data-form/${ProbationEvaluationRequestFormNames.processDefKey}/${r.instanceId}`,
                            '_blank'
                          )
                          ?.focus();
                      }}
                    />
                  </Space>
                ),
              },
              {
                title: 'Form No #',
                sorter: 'formNo',
                flex: 1,
                width: 180,
                actionProps:(item)=>({
                  type: "view",
                  label: item.formNo
                }),
                render: (_: any, r: any) => {
                  return (<Space size={1}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => quickViewHandler(r)}
                    />
                    <span  style={{ color: "#1677ff", cursor: "pointer" }}
                    onClick={() =>{
                      actionRef.current?.open?.({
                        actionRef:"view",
                        value: r.formNo || r.processInstaceId
                      })
                    }}
                    >
                      {r.formNo}
                    </span>
                  </Space>)
                },
              },
              {
                title: 'Employee No',
                dataIndex: 'empNo', sorter: 'empNo',
              },
              {
                title: 'Employee Name',
                // width: 180,
                dataIndex: 'empName', sorter: 'empName'
              },
              {
                title: 'Employee(KH)', sorter: 'internalName', render(_: any, r: any) {
                  return r.internalName
                },
              },
              { title: 'Position', dataIndex: 'jobTitle', sorter: 'jobTitle' },
              { title: 'Job Level', dataIndex: 'formTypeName', sorter: 'formTypeName' },
              { title: 'Business Unit', dataIndex: 'buName', sorter: 'buName' },
              { title: 'Function', dataIndex: 'departmentName', sorter: 'function' },
              { title: 'Modified By', sorter: 'lastModifiedBy', dataIndex: 'lastModifiedBy' },
              {
                title: 'Modified Date', sorter: 'lastModifiedDate', dataIndex: 'lastModifiedDate',
                render(_: any, r: any) {
                  return r.lastModifiedDate && formatDateTime(r.lastModifiedDate,'DD-MMM-YYYY')
                }
              },
              {
                title: 'Status', width: '100px', render: (_: any, r: any) => <><Status text={r.status} /></>
              },{
                title: 'Due Date', sorter: 'dueDate', dataIndex: 'dueDate',
                with: 210,
                render(_: any, r: any) {
                  return r.dueDate && formatDate(r.dueDate,'DD-MMM-YYYY')
                }
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
      <ProbationEvaluationQuickView
        refreshTable={refeshTable}
        probationEmp={appraisalEmp}
        open={modals.isVisible('QuickViewAppraisalForm')}
        onOpenModalChange={(v: any) => !v && modals.hideModal('QuickViewAppraisalForm')} />
      {modals.isVisible('CreateProbationForm') && <ProbationRequestModal
        open={modals.isVisible('CreateProbationForm')}
        onOpenChange={(v: any) => !v && modals.hideModal('CreateProbationForm')}
        refreshTable={refeshTable}
      />}
    </>
  );
}
