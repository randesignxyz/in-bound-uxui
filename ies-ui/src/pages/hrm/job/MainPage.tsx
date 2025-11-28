import React, { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { JobInfoAdvanceSearchParams, ListJob } from "./data";
import {
  ExportOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { formatDate, toReadable } from "@/pages/utils";
import { JobServiceAPI } from "./services";
import { useAccess, useQuery } from "@umijs/max";
import DataEntryFormView from "./DataEntryFormView";
import { Badge, Button, Card, Descriptions, Grid, Radio, Modal, Space } from "antd";
import type { TableViewSearchParams } from "@/components/DataCrud/TableView";

export const openPR = () =>
  window.open(`/hrm/job/list`, "_blank")?.focus();

export default function JobListPage() {
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

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [selectedItem, setSelectedItem] = useState<ListJob | null>(null);
  const [editRecord, setEditRecord] = useState<ListJob | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewRecord, setViewRecord] = useState<ListJob | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const getColorStatus = (status?: string) => {
    if (["ACTIVE", "SUBMITTED"].includes((status || "").toUpperCase())) return "#1677ff";
    if (["INACTIVE"].includes((status || "").toUpperCase())) return "red";
    return undefined;
  };

  const handleDelete = (record: ListJob) => {
    Modal.confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this job?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await services.deleteJob(record.id);
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

  const handleStatusChange = (status: "ALL" | "ACTIVE" | "INACTIVE") => {
    setFilter((prev): TableViewSearchParams<JobInfoAdvanceSearchParams> => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        advanceSearch: { ...prev.criteria?.advanceSearch, subStatus },
      },
      pagination: { ...prev.pagination, current: 1 },
    }));
    refetch();
  };

  return (
    <div style={{ position: "relative" }}>
      {isMobile ? (
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          {!selectedItem ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", width: "100%" }}>
              <h3 style={{ color: "#b69901" }}>360 Degree Feedback List</h3>

              <Radio.Group value={filter.criteria?.advanceSearch?.status} size="middle" onChange={(v) => handleStatusChange(v.target.value)}>
                <Radio.Button value="ALL">All</Radio.Button>
                <Radio.Button value="ACTIVE">ACTIVE</Radio.Button>
                <Radio.Button value="INACTIVE">INACTIVE</Radio.Button>
              </Radio.Group>

              {data?.items?.map((item) => (
                <Card key={item.id} style={{ width: "100%" }}>
                  <p>
                    <span style={{ color: "#1677ff", cursor: "pointer" }} onClick={() => setSelectedItem(item)}>
                      {item.jobTitle || "n/a"}
                    </span>
                    <span style={{ float: "right" }}>
                      {item.status && (
                        <Badge
                          style={{ height: 28, paddingTop: 4, paddingLeft: 10, paddingRight: 10, backgroundColor: getColorStatus(item.status) }}
                          count={toReadable(item.status)}
                        />
                      )}
                    </span>
                  </p>

                  <Descriptions layout="vertical" size="small" column={2}>
                    <Descriptions.Item label="Business Unit">{item.jobDescription || "n/a"}</Descriptions.Item>
                    <Descriptions.Item label="Function">{item.description || "n/a"}</Descriptions.Item>
                  </Descriptions>

                  <p>
                    <strong>Status:</strong> {item.status || "n/a"}
                  </p>
                  <p>
                    <strong>Created By:</strong> {item.createdBy || "n/a"}
                  </p>
                  <p>
                    <strong>Created Date:</strong> {item.createdDate ? formatDate(item.createdDate, "DD-MM-YYYY") : "n/a"}
                  </p>
                  <p>
                    <strong>Last Modified By:</strong> {item.lastModifiedBy || "n/a"}
                  </p>
                  <p>
                    <strong>Last Modified Date:</strong> {item.lastModifiedDate ? formatDate(item.lastModifiedDate, "DD-MM-YYYY") : "n/a"}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ width: "800px", maxWidth: "100%" }}>
              <DataEntryFormView type={selectedItem.id ? "EDIT" : "CREATE"} id={selectedItem.id} onCloseTab={() => { setSelectedItem(null); refetch(); }} />
            </div>
          )}
        </div>
      ) : (
        <PageWrapper<ListJob, JobInfoAdvanceSearchParams, unknown>
          tabRender={(item) =>
            access.canAccessHrEmployeeMenuItem
              ? [
                {
                  action: "add",
                  tabIcon: <FileOutlined />,
                  tabLabel: "New Form",
                  panel: (props) => <DataEntryFormView type="CREATE" onCloseTab={() => { props?.onCloseTab?.(); refetch(); }} />,
                },
                {
                  action: "view",
                  value: item?.formNo || item?.id,
                  tabLabel: item?.formNo || `${item?.jobTitle} (${item?.jobNo})` || "Draft",
                  panel: (props) => <DataEntryFormView id={item?.id} type="VIEW" onCloseTab={() => props?.onCloseTab?.()} />,
                },
              ]
              : [
                {
                  action: "view",
                  value: item?.formNo || item?.jobNo,
                  tabLabel: item?.formNo || `${item?.jobTitle} (${item?.jobNo})` || "Draft",
                  panel: (props) => <DataEntryFormView id={item?.id} type="EDIT" onCloseTab={() => props?.onCloseTab?.()} />,
                },
              ]
          }
          listView={{
            type: "Table",
            title: "Job Description List",
            statuses: [
              { option: { label: "All", value: "ALL", default: true } },
              { option: { label: "ACTIVE", value: "ACTIVE" } },
              { option: { label: "INACTIVE", value: "INACTIVE" } },
            ],
            onRefresh: refetch,
            onFilter: (params)=>{
              setFilter((p)=>({
                criteria:{
                  ...p.criteria,
                  ...filter.criteria,
                  searchValue:params?.searchValue,
                  advanceSearch:{
                    ...p.criteria?.advanceSearch,
                    status:params?.status
                  },
                }
              }))
            },
            props: {
              dataSource: data?.items || [],
              pagination: { total: data?.total, current: filter.pagination?.current, pageSize: filter.pagination?.pageSize },
              loading: isLoading,
              scroll: { x: "max-content" },
              bordered: true,

              actionButtonsColumnRender: (item) => [
                {
                  tooltip: "View data in new browser tab",
                  type: "link",
                  size: "small",
                  icon: <ExportOutlined />,
                  onClick: () => openPR(item.id),
                },
              ],
              columns: [
                {  title: "#", width: 40, render: (_: any, __: any, index: number) => index + 1 },
                {  title: "Job Title", width: 160, dataIndex: "jobTitle", sorter: true },
                {  title: "Job Description", width: 200, dataIndex: "jobDescription", sorter: true },
                // { align: "center", title: "Description", width: 200, dataIndex: "description", sorter: true },
                {  title: "Status", width: 100, dataIndex: "status", sorter: true },
                { title: "Created By", width: 130, dataIndex: "createdBy", sorter: true },
                {

                  title: "Created Date",
                  width: 130,
                  dataIndex: "createdDate",
                  sorter: true,
                  valueType:"date"
                  // render: (_: any, r: ListJob) =>
                  //   r.createdDate ? r.createdDate?.format("DD-MM-YYYY") : "",
                },
                {

                  title: "Modified By",
                  width: 130,
                  dataIndex: "lastModifiedBy",
                  sorter: true,
                },
                {

                  title: "Modified Date",
                  width: 100,
                  dataIndex: "lastModifiedDate",
                  sorter: true,
                  valueType:"date"
                  // render: (_: any, r: ListJob) =>
                  //   r.lastModifiedDate ? r.lastModifiedDate?.format("DD-MM-YYYY") : "",
                },
                {

                  title: "Action",
                  width: 100,
                  fixed: "right",
                  render: (_: any, record: ListJob) => (
                    <Space>
                      <Button icon={<EyeOutlined />} size="small" onClick={() => { setViewRecord(record); setViewModalVisible(true); }} />
                      <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => { setEditRecord(record); setEditModalVisible(true); }} />
                      <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDelete(record)} />
                    </Space>
                  ),
                },
              ],
            },

          }}
        />
      )}
      {/* VIEW MODAL */}
      <Modal title={viewRecord ? `View: ${viewRecord.jobTitle}` : "View"} open={viewModalVisible} footer={null} width={900} onCancel={handleCloseViewModal} destroyOnClose>
        {viewRecord && <DataEntryFormView id={viewRecord.id} type="VIEW" onCloseTab={handleCloseViewModal} />}
      </Modal>

      {/* EDIT MODAL */}
      <Modal title={editRecord ? `Edit: ${editRecord.jobTitle}` : "Edit"} open={editModalVisible} footer={null} width={900} onCancel={handleCloseEditModal} destroyOnClose>
        {editRecord && <DataEntryFormView id={editRecord.id} type="EDIT" onCloseTab={handleCloseEditModal} />}
      </Modal>
    </div>
  );
}
