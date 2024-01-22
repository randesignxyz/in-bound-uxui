import { PlusOutlined } from "@ant-design/icons"
import { Button,  Modal } from "antd"
import { useEffect } from "react"
import { CommentObjectType } from "@/services/user-comment/data"
import { Model } from "../../model"
import UserCommentEntryModal from "../UserCommentEntryModal"

interface Props {
    objectType: CommentObjectType,
    objectId: number;
}

const UserCommentListView: React.FC<Props> = ({ objectType, objectId }) => {

    const { state, actions, modals } = Model()
    useEffect(() => {
        actions.list(objectType, objectId)
    }, [])

    return (
        <div>
            <Button
                size='small'
                type="dashed"
                onClick={() => {
                    modals.showModal('add-new');
                }}
                style={{ width: '100%', marginBottom: 8 }}>
                <PlusOutlined /> Add Comment
            </Button>

            {/* {state.itemList?.map(it => {
                return ( 
                    <Comment
                        key={it.id}
                        author={it.createdBy}
                        avatar={
                            <UserOutlined/>
                        }
                        datetime={
                            <Tooltip title={formatDateTime(moment(it.createdDate))}>
                                <span>{moment(it.createdDate)?.fromNow()}</span>
                            </Tooltip>
                        }
                        content={(
                            <Row>
                                <Col flex='Auto'>{it.description}</Col>
                                <Col flex='20px'><Button onClick={() => {
                                    Modal.confirm({
                                        title: "Remove Comment",
                                        content: "Are you sure?",
                                        onOk: async () => {
                                            it.id && await actions.remove(it.id)
                                        }
                                    })
                                }} type='link' icon={<DeleteOutlined />} /> </Col>
                            </Row>
                        )} />
                )
            })} */}


            <UserCommentEntryModal onSave={description => {
                Modal.confirm({
                    title: 'Save Comment',
                    content: 'Are you sure?',
                    onOk: async () => {
                        await actions.save(objectType, objectId, description)
                        modals.hideModal('add-new')
                    }
                })
            }} visible={modals.isVisible('add-new')} onCancel={() => modals.hideModal('add-new')} />
        </div>
    )
}

export default UserCommentListView