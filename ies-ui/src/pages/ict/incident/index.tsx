import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { ICTPaths } from ".."


import ListView from "./ListView"


export default () => {
    return <CrudWrapper baseURL={ICTPaths.incident} >
        {(view, id , navigate) => {
            
            switch (view) {
                case 'list':
                    return <ListView onAdd={id => navigate?.goToCreate?.({id})} onEdit={id =>navigate?.gotoEdit?.({id})}/>
                default:
                    throw Error('Not supported')
            }
        }}

        
    </CrudWrapper>
}