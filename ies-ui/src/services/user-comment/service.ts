import { ServiceType } from "../API"
import { execService, findAllService, RequestActions } from "../apiGateway"
import { UserCommentServiceName, CommentData, CommentObjectType  } from "./data"

export const UserCommentService = (serviceName?: UserCommentServiceName): ServiceType => {
    return {
        type: 'CRM', //TODO: will seperate service to share to all modules
        name: serviceName
    }
}

export namespace UserCommentServiceAPI {
    export const removeComment = (actions?: RequestActions) => execService<{id: number;}, {}>(UserCommentService('remove-comment'), actions)
    export const listComment = (actions?: RequestActions) => findAllService<{objectType: CommentObjectType, objectId: number}, CommentData>(UserCommentService('list-comment'), actions)
    export const saveComment = (actions?: RequestActions) => execService<{objectType: CommentObjectType, objectId: number; description: string;}, {}>(UserCommentService('save-comment'), actions)
}