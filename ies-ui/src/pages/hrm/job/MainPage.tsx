import React, { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { JobInfoAdvanceSearchParams, ListJob } from "./data";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { JobServiceAPI } from "./services";
import { useAccess, useQuery } from "@umijs/max";
import DataEntryFormView from "./DataEntryFormView";
import { Button, Grid, Modal, Space } from "antd";
import type { TableViewSearchParams } from "@/components/DataCrud/TableView";

export function JobListPage() {
  const access = useAccess();
  const services = JobServiceAPI();

  const [filter, setFilter] = useState<TableViewSearchParams<JobInfoAdvanceSearchParams>>({
    criteria: { advanceSearch: { status: 'ALL' } }
  })
  const { data, isLoading, refetch } = useQuery(
    ["fetch-list-job", filter],
    () => services.listAll(filter),
    { refetchOnWindowFocus: false }
  );
  Grid.useBreakpoint();
  const [editRecord, setEditRecord] = useState<ListJob | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewRecord, setViewRecord] = useState<ListJob | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const handleDelete = async (record: ListJob) => {
    Modal.confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this job?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await services.deleteJob(record.id);
          Modal.info({ title: "Delete Status", content: res.message });
          refetch();
        } catch (err) {
          Modal.error({ title: "Delete failed", content: String(err) });
        }
      },
    });
  };
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditRecord(null);
    refetch();
  };
  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setViewRecord(null);
  };
  return (
    <div style={{ position: "relative" }}>
      <PageWrapper<ListJob, JobInfoAdvanceSearchParams, unknown>
        tabRender={(item) =>
          access.canAccessHrJOB
            ? [
              {
                action: "add",
                tabIcon: <FileOutlined />,
                tabLabel: "New Form",
                panel: (props) => <DataEntryFormView type="CREATE" onCloseTab={() => {
                  props?.onCloseTab?.();
                  refetch();
                }} />,
              },
              {
                action: "view",
                value: item?.jobNo || item?.id,
                tabLabel: item?.jobNo || `${item?.jobTitle} (${item?.jobNo})` || "Draft",
                panel: (props) => <DataEntryFormView id={item?.id} type="VIEW"
                                                     onCloseTab={() => props?.onCloseTab?.()} />,
              },
            ]
            : [
              {
                action: "view",
                value: item?.jobNo || item?.jobNo,
                tabLabel: item?.jobNo || `${item?.jobTitle} (${item?.jobNo})` || "Draft",
                panel: (props) => <DataEntryFormView id={item?.id} type="EDIT"
                                                     onCloseTab={() => props?.onCloseTab?.()} />,
              },
            ]
        }
        listView={{
          type: "Table",
          title: "Position List",
          statuses: [
            { option: { label: "All", value: "ALL", default: true } },
            { option: { label: "ACTIVE", value: "ACTIVE" } },
            { option: { label: "INACTIVE", value: "INACTIVE" } },
          ],
          onRefresh: refetch,
          onFilter: (params, page, sort) => {
            setFilter((p) => ({
              criteria: {
                ...p.criteria,
                ...filter.criteria,
                searchValue: params?.searchValue,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  status: params?.status
                },
                sort: sort || p.criteria?.sort || {},
              },
              pagination: page || p.pagination,
            }))
          },
          props: {
            dataSource: data?.items || [],
            pagination: {
              total: data?.total,
              current: filter.pagination?.current,
              pageSize: filter.pagination?.pageSize
            },
            loading: isLoading,
            scroll: { x: "max-content" },
            bordered: true,
            columns: [
              { align: "center", title: "#", width: 40, render: (_: any, __: any, index: number) => index + 1 },
              { title: "Job Title", width: 160, dataIndex: "jobTitle", sorter: true },
              { title: "Job Description", width: 200, dataIndex: "jobDescription", sorter: true },

              { title: "Created By", width: 130, dataIndex: "createdBy", sorter: true },
              {
                title: "Created Date",
                width: 130,
                dataIndex: "createdDate",
                sorter: true,
                valueType: "date"
              },

              { title: "Status", width: 100, dataIndex: "status", sorter: true },
              {
                align: "center",
                title: "Action",
                width: 100,
                fixed: "right",
                render: (_: any, record: ListJob) => (
                  <Space>
                    <Button icon={<EyeOutlined />} size="small" type="link" onClick={() => {
                      setViewRecord(record);
                      setViewModalVisible(true);
                    }} />
                    <Button icon={<EditOutlined />} size="small" type="link" onClick={() => {
                      setEditRecord(record);
                      setEditModalVisible(true);
                    }} />
                    <Button icon={<DeleteOutlined />} danger size="small" type="link" onClick={() => handleDelete(record)} />
                  </Space>
                ),
              },
            ],
          },
        }}
      />
      <Modal title={viewRecord ? `View: ${viewRecord.jobTitle}` : "View"} open={viewModalVisible} footer={null}
             width={900} onCancel={handleCloseViewModal} destroyOnClose>
        {viewRecord && <DataEntryFormView id={viewRecord.id} type="VIEW" onCloseTab={handleCloseViewModal} />}
      </Modal>
      <Modal title={editRecord ? `Edit: ${editRecord.jobTitle}` : "Edit"} open={editModalVisible} footer={null}
             width={900} onCancel={handleCloseEditModal} destroyOnClose>
        {editRecord && <DataEntryFormView id={editRecord.id} type="EDIT" onCloseTab={handleCloseEditModal} />}
      </Modal>
    </div>
  );
}
