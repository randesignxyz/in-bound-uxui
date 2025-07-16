import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import MainPage from "./MainPage"
import { HrmPaths } from ".."

export default () => {
    return(
        <CrudWrapper disablePageContainer   baseURL={HrmPaths.df} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    return <MainPage />
                // case 'create':
                //     return <DataEntryView id={0} type="CREATE" onCloseTab={() => navigate?.gotToListHandler?.()}/>
                // case 'edit':
                //     return <div>Main</div>
                default:
                    throw Error('Not supported')
            }
        }}
        </CrudWrapper>
    )
}