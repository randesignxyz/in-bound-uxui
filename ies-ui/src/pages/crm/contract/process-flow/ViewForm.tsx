import AttachmentList from '@/components/Attachment/AttachmentList';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import ActivityView from '@/pages/process-flow/components/forms/ActivityView';
import ViewFormWrapper from '@/pages/process-flow/components/forms/ViewFormWrapper';
import { DataViewProps } from '@/pages/process-flow/data';
import { EditOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Card, message, Modal, Spin, Tabs } from 'antd';
import { useEffect } from 'react';
import ContractEntryModal from '../components/ContractEntryModal';
import ContractInfo from '../components/ContractInfo';
import CustomerInfo from '../components/CustomerInfo';
import { Model } from '../model';

const ViewForm: React.FC<DataViewProps> = (props) => {
  const workflowModel = ProcessFlowModel();
  const { state, modals, actions } = Model(workflowModel);

  // useEffect(() => {
  //   try {
  //     workflowModel.actions.loadInstanceData(props.id, props.type || 'task');
  //   } catch (error) {
  //     message.error('Failed to load data');
  //   }
  // }, []);

  useEffect(() => {
    if (!workflowModel.state.instanceData) return;
    actions.loadData(workflowModel.state.instanceData.data?.id);
  }, [workflowModel.state.instanceData]);

  // const duration = moment.duration(moment(state.data?.detail?.expireDate).diff(moment(state.data?.detail?.effectiveDate)))

  return (
    <Spin spinning={state.loading}>
      <ViewFormWrapper<{ id: number }>
        workflowModel={workflowModel}
        payload={(data) => ({ from: 'contract', id: data?.data?.id })}
        moreActions={(data) => [
          ['customer_contract_sa_verify', 'originator_rework'].some(
            (it) => it == data?.task?.taskDefKey,
          ) &&
          !data?.task?.completed &&
          data?.task?.claimed &&
          props.type == 'task'
            ? {
                icon: <EditOutlined style={{ fontSize: '16px', color: '#08c' }} />,
                key: 'contract',
                name: 'Edit Contract',
                action: () => {
                  modals.showEditContract();
                },
              }
            : undefined,
          // ['customer_contract_sa_verify', 'originator_rework'].some(it => it == data?.task?.taskDefKey && data?.task.claimed) && !data?.task?.completed && props.type == 'task' ? {
          //     icon: <EditOutlined style={{ fontSize: '16px', color: '#08c' }} />, key: 'modifyContractDoc', name: 'Modify Contract Doc', action: () => {
          //         modals.showModal('modifyContractDoc')
          //     }
          // } : undefined,
          // {
          //     icon: <FilePdfOutlined style={{ fontSize: '16px', color: '#08c' }} />, key: 'viewRequestForm', name: 'View Request Form', action: () => {
          //         state.data?.detail?.id && actions.viewContractRequestForm(state.data.detail.id)
          //     }
          // },
          state.data?.detail?.contractDocPrepared
            ? {
                icon: <FilePdfOutlined style={{ fontSize: '16px', color: '#08c' }} />,
                key: 'viewContract',
                name: 'View Contract Doc',
                action: () => {
                  state.data?.detail?.id && actions.viewContractDoc(state.data.detail.id);
                },
              }
            : undefined,
        ]}
        workflowProp={props}
      >
        <Card size="small">
          <Tabs>
            <Tabs.TabPane tab="Customer" key="customer">
              <CustomerInfo data={state.data?.detail} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Contract" key="contract">
              <ContractInfo
                initalData={state.initialData}
                data={state.data?.detail}
                layoutConfig={state.layoutConfig}
              />
            </Tabs.TabPane>
            {/* <Tabs.TabPane tab="Term" key="term">
                    <TermView data={state.data?.detail} layoutConfig={state.layoutConfig} />
                </Tabs.TabPane> */}

            {[...(state.data?.detail?.attachmentFileIds || [])].length > 0 && (
              <Tabs.TabPane tab="Attachment Files" key="attachmentFile">
                <AttachmentList
                  fileIds={[...(state.data?.detail?.attachmentFileIds || [])]}
                  attachmentFiles={[]}
                />
              </Tabs.TabPane>
            )}
            <Tabs.TabPane tab="Activities" key="activities">
              <ActivityView
                activityList={workflowModel.state.instanceData?.activities.reverse() || []}
              />
              {/* <ProCard
                            headStyle={{ background: '#fafafa' }}
                            bodyStyle={{ backgroundColor: '#fafafa' }} >
                            <Timeline mode={'left'}>
                                {(workflowModel.state.instanceData?.activities.reverse() || []).map(it => (
                                    <Timeline.Item key={it.id}>
                                        {' '}
                                        <b>
                                            {it.taskName} : {it.action}
                                        </b>{' '}
                                        <br /> By {it.actionBy} on {formatDateTime(moment(it.actionDate))}{' '}
                                        {it.comment && (<p><CommentOutlined /> {it.comment} </p>)}
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </ProCard> */}
            </Tabs.TabPane>
          </Tabs>
        </Card>

        <ContractEntryModal
          open={modals.isVisible('editContract')}
          initData={state.initialData}
          layoutConfig={state.layoutConfig}
          data={state.data?.detail}
          actionHandlers={{
            onSave: (data) => {
              Modal.confirm({
                title: 'Update Contract',
                content: 'Are you sure?',
                onOk: async () => {
                  try {
                    await actions.saveContract(data);
                    modals.hideModal('editContract');
                    actions.loadData(state.data?.detail?.id || 0);
                  } catch (error) {
                    message.error('Failed to save.');
                  }
                },
              });
            },
            applyLayoutConfig: actions.applyLayoutConfig,
            enableIncentiveEntry: actions.enableIncentiveEntry,
            listSubContract: actions.listSubContract,
          }}
          onCancel={() => modals.hideModal('editContract')}
        />
      </ViewFormWrapper>
    </Spin>
  );
};
export default ViewForm;
