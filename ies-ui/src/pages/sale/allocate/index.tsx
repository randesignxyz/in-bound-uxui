import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SalePaths } from ".."
import ListView from "./ListView"

export default () => {

    return <CrudWrapper onBack={() => history.back()} title="Sale Allocation Plan" baseURL={SalePaths.delAllocate} >
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