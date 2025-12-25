import BaseCrud from "@/components/base-crud"
import { history } from "@umijs/max";
import { SavePayLoad, SearchParams, AppraisalRequestDetail, AppraisalRequestFormNames, AppraisalRequestListItem } from "./data.types"
import { createService } from "./services"
import { simpleRequestActions } from "@/services/model"
import { ExportOutlined, FileExcelOutlined, PlusOutlined } from "@ant-design/icons";
import { formatDateTime } from "@/pages/utils";
import { useAccess } from "@umijs/max";
import Status from "@/components/Status";
import AppraisalRequestForm from "./AppraisalRequestForm";
import { Button, Space, Tooltip } from "antd";
import moment from "moment";
import { downloadReport } from "@/services/apiGateway";
import { useState } from "react";

export default () => {

  const requestActions = simpleRequestActions();
  const srv = createService(requestActions)
  const access = useAccess()
  const [downloading, setDownLoading] = useState<{ formNo: string, loading: boolean }>()

  const downloadHandler = async (rs: AppraisalRequestListItem) => {
    setDownLoading({ formNo: rs.formNo, loading: true })
    await downloadReport<{ processInstId: string; processDefKey: string; }>(requestActions)({
      reportName: 'performance-review-request-process-by-inst-id',
      fileName: `${'performance-review-request-process-by-form-no'}_${rs.formNo}_${moment().toDate().toDateString()}`,
      type: 'EXCEL',
      data: {
        processInstId: rs.processInstId,
        processDefKey: 'performance_review_request_process'
      }
    })
    setDownLoading({ formNo: rs.formNo, loading: false })
  }
  return <BaseCrud<AppraisalRequestListItem, AppraisalRequestDetail, SearchParams, SavePayLoad >
    services={srv}
    listView={{
      columns: () => [
        {
          title: 'Form #',
          width: '140px',
          sorter: 'formNo',
          render(_, entity) {
            return <Space size={1}>
              <Button
                size="small"
                type="link"
                icon={<ExportOutlined />}
                onClick={async () => {
                  window.open(`/external/data-form/${AppraisalRequestFormNames.processDefKey}/${entity.processInstId}`, '_blank')?.focus();
                }}
              />
              <a onClick={() => { history.push(`/data-form/${AppraisalRequestFormNames.processDefKey}/${entity.processInstId}`) }}>{entity.formNo}</a>
            </Space>
          },
        },
        { title: 'Title', sorter: 'title', dataIndex: 'title' },
        { title: 'Request Type', sorter: 'requestTypeLabel', dataIndex: 'requestTypeLabel' },
        { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
        {
          title: 'Requested Date', sorter: 'requestedDate', render(_, entity) {
            return formatDateTime(entity.requestedDate)
          },
        },

        { title: 'Status', render: (_, r) => <Status text={r.status} /> },
        {
          title: 'Action',
          render: (_, r) => <Tooltip title='Download Excel'>
            <Button type="link" loading={r.formNo === downloading?.formNo ? downloading.loading : false} size="small" onClick={() => downloadHandler(r)} icon={<FileExcelOutlined />} />
          </Tooltip>

        },
      ],
      quickSearch: true,
      addNewAction: access.canAccessNewAppraisalRequest ? {
        label: 'New Request',
        icon: <PlusOutlined />,
        key: 'new-request',
        onRenderComp(props) {
          return <AppraisalRequestForm   {...props} formKey={AppraisalRequestFormNames.processDefKey} />
        },
      } : undefined,

      statusProps: {
        defaultValue: "ALL",
        options: [
          { label: "All", value: "ALL" },
          { label: "Pending", value: "PENDING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Rejected", value: "REJECTED" },
        ]
      },
      subStatusProps: undefined,
      onBeforeSearch: undefined
    }} title={"Annual Performance Appraisal Request List"}

  />
}
