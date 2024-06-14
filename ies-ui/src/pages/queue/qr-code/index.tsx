import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { QueuePaths } from ".."
import { QRCodeListView } from "./ListView"

export default () => {


    return <CrudWrapper onBack={() => history.back()} title="QR Codes" baseURL={QueuePaths.qrCode} >

        {(view) => {
            switch (view) {
                case 'list':
                    return <QRCodeListView />
                default:
                    throw Error('Not supported')
            }
        }}
    </CrudWrapper>
}