import { BaseActionType, baseReducer, commmonActions, StateType } from "@/services/model"
import { CommentData, CommentObjectType } from "@/services/user-comment/data"
import { UserCommentServiceAPI } from "@/services/user-comment/service"
import { message } from "antd"
import { useReducer } from "react"

export type ModalNameType = 'add-new' | undefined

interface State extends StateType<ModalNameType> {
    itemList?: CommentData[],

}

export type Action = BaseActionType<ModalNameType>
    | { type: 'setListItem', payload?: CommentData[] }
    | { type: 'removeItem', payload?: number }

export const reducer = (state: State, action: Action): State => {

    switch (action.type) {
        case 'setListItem':
            return { ...state, itemList: action.payload }
        case 'removeItem':
            return { ...state, itemList: state.itemList?.filter(it => it.id !== action.payload) }
        default:
            return baseReducer(state, action)
    }
}


export const Model = () => {

    const initState: StateType<ModalNameType> = {

    }

    const [state, dispatch] = useReducer(reducer, initState)

    const actions = commmonActions(dispatch, state)
    const requestActions = actions.requestActions()

    const listCommentSrv = UserCommentServiceAPI.listComment(requestActions)
    const saveCommentSrv = UserCommentServiceAPI.saveComment(requestActions)
    const removeCommentSrv = UserCommentServiceAPI.removeComment(requestActions)

    const list = async (objectType: CommentObjectType, objectId: number) => {
        try {
            const rs = await listCommentSrv({ objectType: objectType, objectId: objectId })
            dispatch({ type: 'setListItem', payload: rs.reverse() })
        } catch (error: any) {
            message.error(error.message || "Failed to load data.")
        }

    }

    const save = async (objectType: CommentObjectType, objectId: number, description: string) => {
        try {
            await saveCommentSrv({ objectType: objectType, objectId: objectId, description: description })
            await list(objectType, objectId)
        } catch (error: any) {
            message.error(error.message || "Failed to save.")
        }

    }

    const remove = async (id: number) => {
        try {
            await removeCommentSrv({ id: id })
            dispatch({ type: 'removeItem', payload: id })
        } catch (error: any) {
            message.error(error.message || "Failed to remove.")
        }
    }
    return {
        state: state,
        actions: {
            list: list,
            save: save,
            remove: remove,
        },
        modals: {
            isVisible: actions.isVisible,
            showModal: actions.showModalAction,
            hideModal: actions.hideModalAction
        }
    }
}