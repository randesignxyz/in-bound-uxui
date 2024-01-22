import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { QueuePaths } from ".."
import QueueTicketListView from "./Listview"

export default () => {

    return <CrudWrapper baseURL={QueuePaths.ticket} >

        {(view) => {

            switch (view) {
                case 'list':
                    return <QueueTicketListView/>
                default:
                    throw Error('Not supported')
            }

        }}
    </CrudWrapper>
}


