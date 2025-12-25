import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { formatDate, toReadable } from "@/pages/utils"
import { Paging } from "@/services/API"
import { simpleRequestActions } from "@/services/model"
import { ActionType, PageContainer, ProTable } from "@ant-design/pro-components"
import { history, useAccess, useModel } from "@umijs/max"
import { Button, Flex, message, Radio, Tag } from "antd"
import { useRef, useState } from "react"
import { StaffRequisitionAdvanceSearchParams, StaffRequisitionRequest } from "../data"
import { EmployeeServices } from "../services"
import RequestModal from "./RequestModal"
import Status from "@/components/Status"
import { ExportOutlined } from "@ant-design/icons"
import PageWrapper from '@/components/PageWrapper';



const statusColor = (status: string) => {
  if (status == 'PENDING') {
    return 'processing'
  } else if (status == "CANCELED" || status == "REJECTED") {
    return "error"
  } else {
    return "success"
  }
}

export default () => {

  const [modalVisible, setModalVisible] = useState<{ newRequsistion?: boolean }>()
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const cacheList = useModel('dataList');
  const access = useAccess()
  const onCloseModalHandler = (visible?: boolean) => {
    !visible && setModalVisible({})
  }

  const [advanceSearchParams, setAdvanceSearchParams] = useState<StaffRequisitionAdvanceSearchParams>({
    status: 'ALL',
    integratedStatus: 'ALL',
    // acquiredDate: undefined,
    // requestedDate: undefined,
  });

  const onRequestHandler = async (
    params: TableViewSearchParams<StaffRequisitionAdvanceSearchParams>,
  ) => {
    try {

      return EmployeeServices.listStaffRequisition(params).query(requestActions).then((it) => {
        return cacheList.cacheDataList({
          type: 'staff-requisition',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<StaffRequisitionRequest>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
    <PageContainer title="Staff Requisition">
      <TableView<StaffRequisitionRequest, { searchValue?: string; advanceSearch?: StaffRequisitionAdvanceSearchParams }>
        actionHandlers={{
          onAdd: () => access.canRequestHrStaffRequisition ? setModalVisible({ newRequsistion: true }) : message.warning("Request is not allowed, No permission."),
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
        }}
        extraFilter={<Radio.Group onChange={(e) => {
          setAdvanceSearchParams(v => ({ ...v, status: e.target.value }))
          actionRef.current?.reloadAndRest?.()
        }} defaultValue="ALL">
          <Radio.Button value="ALL">All</Radio.Button>
          <Radio.Button value="PENDING">Pending</Radio.Button>
          <Radio.Button value="COMPLETED">Completed</Radio.Button>
          <Radio.Button value="REJECTED">Rejected</Radio.Button>
          <Radio.Button value="CANCELED">Canceled</Radio.Button>
        </Radio.Group >}
        tableProps={{
          actionRef: actionRef,
        }}
        addButtonLabel="New Request"
        columns={[
          {
            title: 'Form #', width: 150, render: (_, r) => (
              <Flex gap={5}><Button
                size="small"
                type="link"
                title="Open in new tab"
                icon={<ExportOutlined />}
                onClick={() => {
                  window
                    .open(
                      `/external/data-form/staff_requisition_request_process/${r.instanceId}`,
                    )
                    ?.focus();
                }}
              />
                <a
                  onClick={() =>
                    history.push(`/data-form/staff_requisition_request_process/${r.instanceId}`)
                  }
                >
                  {r.formNo}
                </a>
              </Flex>

            ),
            sorter: 'formNo'
          },
          { title: 'Requested By', dataIndex: 'requester', sorter: 'requestedBy', },
          { title: 'Requested Date', sorter: 'requestedDate', align: 'right', render: (_, r) => formatDate(r.requestedDate) },
          { title: 'Position Hired', sorter: 'positionHired', render: (_, r) => r.positionHired.name },
          { title: 'BU', sorter: 'bu', render: (_, r) => r.bu.name },
          { title: 'Function', sorter: 'function', render: (_, r) => [r.department.name, r.subDepartment?.name].filter(it => it).join(", ") },
          { title: 'Req. Type', sorter: "requisitionType", render: (_, r) => r.requisitionType.name },
          { title: 'Preferred start date', sorter: 'preferredStartDate', align: 'right', render: (_, r) => formatDate(r.expectedJoinDate) },
          { title: 'status', render: (_, r) => <Status text={r.status} /> }
        ]}
      />
      {modalVisible?.newRequsistion && <RequestModal open={true}
                                                     onRefresh={() => actionRef.current?.reloadAndRest?.()}
                                                     onOpenChange={onCloseModalHandler}
                                                     width="1000px"
      />}

    </PageContainer>
  )
}
