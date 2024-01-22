
import { Card, message, Modal, Spin } from 'antd';
import styles from './style.less';
import DefaultFilterComp, { FilterItem } from '@/components/DefaultFilter';
import { history, } from 'umi';
import { UserTask } from '@/services/process-workflow/data';
import TaskItemListView from './components/TaskItemListView';
import { ProcessFlowModalMngt } from '../components/ProcessFlowModalWrapper';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { useRef, useState } from 'react';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { TaskListAdvanceSearchParams } from '@/services/process-workflow/params';
import { ActionType } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-components';
export default () => {

    const model = ProcessFlowModel()
    const { state, actions, } = model
    const actionRef = useRef<ActionType>();
    const detaultTaskStatus = (state.taskStatusFilterList || []).find(it => true)
    const [searchParams, setSearchParams] = useState<TaskListAdvanceSearchParams>({
        isGlobal: true,
        status: detaultTaskStatus?.id || '',
    })

    const extraContent = <DefaultFilterComp<FilterItem>
        items={state.taskStatusFilterList || []}
        isGlobal={true}
        selectedItem={state.taskStatusFilterList?.find(it => it.id == searchParams.status) || detaultTaskStatus}

        onSearch={data => {
            setSearchParams(v => ({ ...v, ...data }))
            actionRef.current?.reloadAndRest?.()
        }} />

    const handleGogoDataView = (item: UserTask, newTab?: boolean) => {
        if (newTab) {
            window.open(`/external/data-form/${item.taskDefKey}/${item.taskId}`, "_blank");
        } else
            history.push(`/data-form/${item.taskDefKey}/${item.taskId}`);
    };


    const onRequestHandler = async (
        params: TableViewSearchParams<TaskListAdvanceSearchParams>,
    ) => {
        try {
            return await actions.loadTaskList(params)
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.');
            return Promise.reject();
        }
    };

    return <PageContainer title={false} >
        <Spin spinning={state.loading}>
            <Card
                bodyStyle={{ backgroundColor: '#fafafa' }}
                className={styles.listCard}
                bordered={false}
                extra={extraContent}
            >
                <TaskItemListView data={state.taskList}
                    actionRef={actionRef}
                    actionHandlers={{
                        onGogoDataView: handleGogoDataView,
                        onShowActionModal: (key, task) => task.formKey && actions.openActionForm(
                            task.taskName, task.formKey,
                            key, task.instanceInfo.processInstanceId,
                            task.taskId
                        ),
                        onClaim: item => {
                            Modal.confirm({
                                title: "Claim Task",
                                content: "Are you sure?",
                                onOk: async () => {
                                    await actions.claim({ taskId: item.taskId, ori: 'taskList' })
                                    actionRef.current?.reloadAndRest?.()
                                }
                            })
                        },
                        onUnclaim: item => {
                            Modal.confirm({
                                title: "Unclaim Task",
                                content: "Are you sure?",
                                onOk: async () => {
                                    await actions.unClaim({ taskId: item.taskId, ori: 'taskList' })
                                    actionRef.current?.reloadAndRest?.()
                                }
                            })
                        },
                        onAssign: item => {

                        },
                        onRequest: (pagination, sort) => onRequestHandler({
                            criteria: {
                                ...searchParams,
                                advanceSearch: searchParams,
                                sort,
                            },
                            pagination,
                        }),
                        onShowAuthorizedTasksModal: item => actions.showUserDest(item.taskId),
                        onShowDiagram: item => actions.loadDiagram(item.instanceInfo.processInstanceId),
                        onDownload: item => actions.downloadForm(item.instanceInfo.processInstanceId, `${item.instanceInfo.processName}.pdf`)
                    }}
                />
            </Card>
            <ProcessFlowModalMngt onRefresh={actionRef.current?.reloadAndRest} workflowModel={model} />

        </Spin>
    </PageContainer>
}