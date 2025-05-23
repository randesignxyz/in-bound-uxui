import CrudWrapper from "@/components/DataCrud/CrudWrapper";
import MainPage from "./MainPage";
import DataEntryView from "./DataEntryView";
import { CrmPaths } from "..";

export default () => {
    return(
        <CrudWrapper disablePageContainer   baseURL={CrmPaths.registerCustomer} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    return <MainPage />
                case 'create':
                    return <DataEntryView onBack={() => navigate?.gotToListHandler?.()}/>
                case 'edit':
                    return <div>Main</div>
                default:
                    throw Error('Not supported')
            }
        }}
        </CrudWrapper>
    )
}