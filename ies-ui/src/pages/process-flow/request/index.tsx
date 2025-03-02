import workflowIcon from '@/assets/workflow.png';
import { FMANewStaffFormNames } from '@/pages/fma/new-staff/data.types';
import FMANewStaffRequestForm from '@/pages/fma/new-staff/FMANewStaffRequestForm';
import { StaffProposalFormNames, StaffProposalOFLFormNames } from '@/pages/hrm/staff-proposal/data.types';
import StaffProposalRequestForm from '@/pages/hrm/staff-proposal/StaffProposalRequestForm';
import { StaffRequisitionFormNames, StaffRequisitionOFLFormNames } from '@/pages/hrm/staff-requisition/process-flow/data';
import RequestModal from '@/pages/hrm/staff-requisition/RequestModal';
import AnalystIncidentTicketModal from '@/pages/ict/incident/AnalystIncidentTicketModal';
import { IncidentFormNames } from '@/pages/ict/incident/data.type';
import { ITRequestFormNames } from '@/pages/ict/it-request/data.types';
import RequestForm from '@/pages/ict/it-request/RequestForm';
import { ITNewStaffFormNames } from '@/pages/ict/new-staff/data.types';
import ItNewStaffRequestForm from '@/pages/ict/new-staff/ItNewStaffRequestForm';
import { PoRequestFormNames } from '@/pages/pro/po/data';
import { PriceComparisonFormNames } from '@/pages/pro/price-comparison/process-flow/data';
import { simpleRequestActions } from '@/services/model';
import { WorkflowServiceAPI } from '@/services/process-workflow/services';
import { PlayCircleTwoTone } from '@ant-design/icons';
import { PageContainer, ProList } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, Input, message, Select, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { history } from "@umijs/max";
import { ProcessRequestItem } from './data.type';
import { StockRequestFormNames } from '@/pages/fma-stock/request/process-flow';
import { TransferRequestFormNames } from '@/pages/fma-stock/transfer/process-flow';
import { AdjustmentRequestFormNames } from '@/pages/fma-stock/adjustment/process-flow';
import { ProbationEvaluationRequestFormNames, ProbationEvaluationRequestOFLFormNames } from '@/pages/hrm/probation/process-flow';
import ProbationRequestModal from '@/pages/hrm/probation/ProbationRequestModal';

export default () => {
  const [data, setData] = useState<ProcessRequestItem[]>([]);
  const [filterData, setFilterData] = useState<ProcessRequestItem[]>([]);
  const requestActions = simpleRequestActions();
  const [filter, setFilter] = useState<{ departments: string[]; searchValue?: string }>({
    departments: [],
  });
  const workflowServices = WorkflowServiceAPI(requestActions);
  const access = useAccess();
  const [modalVisible, setModalVisible] = useState<{
    type?: string;
  }>();

  const onCloseModalHandler = (visible?: boolean) => !visible && setModalVisible({});

  const requestAccess = (key: string) => {
    if (key == ITRequestFormNames.processDefKey && access.canRequestITRequest) return true;
    if (key == ITRequestFormNames.processDefKey && access.canCreatePR) return true;
    if (key == ITNewStaffFormNames.processDefKey && access.canRequestITNewStaffRequest) return true;
    if (key == FMANewStaffFormNames.processDefKey && access.canRequestFMANewStaffRequest)
      return true;

    if ((key == StaffRequisitionFormNames.processDefKey|| key == StaffRequisitionOFLFormNames.processDefKey) && access.canRequestHrStaffRequisition)
      return true;
    if ((key == StaffProposalFormNames.processDefKey || key == StaffProposalOFLFormNames.processDefKey) && access.canRequestHrStaffProposal)
      return true;
    if (key == IncidentFormNames.processDefKey && access.canCreateIncidentTicket) return true;
    if (key == 'requisition_request_process' && access.canCreatePR) return true;
    if (key == PriceComparisonFormNames.processDefKey && access.canAccessProQCMenuItem) return true;
    if (key == PoRequestFormNames.processDefKey && access.canAccessProPOMenuItem) return true;   
    if (key == StockRequestFormNames.processDefKey && access.canCreateNCMRequest) return true;
    if (key == TransferRequestFormNames.processDefKey && access.canCreateInventoryTransferRequest) return true;
    if (key == AdjustmentRequestFormNames.processDefKey && access.canCreateInventoryAdjRequest) return true;
    if ((key == ProbationEvaluationRequestFormNames.processDefKey || key == ProbationEvaluationRequestOFLFormNames.processDefKey)&& access.canCreateHrProbationEvaluationRequest) return true;

    return false;
  };
  const onRequestHandler = (data: ProcessRequestItem) => {
    if (!requestAccess(data.key)) {
      message.warning('Request is not allowed');
      return;
    }

    if (data.startFormInNewPage) {
      if (!data.path) {
        message.error('Route path is not configured. Please contace for system support.');
        return;
      }
      history.push(`${data.path}/create`);
      setModalVisible({});
    } else {
      setModalVisible({ type: data.key });
    }
  };

  useEffect(() => {
    (async () => {
      const rs = await workflowServices.listAvailableProcessDef();
      const itemList = rs.map(
        (it) =>
        ({
          id: it.id,
          requestName: it.name,
          shortName: it.shortName,
          key: it.key,
          departments: it.departmentList.map((it) => it.name),
          bu: it.companyList.map((it) => it.name),
          tag: [],
          path: `${it.urlPath}`,
          description: it.description,
          startFormInNewPage: it.startFormInNewPage,
          liveDate: it.liveDate,
          announcementDays: it.announcementDays,
        } as ProcessRequestItem),
      );
      setData(itemList);
      setFilterData(itemList);
    })();
  }, []);

  useEffect(() => {
    setFilterData(
      data
        .filter((it) =>
          it.departments.some(
            (it1) => filter.departments.length == 0 || filter.departments?.includes(it1),
          ),
        )
        .filter(
          (it) =>
            (filter.searchValue || '').trim().length == 0 ||
            it.requestName
              .toLowerCase()
              .includes((filter.searchValue?.toLowerCase() || '').trim()) ||
            it.shortName.toLowerCase().includes((filter.searchValue?.toLowerCase() || '').trim()),
        ),
    );
  }, [filter, data]);

  return (
    <PageContainer title={false}>
      <ProList<ProcessRequestItem>
        showActions="hover"
        loading={requestActions.request?.loading}
        metas={{
          avatar: {
            render: () => <img height="40px" alt="" src={workflowIcon} />,
          },
          title: {
            render: (_, r) => (
              <a onClick={() => r.path && history.push(`${r.path}/list`)}> {r.requestName} </a>
            ),
          },
          subTitle: {
            render: (_, r) => [
              ...r.bu.map((it) => (
                <Tag key={`bu-${it}`} color="processing">
                  {it}
                </Tag>
              )),
              ...r.departments.map((it) => (
                <Tag key={`dep-${it}`} color="#2db7f5">
                  {it}
                </Tag>
              )),
            ],
          },
          description: {
            render: (_, r) => r.description,
          },
          actions: {
            render(_, r) {
              return (
                <Button
                  type="link"
                  onClick={() => onRequestHandler(r)}
                  icon={<PlayCircleTwoTone />}
                >
                  Request
                </Button>
              );
            },
          },
        }}
        rowKey="id"
        toolbar={{
          search: (
            <Space>
              {' '}
              <Select
                mode="multiple"
                placeholder="select function"
                showSearch
                allowClear
                onChange={(values) => setFilter((v) => ({ ...v, departments: values }))}
                style={{ width: '300px' }}
                options={[
                  { label: 'ICT', value: 'ICT' },
                  { label: 'PRO', value: 'PRO' },
                  { label: 'HRM', value: 'HRM' },
                  { label: 'SAL', value: 'SAL' },
                ]}
              />{' '}
              <Input.Search
                allowClear
                onSearch={(value) => setFilter((v) => ({ ...v, searchValue: value }))}
                style={{ width: '300px' }}
                placeholder="Search for process name"
              />{' '}
            </Space>
          ),
        }}
        dataSource={filterData}
      />
      {(() => {
        if (modalVisible?.type == StaffRequisitionFormNames.processDefKey || modalVisible?.type == StaffRequisitionOFLFormNames.processDefKey) {
          return <RequestModal open={true} onOpenChange={onCloseModalHandler} width="1000px" />;
        } if (modalVisible?.type == ProbationEvaluationRequestFormNames.processDefKey || modalVisible?.type == ProbationEvaluationRequestOFLFormNames.processDefKey) {
          return <ProbationRequestModal open={true} onOpenChange={onCloseModalHandler} width="1000px" />;
        } else if (modalVisible?.type == ITRequestFormNames.processDefKey) {
          return (
            <RequestForm
              formKey={ITRequestFormNames.processDefKey}
              visisble={true}
              onClose={onCloseModalHandler}
            />
          );
        } else if (modalVisible?.type == IncidentFormNames.processDefKey) {
          return (
            <AnalystIncidentTicketModal
              title="Incident Ticket"
              open={true}
              onCancel={() => {
                onCloseModalHandler(false);
                // actionRef.current?.reloadAndRest?.();
              }}
              isAnalyst={false}
              actionType={'CREATE'}
            />
          );
        } else if (modalVisible?.type == FMANewStaffFormNames.processDefKey) {
          return (
            <FMANewStaffRequestForm
              formKey={FMANewStaffFormNames.processDefKey}
              visisble={true}
              onClose={() => onCloseModalHandler(false)}
            />
          );
        } else if (modalVisible?.type == ITNewStaffFormNames.processDefKey) {
          return (
            <ItNewStaffRequestForm
              formKey={ITNewStaffFormNames.processDefKey}
              visisble={true}
              onClose={() => onCloseModalHandler(false)}
            />
          );
        } else if (modalVisible?.type == StaffProposalFormNames.processDefKey || modalVisible?.type == StaffProposalOFLFormNames.processDefKey) {
          return (
            <StaffProposalRequestForm
              formKey={modalVisible?.type}
              visisble={true}
              onClose={() => onCloseModalHandler(false)}
            />
          );
        } else {
          modalVisible?.type && message.warning(`No start form available for ${modalVisible.type}`);
        }
      })()}
    </PageContainer>
  );
};
