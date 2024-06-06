import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SalePaths } from ".."
import '@/pages/index.less'
import SoDetailView from "./components/Detail"
import { Access, useAccess } from "umi"
import MainPage from "./MainPage"

export default () => {

    const access = useAccess()

    return <CrudWrapper baseURL={SalePaths.so} disablePageContainer >
        {
            (view, id, navigate) => {
                return view === 'list' && <MainPage /> ||
                    view === 'detail' && <SoDetailView id={id as number} actionHandlers={{
                        onBack: navigate?.gotToListHandler
                    }} /> || <div>Unauthorized</div>
                //view === 'create' && <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create /> </Access> ||
                //view === 'edit' && <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id={id as number} /></Access>
            }
        }
    </CrudWrapper>
}