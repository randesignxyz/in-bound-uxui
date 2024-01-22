import ContributorFinder from "@/components/ContributorFinder"
import { IProcessWorkflowModel } from "@/models/process-flow/data"
import { ActionDataFormProps } from "../data"
import { ActionFormWrapper } from "../form-resources"
import DiagramModal, { DiagramModalProps } from "./diagram"
import UserDest, { UserDestProps } from "./UserDest"

export type ProcessFlowModalProps = {
    type: 'action';
    noAttachment?: true;
} & ActionDataFormProps | {
    type: 'diagram',
} & DiagramModalProps | {
    type: 'user-destination',

} & UserDestProps | {
    type: 'assign'
}

export const ProcessFlowModalWrapper: React.FC<ProcessFlowModalProps> = ({
    type, ...rest
    // isVisible, data, actionHandlers 
}) => {

    switch (type) {
        case 'action':
            return <ActionFormWrapper {...rest as ActionDataFormProps} />
        case 'diagram':
            return <DiagramModal  {...rest as DiagramModalProps} />
        case 'user-destination':
            return <UserDest {...rest as UserDestProps} />
        default:
            throw Error('Not supported')
    }
}


export const ProcessFlowModalMngt = ({ workflowModel: { state, actions, modals }, onRefresh } : {

    workflowModel: IProcessWorkflowModel,
    onRefresh?: () => void;
}) => {

    return (
        <div>
            {state.activityData && <ProcessFlowModalWrapper
                type='action'
                {...state.activityData}
                visible={modals.isVisible('Action')}
                loading={state.loading}
                activityData = {state.activityData}
                ProcessInstanceData = {state.instanceData}

                actionHandlers={{
                    onCancel: reloadRequired => {
                        modals.hideModal('Action')
                        reloadRequired && onRefresh?.()
                    },
                    onSetRequestor: actions.setRequestor,
                    onCompletedTask: async (payload, comment) => {
                       await actions.completeTask({payload:payload, comment:comment})
                       onRefresh?.()
                       return Promise.resolve()
                    },
                    onSetFiles: actions.onSetFiles,
                    // onRemoveFile: actions.removeFile,
                    onReset: () => {
                        actions.crearUploadFiles()
                    }

                }}
            />}

            <ProcessFlowModalWrapper
                type='diagram'
                loading = {state.loading}
                onShowUserDest = {taskId => actions.showUserDest(taskId)}
                diagramData={{
                    xml: state.diagramData?.bpmn20Xml,
                    status: state.diagramData?.status,
                    
                    drawing: {
                        activities: state.diagramData?.taskList.map(it => {
                            return {
                                taskId: it.taskId,
                                id: it.taskDefKey,
                                status: it.isActive ? 'current' : 'completed'
                            }
                        })
                    }
                }}
                visible={modals.isVisible('Diagram')}
                onCancel={() => modals.hideModal('Diagram')}
            />

            <ProcessFlowModalWrapper
                type='user-destination'
                visible={modals.isVisible('ShowUserDest')}
                onCancel={() => modals.hideModal('ShowUserDest')}
                data={state.userDestinationList}
            />
        </div>
    )
}

