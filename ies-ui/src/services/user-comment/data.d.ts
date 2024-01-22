export type UserCommentServiceName =
    'list-comment'
    | 'save-comment'
    | 'remove-comment'

export type CommentObjectType = 'CONTACT'

export interface CommentData {
    id?: number;
    objectType: CommentObjectType;
    objectId: number;
    description: string;
    createdBy?: string;
    createdDate?: moment.Moment;
    lastModifiedBy?: string;
    lastModifiedDate?: moment.Moment;
}


