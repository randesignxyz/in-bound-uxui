import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { QueuePaths } from ".."
import ListView from "./ListView"
import { history } from "@umijs/max"

export default () => {
    return <CrudWrapper onBack={() => history.back()} baseURL={QueuePaths.setting} title="Queque" >
        {(view) => {
            switch (view) {
                case 'list':
                    return <ListView />
                default:
                    throw Error('Not supported')
            }
        }}
    </CrudWrapper >
}