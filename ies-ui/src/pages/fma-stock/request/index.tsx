import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { WHMPaths } from ".."
import DataEntryView from "./DataEntryView"
import ListView from "./ListView"


export default () => {

    return <CrudWrapper disablePageContainer baseURL={WHMPaths.request} >
        {(view, id , navigate) => {
            switch (view) {
                case 'list':
                    return <ListView onAdd={id => navigate?.goToCreate?.({id})} onEdit={id =>navigate?.gotoEdit?.({id})}/>
                case 'create':
                    return <DataEntryView onBack={()=> navigate?.gotToListHandler?.()} type="CREATE" id={id as number}/>
                case 'edit': 
                    return <div>edit</div>
                default:
                    throw Error('Not supported')
            }
        }}

        
    </CrudWrapper>
}