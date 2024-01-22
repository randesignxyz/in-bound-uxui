import { Modal, ModalProps } from "antd"
import React from "react";
import TestTree from "../components/TestTree";

interface Props extends ModalProps {
    docId?: number;
}

const MoveModalForm:React.FC<Props> = ({ docId, ...props }) => {

    return (
        <>
            <Modal
                {...props}
                title={"Move Document"}
                okText={"Move"}
                
            >

                {/* <FolderViewList
                    onSearch={()=>{}}
                    moveDoc={true}

                /> */}
                <TestTree/>
            </Modal>
        </>
    )
}

export default MoveModalForm