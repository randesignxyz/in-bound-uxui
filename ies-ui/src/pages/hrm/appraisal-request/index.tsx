import React, { useRef, useState } from "react";
import { history, useAccess, useQuery } from "@umijs/max";
import {
  ExportOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import moment from "moment";

import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import { formatDateTime } from "@/pages/utils";
import { simpleRequestActions } from "@/services/model";
import { downloadReport } from "@/services/apiGateway";
import Detail from "./detail";

import {
  SavePayLoad,
  SearchParams,
  AppraisalRequestDetail,
  AppraisalRequestFormNames,
  AppraisalRequestListItem,
} from "./data.types";
import { createService } from "./services";
import AppraisalRequestForm from "./AppraisalRequestForm";
import { ActionType } from "@ant-design/pro-components";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import Form from '@/pages/process-flow/form';

export default function AppraisalRequestPage() {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const srv = createService(requestActions);

  const [downloading, setDownloading] = useState<{
    formNo: string;
    loading: boolean;
  }>();
  const [filter, setFilter] = useState<TableViewSearchParams<SearchParams>>({});
  const { data, isLoading, refetch } = useQuery(
    ["fetch-appraisal-request", filter],
    () => srv.fetchPaging(filter),
    { refetchOnWindowFocus: false }
  );
  const downloadHandler = async (rs: AppraisalRequestListItem) => {
    setDownloading({ formNo: rs.formNo, loading: true });

    await downloadReport<{ processInstId: string; processDefKey: string }>(
      requestActions
    )({
      reportName: "performance-review-request-process-by-inst-id",
      fileName: `performance-review-request_${rs.formNo}_${moment().format(
        "YYYYMMDD"
      )}`,
      type: "EXCEL",
      data: {
        processInstId: rs.processInstId,
        processDefKey: AppraisalRequestFormNames.processDefKey,
      },
    });
    setDownloading({ formNo: rs.formNo, loading: false });
  };
  return (
    <PageWrapper<
        AppraisalRequestListItem | AppraisalRequestDetail ,
        SearchParams,
        SavePayLoad
      >
      actionRef={actionRef}
      tabRender={(item) => [
        ...(access.canAccessNewAppraisalRequest
          ? [
            {
              action: "add",
              tabIcon: <PlusOutlined />,
              tabLabel: "New Request",
              panel: (props) => (
                <AppraisalRequestForm
                  {...props}
                  formKey={AppraisalRequestFormNames.processDefKey}
                  onOpenChange={() => props?.onCloseTab?.()}
                  onRefresh={refetch}
                />
              ),
            },
          ]
          : []),
        {
          action: "view",
          tabLabel: item?.formNo,
          panel: (props) => item?.formNo || item?.processInstId ?
            <Detail
              onCloseTab={() => {
                props?.onCloseTab?.()
                refetch()
              }} id={item.processInstId} type="EDIT" openInTab
            />: <Form openInTab formKey={AppraisalRequestFormNames.processDefKey} id={item?.processInstId}/>
        },
      ]}
      listView={{
        type: "Table",
        title: "List Appraisal Request",
        statuses: [
          { option: { label: "All", value: "ALL", default: true } },
          { option: { label: "Pending", value: "PENDING" } },
          { option: { label: "Completed", value: "COMPLETED" } },
          { option: { label: "Rejected", value: "REJECTED" } },
        ],
        onRefresh: refetch,
        onFilter:(params) => {
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
          rowKey: "processInstId",
          columns: [
            {
              title: "#",
              width: 60,
              render: (_, entity, index) => (
                <Space size={4}>
                  <span>{index + 1}</span>
                  <Button
                    size="small"
                    type="link"
                    icon={<ExportOutlined />}
                    onClick={() =>
                      window.open(
                        `/external/data-form/${AppraisalRequestFormNames.processDefKey}/${entity.processInstId}`,
                        "_blank"
                      )?.focus()
                    }
                  />
                </Space>
              ),
            },
            {
              title: "Form #",
              width: 160,
              sorter: true,
              actionProps: (item) => ({
                type: 'view',
                label: item.formNo,
              }),
              render: (_, entity) => (
                <Space size={4}>
                  <a
                    onClick={() =>
                      actionRef.current?.open?.({
                        action: "view",
                        value: entity,
                        tabLabel: entity.formNo,
                        key: entity.processInstId,
                      })
                    }
                  >
                    {entity.formNo}
                  </a>
                </Space>
              ),
            },
            { title: "Title", dataIndex: "title", sorter: true },
            {
              title: "Request Type",
              dataIndex: "requestTypeLabel",
              sorter: true,
            },
            {
              title: "Requested By",
              dataIndex: "requestedBy",
              sorter: true,
            },
            {
              title: 'Requested Date', sorter: 'requestedDate', render(_, entity) {
                return formatDateTime(entity.requestedDate)
              },
            },
            {
              title: "Status",
              render: (_, r) => <Status text={r.status} />,
            },
            {
              title: 'Action',
              render: (_, r) => <Tooltip title='Download Excel'>
                <Button type="link" loading={r.formNo == downloading?.formNo ? downloading.loading : false} size="small" onClick={() => downloadHandler(r)} icon={<FileExcelOutlined />} />
              </Tooltip>

            },
          ],
        },
      }}
    />
  );
}
