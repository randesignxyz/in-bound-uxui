import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SalePaths } from ".."
import '@/pages/index.less'
import SoDetailView from "./components/Detail"
import { Access, useAccess } from "umi"
import MainPage from "./MainPage"
import ViewWrapper from "./ViewWrapper"
import Create from "./components/Create"
import Edit from "./components/Edit"

export default () => {

    const access = useAccess()

    return <CrudWrapper baseURL={SalePaths.so} disablePageContainer >
        {
            (view, id, navigate) => {
                return view === 'list' && <MainPage /> ||
                    view === 'detail' && <ViewWrapper
                        id={id as number}
                        actionHandlers={{
                            onBack: navigate?.gotToListHandler
                        }} /> ||
                    view === 'create' && <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create /> </Access> ||
                    view === 'edit' && <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id={id as number} /></Access>
            }
        }
    </CrudWrapper>
}