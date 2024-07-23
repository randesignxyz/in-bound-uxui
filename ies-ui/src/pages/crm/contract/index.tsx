import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { useState } from "react"
import { CrmPaths } from ".."
import ContractModal from "./components/ContractModal"
import ContactDetailView from "./components/Detail"
import MainPage from "./MainPage"

export default () => {

    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number, cb?: undefined } | { type: 'EDIT', id?: number, cb?: () => void }>()

    const onEditHandler = (id: number, cb?: () => void) => {
        setModalVisible({ type: 'EDIT', id: id, cb: cb })
    }
    return (<>
        <CrudWrapper baseURL={CrmPaths.contract} disablePageContainer>
            {
                (view, id) => {
                    switch (view) {
                        case 'list': return <MainPage />
                        case 'detail': return <ContactDetailView onEdit={onEditHandler} id={id as number || 0} />
                        default: throw new Error('Not supported')
                    }
                }
            }

        </CrudWrapper>
        {modalVisible?.type && <ContractModal onRefresh={modalVisible.cb} contractId={modalVisible.id} open={true} onOpenChange={visible => !visible && setModalVisible(undefined)} />}
    </>
    )
}