import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin } from "antd"
import { CrmPaths } from ".."
import VisitScheduleDetailView from "./components/Detail"
import MainPage from "./MainPage"

export default () => {

    return (
        <CrudWrapper disablePageContainer baseURL={CrmPaths.visitSchedule}>
            {
                (view, id, navigate) => {
                    switch (view) {
                        case 'list':
                            return <MainPage />
                        case 'detail': return id ? <VisitScheduleDetailView id={Number(id) || 0} onBack={navigate?.gotToListHandler} /> : <Spin />
                        default: throw Error('Not compatible view')
                    }
                }
            }
        </CrudWrapper>
    )
}

