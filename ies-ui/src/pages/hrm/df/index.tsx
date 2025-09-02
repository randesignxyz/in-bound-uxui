import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import MainPage from "./MainPage"
import { HrmPaths } from ".."
import DataEntryView from "./DataEntryView"
import DataEntryFormView from "./DataEntryFormView"
import { Card } from "antd"

export default () => {
    return(
        <CrudWrapper disablePageContainer   baseURL={HrmPaths.df} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    return <MainPage />
                case 'detail':
                    return <Card>
                        <DataEntryFormView id={id} type="EDIT" onCloseTab={() => navigate?.gotToListHandler?.()}/>
                    </Card>
                    
                // case 'detail':
                //     return <div>Main</div>
                default:
                    throw Error('Not supported')
            }
        }}
        </CrudWrapper>
    )
}