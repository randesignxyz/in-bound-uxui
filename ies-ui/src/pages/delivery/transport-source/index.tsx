import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { DeliveryPaths } from ".."
import ListView from "./ListView"

export default () => {

    return <CrudWrapper baseURL={DeliveryPaths.tranportSource} >
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