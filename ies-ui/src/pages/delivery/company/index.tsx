import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { DeliveryPaths } from ".."
import ListView from "./ListView"
import { history } from "@umijs/max"

export default () => {

    return <CrudWrapper onBack={() => history.back()} title="Company" baseURL={DeliveryPaths.company} >
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