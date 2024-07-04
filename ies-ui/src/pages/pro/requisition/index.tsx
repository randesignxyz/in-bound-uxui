import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { ProPaths } from ".."
import DataEntryView from "./DataEntryView"
import MainPage from "./MainPage"


export default () => {

    return <CrudWrapper disablePageContainer baseURL={ProPaths.requisition} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    // return <ListView onAdd={id => navigate?.goToCreate?.({id})} onEdit={id =>navigate?.gotoEdit?.({id})}/>
                    return <MainPage />
                case 'create':
                    return <DataEntryView onBack={() => navigate?.gotToListHandler?.()} type="CREATE" id={id as number} />
                case 'edit':
                    return <DataEntryView onBack={() => navigate?.gotToListHandler?.()} type='EDIT' id={id as number} />
                default:
                    throw Error('Not supported')
            }
        }}


    </CrudWrapper>
}