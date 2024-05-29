import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { CustomerItemLess, VisitScheduleItem } from "@/services/crm/data"

type FilterType = {

}
export default () => {

    return (
        <Spin spinning={false}>

            {/* <CrudWrapper baseURL={CrmPaths.visitSchedule}>
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
            </CrudWrapper> */}

            <PageWrapper<VisitScheduleItem, FilterType, {}> listView={{
                type: 'Table',
                props: {

                    columns: []
                },

            }} />
        </Spin>
    )
}

