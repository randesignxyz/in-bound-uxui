import React, { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { AppraisalRequestDetail, AppraisalRequestListItem, SearchParams, AppraisalRequestFormNames } from "./data.types";
import { createService } from "./services";
import { simpleRequestActions } from "@/services/model";
import { useAccess, useQuery } from '@umijs/max';
import Status from "@/components/Status";
import AppraisalRequestForm from "./AppraisalRequestForm";
import { Button, Modal, Space, Tooltip } from "antd";
import { ExportOutlined, FileExcelOutlined } from "@ant-design/icons";
import { formatDateTime } from "@/pages/utils";
import moment from "moment";
import { downloadReport } from "@/services/apiGateway";

export default function AppraisalRequestPage() {
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);
  const access = useAccess();
  const { data, isLoading, refetch } = useQuery(
    ['fetch-appraisal-request', filter],
    () => services.fetchPaging({ criteria: filter, pagination: { current: 1, pageSize: 20 } }),
    { refetchOnWindowFocus: false }
  );

  const [filter, setFilter] = useState<SearchParams>({ status: "ALL" });
  const [viewRecord, setViewRecord] = useState<AppraisalRequestListItem | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<AppraisalRequestListItem | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [downloading, setDownloading] = useState<{ formNo: string; loading: boolean } | null>(null);

  const handleDownload = async (record: AppraisalRequestListItem) => {
    setDownloading({ formNo: record.formNo, loading: true });
    await downloadReport<{ processInstId: string; processDefKey: string }>(requestActions)({
      reportName: "performance-review-request-process-by-inst-id",
      fileName: `performance-review-request_${record.formNo}_${moment().format("YYYY-MM-DD")}`,
      type: "EXCEL",
      data: {
        processInstId: record.processInstId,
        processDefKey: "performance_review_request_process",
      },
    });
    setDownloading({ formNo: record.formNo, loading: false });
  };

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setViewRecord(null);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditRecord(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      <PageWrapper<AppraisalRequestListItem, SearchParams, unknown>
        tabRender={(item) =>
          access.canAccessNewAppraisalRequest
            ? [
                {
                  action: 'add',
                  tabLabel: 'New Request',
                  panel: (props) => (
                    <AppraisalRequestForm
                      {...props}
                      formKey={AppraisalRequestFormNames.processDefKey}
                      onClose={() => props?.onCloseTab?.()}
                    />
                  ),
                },
                {
                  action: 'view',
                  value: item?.formNo,
                  tabLabel: item?.formNo,
                  panel: (props) => (
                    <AppraisalRequestForm
                      id={item?.processInstId}
                      type="VIEW"
                      formKey={AppraisalRequestFormNames.processDefKey}
                      onCloseTab={() => props?.onCloseTab?.()}
                    />
                  ),
                },
              ]
            : [
                {
                  action: 'view',
                  value: item?.formNo,
                  tabLabel: item?.formNo,
                  panel: (props) => (
                    <AppraisalRequestForm
                      id={item?.processInstId}
                      type="EDIT"
                      formKey={AppraisalRequestFormNames.processDefKey}
                      onCloseTab={() => props?.onCloseTab?.()}
                    />
                  ),
                },
              ]
        }
        listView={{
          type: 'Table',
          title: 'Annual Performance Appraisal Request List',
          statuses: [
            { option: { label: 'All', value: 'ALL', default: true } },
            { option: { label: 'Pending', value: 'PENDING' } },
            { option: { label: 'Completed', value: 'COMPLETED' } },
            { option: { label: 'Rejected', value: 'REJECTED' } },
          ],
          onRefresh: () => {}, // implement refetch if using useQuery
          onFilter: (params) => setFilter((p) => ({ ...p, ...params })),
          props: {
            dataSource: data?.items || [], // replace with data from API/useQuery
            loading: isLoading, // replace with loading state from API/useQuery
            scroll: { x: 'max-content' },
            bordered: true,
            columns: [
              {
                title: 'Form #',
                width: 140,
                sorter: 'formNo',
                render: (_, record) => (
                  <Space size={1}>
                    <Button
                      size="small"
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        window
                          .open(
                            `/external/data-form/${AppraisalRequestFormNames.processDefKey}/${record.processInstId}`,
                            '_blank',
                          )
                          ?.focus()
                      }
                    />
                    <a onClick={() => setViewRecord(record) && setViewModalVisible(true)}>
                      {record.formNo}
                    </a>
                  </Space>
                ),
              },
              { title: 'Title', sorter: 'title', dataIndex: 'title' },
              { title: 'Request Type', sorter: 'requestTypeLabel', dataIndex: 'requestTypeLabel' },
              { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
              {
                title: 'Requested Date',
                sorter: 'requestedDate',
                render: (_, r) => formatDateTime(r.requestedDate),
              },
              { title: 'Status', render: (_, r) => <Status text={r.status} /> },
              {
                title: 'Action',
                render: (_, r) => (
                  <Tooltip title="Download Excel">
                    <Button
                      type="link"
                      size="small"
                      loading={r.formNo === downloading?.formNo ? downloading.loading : false}
                      onClick={() => handleDownload(r)}
                      icon={<FileExcelOutlined />}
                    />
                  </Tooltip>
                ),
              },
            ],
          },
        }}
      />

      <Modal
        title={viewRecord ? `View: ${viewRecord.formNo}` : 'View'}
        open={viewModalVisible}
        footer={null}
        width={900}
        onCancel={handleCloseViewModal}
        destroyOnClose
      >
        {viewRecord && (
          <AppraisalRequestForm
            id={viewRecord.processInstId}
            type="VIEW"
            formKey={AppraisalRequestFormNames.processDefKey}
            onCloseTab={handleCloseViewModal}
          />
        )}
      </Modal>

      <Modal
        title={editRecord ? `Edit: ${editRecord.formNo}` : 'Edit'}
        open={editModalVisible}
        footer={null}
        width={900}
        onCancel={handleCloseEditModal}
        destroyOnClose
      >
        {editRecord && (
          <AppraisalRequestForm
            id={editRecord.processInstId}
            type="EDIT"
            formKey={AppraisalRequestFormNames.processDefKey}
            onCloseTab={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
}
