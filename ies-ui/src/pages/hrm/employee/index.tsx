import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { HrmPaths } from ".."
import DataEntry from "./DataEntry"
import ListView from "./ListView"

export default () => {

    return <CrudWrapper baseURL={HrmPaths.employee} >
        {(view, id , navigate) => {
            switch (view) {
                case 'list':
                    return <ListView onAdd={id => navigate?.goToCreate?.({id})} onEdit={id =>navigate?.gotoEdit?.({id})}/>
                case 'create':
                    return <DataEntry onBack={()=> navigate?.gotToListHandler?.()} type="CREATE" id={id as number}/>
                case 'edit':
                    return <div></div>
                default:
                    throw Error('Not supported')
            }
        }}
    </CrudWrapper>
}
