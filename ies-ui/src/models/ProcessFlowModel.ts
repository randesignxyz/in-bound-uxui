import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { Pagination } from "@/services/API"
import { ContractTermData } from "@/services/crm/data"
import { commmonActions } from "@/services/model"
import { ConfigEndEventParams, SaveFirstLevelApproval, SaveWorkflowOriginator, UserResult } from "@/services/process-workflow/data"
import { TaskListAdvanceSearchParams } from "@/services/process-workflow/params"
import { WorkflowServiceAPI } from "@/services/process-workflow/services"
import { message } from "antd"
import { UploadFile } from "antd/lib/upload/interface"
import { useReducer } from "react"
import { useModel } from "umi"
import { InstanceSearchParams, InstanceStateFilter, IProcessWorkflowModel, State, TaskStatusFilter } from "./process-flow/data"
import { reducer } from "./process-flow/reducer"

export default () => {

    const { initialState } = useModel('@@initialState')
    const initState: State = {
        loading: false,
        instStatusFilterList: InstanceStateFilter,
        taskStatusFilterList: TaskStatusFilter
    }

    const [state, dispatch] = useReducer(reducer(), initState)
    const actions = commmonActions(dispatch, state)
    const requestActions = actions.requestActions()
    const workflowServices = WorkflowServiceAPI(requestActions)

    /*** Methods */
    const loadInitData = async () => {
        if (initialState?.currentUser?.login) {
            await setRequestor(initialState.currentUser.login)
        }
    }

    const setRequestor = async (userId?: string) => {
        try {
            if (userId) {
                const user = await workflowServices.findUser({ id: userId })
                user && dispatch({ type: 'setRequestUser', payload: user })

            } else {
                const user = initialState?.currentUser?.login && await workflowServices.findUser({ id: initialState.currentUser.login })
                user && dispatch({ type: 'setRequestUser', payload: user })
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to load.')
        }


    }

    const getRequestor = async (userId?: string) => {
        try {
            if (userId) {
                const user = await workflowServices.findUser({ id: userId })
                return user

            } else {
                if (!initialState?.currentUser?.login) {
                    message.error('No login user found.')
                    return
                }
                const user = await workflowServices.findUser({ id: initialState.currentUser.login })
                return user
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to load.')
        }
    }

    const setRequestor1 = async (processDefId: string, userId?: string) => {
        try {
            if (userId) {
                const user = await workflowServices.findUser({ id: userId })
                user && dispatch({ type: 'setRequestUser', payload: user })

            } else {
                const user = initialState?.currentUser?.login && await workflowServices.findUser({ id: initialState.currentUser.login })
                user && dispatch({ type: 'setRequestUser', payload: user })
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to load.')
        }


    }

    const onSetFiles = (files: UploadFile[]) => {
        dispatch({ type: 'setFiles', payload: files })
    }

    const addFile = (file: UploadFile) => {
        dispatch({ type: 'addFile', payload: file })
    }

    const removeFile = (file: UploadFile) => {
        dispatch({ type: 'removeFile', payload: file })
    }

    const clearUploadFiles = () => dispatch({ type: 'clearUploadFiles' })

    const startWorkflow = async (data: any, processDef: string, buId: number, formKey: string, comment?: string) => {

        if (!state.requestor) return Promise.reject("Invalid data.")

        const rs = await workflowServices.startWorkflow({
            requestorId: state.requestor.id,
            buId: buId,
            processDefKey: processDef,
            comment: comment,
            payloadType: formKey,
            payloadData: data,
            uploadedFiles: state.uploadFiles?.map(it => it.response) || []
        })
        return rs

    }

    const claim = async (params?: { taskId?: string, ori?: 'taskList' | 'instView' }) => {
        try {

            const id = params?.taskId || state.instanceData?.task?.taskId
            if (!id) return
            const rs = await workflowServices.claim({ id: id })

            dispatch({ type: 'isClaim', payload: { ori: params?.ori || 'instView', task: rs } })

        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }

    }

    const unClaim = async (params?: { taskId?: string, ori?: 'taskList' | 'instView' }) => {
        try {
            const id = params?.taskId || state.instanceData?.task?.taskId
            if (!id) return
            const rs = await workflowServices.unClaim({ id: id })
            dispatch({ type: 'isClaim', payload: { ori: params?.ori || 'instView', task: rs } })
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }

    }

    const loadInstanceData = async (id: string, type: 'inst' | 'task') => {
        try {
            const rs = await workflowServices.findInstanceData()({ id: id, type: type })
            dispatch({ type: 'setInstanceData', payload: rs })
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }

    }

    const loadDiagram = async (instId?: string) => {

        try {
            const id = instId || state.instanceData?.processInstance?.procInstId

            if (!id) return
            const rs = await workflowServices.findDiagram({ id: id })
            dispatch({
                type: 'setDiagramData', payload: rs
            })
            actions.showModalAction('Diagram')

        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }
    }

    const openActionForm = (activity: string, formKey: string, action: string | 'start', procInstId: string, taskId?: string, payload?: any) => {
        dispatch({
            type: 'setActivityData', payload: {
                activity: activity,
                action: action,
                formKey: formKey,
                procInstId: procInstId,
                taskId: taskId || state.instanceData?.task?.taskId,
                payload: payload
            }
        })
        actions.showModalAction('Action')
    }

    const loadInstanceList = async (params?: { criteria?: InstanceSearchParams, paging?: Pagination }) => {
        try {
            const rs = await workflowServices.findInstanceList(((params?.criteria || state.searchParams)), params?.paging)
            rs && dispatch({ type: 'setInstanceList', payload: rs })
            if (params) {
                dispatch({ type: 'setSearchParams', payload: params?.criteria || { state: 'ALL' } })
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }
    }
    const selectedCompanyId = (id: number) => {
        dispatch({ type: 'setSelectedCompanyId', payload: { id: id } })
    }

    const loadPRocessDef = async (defKey: string) => {
        try {
            const rs = await workflowServices.findProcessDef({ key: defKey })
            dispatch({ type: 'setProcessDefKey', payload: rs })
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }
    }

    const openStartMenu = async (id: number) => {
        try {
            const rs = await workflowServices.findProcessDefList({ id: id })
            dispatch({ type: 'setInstanceDefList', payload: rs })
            dispatch({ type: 'setSelectedCompanyId', payload: { id: id } })
            // rs.length > 0 && actions.showModalAction('InstanceDefList')
            rs.length == 0 && message.warning("No process workflow available.")
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }
    }

    const loadProcessDefList = async (id: number) => {
        try {
            const rs = await workflowServices.findProcessDefList({ id: id })
            dispatch({ type: 'setInstanceDefList', payload: rs })
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }
    }


    const loadTaskList = (params: TableViewSearchParams<TaskListAdvanceSearchParams>) => {

        console.log(params);

        return workflowServices.findTaskList({
            filter: params.criteria?.advanceSearch?.status || '',
            latest: params.criteria?.advanceSearch?.latest || false,
            searchValue: params.criteria?.searchValue,

        }, { page: (params.pagination?.current || 1) - 1, pageSize: params.pagination?.pageSize })
    }

    const downloadForm = async (pInst: string, fileName?: string) => {

        const id = pInst || state.instanceData?.processInstance?.procInstId
        if (!id) return
        //TODO: fix later
        // const blob = download({ instId: id })
        // blob.then(v => {
        //     const element = document.createElement("a");
        //     element.href = URL.createObjectURL(v);
        //     element.download = fileName || 'download.pdf';
        //     document.body.appendChild(element);
        //     element.click();
        // }).finally(() => downloadFormSrv(id))
    }

    const completeTask = async (params: { payload: any, ori?: 'taskList' | 'instView', comment?: string }) => {

        if (state.activityData) {
            const taskId = state.activityData.taskId || state.instanceData?.task?.taskId
            if (!taskId) {
                message.error("Task is not available.")
                return
            }

            const rs = await workflowServices.completeTask({
                action: state.activityData.action,
                payloadType: state.activityData.formKey,
                taskId: taskId,
                payloadData: params.payload,
                comment: params.comment,
                uploadedFiles: state.uploadFiles?.map(it => it.response) || [],
                fetchCurrentTask: params.ori == 'taskList'
            })
            dispatch({ type: 'updateTask', payload: { newTask: rs, oldTaskId: taskId, ori: params.ori || 'instView' } })
            actions.hideModalAction('Action')

        }

    }

    const showUserDest = async (taskId: string) => {
        try {
            const rs = await workflowServices.findUserDestinationList({ id: taskId })
            dispatch({ type: 'setUserDestination', payload: rs })
            dispatch({
                type: 'setModalData', payload: {
                    type: 'UserDestination',
                    taskId: taskId
                }
            })
            actions.showModalAction('ShowUserDest')
        } catch (error: any) {
            message.error(error.message || 'Failed to load data')
        }
    }

    const extractProcessDef = async (processDefId: string) => {
        return await workflowServices.extractProcessDef({
            id: processDefId
        })
    }

    const fetchWorkflowOriginator = async (processDefId: string) => {
        return await workflowServices.fetchWorkflowOriginator({ id: processDefId })
    }
    const fetchDestApproval = async (processDefId: string) => {
        return await workflowServices.fetchDestApproval({ id: processDefId })
    }
    const fetchNotificationFeedback = async (processDefId: string) => {
        return await workflowServices.fetchNotificationFeedback({ id: processDefId })
    }

    const deployProcessDef = async (fileId: string) => {
        await workflowServices.deployProcessDef({ fileId: fileId })
    }

    const saveDest = async (data: SaveFirstLevelApproval) => {
        await workflowServices.saveDest(data)
    }

    const saveOriginator = async (data: SaveWorkflowOriginator) => {
        await workflowServices.saveOriginator(data)
    }

    const saveContractTermTemp = async (data: ContractTermData) => {
        return Promise.resolve({ id: 1 })
    }

    const listMessageTemplate = async () => {
        return workflowServices.listMessageTemplate()
    }

    const saveConfigEndEvent = (params: ConfigEndEventParams) => {
        return workflowServices.saveConfigEndEvent(params)
    }
    const fetchConfigEndEvent = (eventId: string) => {
        return workflowServices.fetchConfigEntEvent({ id: eventId })
    };

    return {
        state: state,
        actions: {
            loadPRocessDef: loadPRocessDef,
            loadProcessDefList: loadProcessDefList,
            openStartMenu: openStartMenu,
            loadInstanceList: loadInstanceList,
            loadTaskList: loadTaskList,
            showUserDest: showUserDest,
            startWorkflow: startWorkflow,
            completeTask: completeTask,
            loadDiagram: loadDiagram,
            openActionForm: openActionForm,
            loadInstanceData: loadInstanceData,
            selectedCompanyId: selectedCompanyId,
            loadInitData: loadInitData,
            claim: claim,
            unClaim: unClaim,
            setRequestor: setRequestor,
            getRequestor: getRequestor,
            setRequestor1: setRequestor1,
            crearUploadFiles: clearUploadFiles,
            onSetFiles: onSetFiles,
            addFile: addFile,
            removeFile: removeFile,
            downloadForm: downloadForm,
            extractProcessDef: extractProcessDef,
            fetchWorkflowOriginator: fetchWorkflowOriginator,
            fetchDestApproval: fetchDestApproval,
            fetchNotificationFeedback: fetchNotificationFeedback,
            deployProcessDef: deployProcessDef,
            saveDest: saveDest,
            saveOriginator: saveOriginator,
            saveContractTermTemp: saveContractTermTemp,
            listMessageTemplate: listMessageTemplate,
            saveConfigEndEvent: saveConfigEndEvent,
            fetchConfigEndEvent: fetchConfigEndEvent,
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        },
    } as IProcessWorkflowModel

}
