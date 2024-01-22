import { Descriptions, Modal, ModalProps } from "antd"
import { BasicContactData } from "./data"

interface Props extends ModalProps {
    data: BasicContactData
}

export default ( {data, ...rest}: Props) => {

    return <Modal title = "Contact" {...rest} footer = {false}>
        <Descriptions column={1}>
            <Descriptions.Item label = "Emplyee No"> {data.empNo} </Descriptions.Item>
            <Descriptions.Item label = "Local Name"> {data.internalName} </Descriptions.Item>
            <Descriptions.Item label = "Full Name"> {[data.firstName, data.lastName].join(' ')} </Descriptions.Item>
            <Descriptions.Item label = "Mail"> {data.mail} </Descriptions.Item>
            <Descriptions.Item label = "Contact Channel"> {data.contacts.map(it => `${it.value} (${it.type.name})`).join(", ")} </Descriptions.Item>
            
        </Descriptions>
    </Modal>
}