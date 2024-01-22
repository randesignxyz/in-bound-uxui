import { CommentObjectType } from "@/services/user-comment/data"
import UserCommentListView from "./components/List"


interface Props {
    objectType: CommentObjectType,
    objectId: number;
}

const UserComment: React.FC<Props> = (props) => {
    return <UserCommentListView {...props} />
}

export default UserComment