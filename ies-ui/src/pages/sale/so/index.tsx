import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SalePaths } from ".."
import  '@/pages/index.less'
import SoListView from "./components/List"
import SoDetailView from "./components/Detail"
import Edit from "./components/Edit"
import Create from "./components/Create"
import { Access, useAccess } from "umi"

export default () => {

    const access = useAccess()

    return <CrudWrapper baseURL={SalePaths.so} >
        {
            (view, id, navigate) => {
               return view === 'list' && <SoListView actionHandlers = {{
                onAdd: navigate?.goToCreate,
                onDetail: navigate?.goToDetail,
               }}  /> ||
               view === 'detail' && <SoDetailView id = {id as number}  actionHandlers = {{
                   onBack: navigate?.gotToListHandler
               }} /> ||
               view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
               view === 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
            }
        }
    </CrudWrapper>
}