import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { QueuePaths } from ".."
import ListView from "./ListView"

export default () => {
    return <CrudWrapper baseURL={QueuePaths.setting} title="Queque" >
        {(view) => {
            switch (view) {
                case 'list':
                    return <ListView />
                default:
                    throw Error('Not supported')
            }
        }}
    </CrudWrapper>
}