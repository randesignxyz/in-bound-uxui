import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { QueuePaths } from ".."
import { LoadingDockListView } from "./ListView"

export default () => {

    return <CrudWrapper baseURL={QueuePaths.loadingDock} >
        {(view) => {
            switch (view) {
                case 'list':
                    return <LoadingDockListView/>
                default:
                    throw Error('Not supported')
            }
        }}
    </CrudWrapper>
}