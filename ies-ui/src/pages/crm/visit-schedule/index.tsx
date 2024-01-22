import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin } from "antd"
import { CrmPaths } from ".."
import VisitScheduleListView from "./components/List"
import VisitScheduleDetailView from "./components/Detail"

export default () => {

    return (
        <CrudWrapper baseURL={CrmPaths.visitSchedule}>
            {
                (view, id, navigate) => {
                    switch (view) {
                        case 'list': return (
                            <VisitScheduleListView
                                onDetail={data => navigate?.goToDetail?.({ id: data.id })}
                            />
                        )
                        case 'detail': return id ? <VisitScheduleDetailView id={Number(id) || 0} onBack={navigate?.gotToListHandler} /> : <Spin />
                        default: throw Error('Not compatible view')
                    }
                }
            }
        </CrudWrapper>
    )
}

