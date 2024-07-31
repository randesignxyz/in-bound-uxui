import LoadingTimeReport from "./LoadingTimeReport"
import { ModalFormProps } from "@ant-design/pro-components"
import DeliveryTimeReport from "./DeliveryTimeReport"
import IssueTicketModal from "@/pages/queue/ticket/issue-ticket-modal"
import CashCollectionReport from "./CashCollectionReport"

export type ModalName = 'LOADING_TIME' | 'DELIVERY_TIME' | 'ISSUE_TICKET' | 'CASH_COLLECTION_REPORT'

export type modalType = {
    type: ModalName,
    props?: ModalFormProps
}


export default ({ modal, onClose }: { modal?: modalType, onClose: () => void }) => {
    return <div>
        <LoadingTimeReport open={modal?.type == 'LOADING_TIME'} onOpenChange={visible => !visible && onClose()} {...modal?.props} />
        <DeliveryTimeReport open={modal?.type == 'DELIVERY_TIME'} onOpenChange={visible => !visible && onClose()} {...modal?.props} />
        <IssueTicketModal open={modal?.type == 'ISSUE_TICKET'} onRefresh={() => { }} onOpenChange={visible => !visible && onClose()} />
        <CashCollectionReport open={modal?.type == 'CASH_COLLECTION_REPORT'} onOpenChange={visible => !visible && onClose()} {...modal?.props} />
    </div>
}