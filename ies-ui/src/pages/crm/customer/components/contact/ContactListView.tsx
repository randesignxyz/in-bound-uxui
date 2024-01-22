import ContactEntryModal from "@/pages/crm/contact/components/ContactEntryModal"
import { Model } from "@/pages/crm/contact/model"
import { ContactData, ContactListItem } from "@/services/crm/contact"
import { PlusOutlined } from "@ant-design/icons"
import { Button, Card, Modal } from "antd"
import ContactAssignedModal from "./ContactAssignedModal"
import ContactListComp from "./ContactListComp"

interface Props {
    customerId?: number;
    data?: ContactListItem[];
    onDetail?: (data: ContactListItem) => void;
    reloadParent?: () => void;
}

const ContactListView: React.FC<Props> = ({ customerId, data, onDetail, reloadParent }) => {
    const { state, actions, modals } = Model()

    const onSearchActionHandler = (value?: string) => {
        actions.list(value)
    }

    const onAddNewActionHandler = () => {
        modals.hideModal('search')
        modals.showModal('add-new')
    }

    const onAssignActionHandler = (data: ContactListItem) => {
        customerId && Modal.confirm({
            title: "Assign Contact to Customer",
            content: 'Are you sure?',
            onOk: async () => {
                await actions.assignToCustomer(data.id, customerId)
                reloadParent?.()
            }
        })
    }

    const onNewAndAssignToCustomer = (data: ContactData) => {
        customerId && Modal.confirm({
            title: "New Contact",
            content: 'Are you sure?',
            onOk: async () => {
                await actions.newAndAssignToCustomer(data, customerId)
                modals.hideModal('add-new')
                reloadParent?.()
            }
        })
    }

    const onRemoveActionHandler = (data: ContactListItem) => {
        customerId && Modal.confirm({
            title: "Remove Contact",
            content: 'Are you sure?',
            onOk: async () => {
                await actions.unassignToCustomer(data.id, customerId)
                reloadParent?.()
            }
        })
    }

    return <Card bordered={false}>

        <ContactListComp data={data} onDetail={onDetail} onRemove={onRemoveActionHandler} />
        <Button size='small' style={{ width: '100%', marginBottom: 8 }} type='dashed' onClick={() => modals.showModal('search')} icon={<PlusOutlined />} />
        <ContactAssignedModal
            loading={state.loading}
            added={data?.map(it => it.id)}
            onSearch={onSearchActionHandler}
            onAddNew={onAddNewActionHandler}
            onAssign={onAssignActionHandler}
            data={state.itemList} visible={modals.isVisible('search')}
            onCancel={() => modals.hideModal('search')} />

        <ContactEntryModal
            open={modals.isVisible('add-new')}
            onCancel={() => modals.hideModal('add-new')}
            actionHandlers={{
                onSave: onNewAndAssignToCustomer
            }}
        />
    </Card>
}
export default ContactListView