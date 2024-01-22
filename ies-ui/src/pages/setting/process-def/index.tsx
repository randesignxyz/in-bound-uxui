import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SettingPaths } from ".."
import ProcessDefDetailView from "./components/Detail"
import ProcessDefListView from "./components/List"

export default () => {

    return <CrudWrapper baseURL={SettingPaths.workflow} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    return <ProcessDefListView actionHandlers={{
                        onDetail: r => navigate?.goToDetail?.({ id: r.id })
                    }} />
                case 'detail':
                    return <ProcessDefDetailView id={id as string} actionHandlers = {{
                        onBack: navigate?.gotToListHandler
                    }} />
                default:
                    throw Error('Not supported')
            }
        }}

        
    </CrudWrapper>
}