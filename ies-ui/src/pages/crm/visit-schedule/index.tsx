import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { CustomerItemLess, VisitScheduleAdvanceSearchParams, VisitScheduleItem } from "@/services/crm/data"
import { useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Model } from "./model"
import { useQuery } from "@umijs/max"
import { ContractServices } from "../contract/services"
import { MultiRequest, fetchDataListService } from "@/services/apiGateway"
import { LookupData } from "@/services/data"
import { formatDate } from "@/pages/utils"
import { CrmServiceAPI } from "@/services/crm/services"

type FilterType = {

}
export default () => {

    const { state, actions, modals } = Model();
    const crmServices = CrmServiceAPI()
    const [filter, setFilter] = useState<FetchPagingParams<VisitScheduleAdvanceSearchParams>>({
        criteria: {
            status: 'COMPLETED',
        }
    })

    const lookup = useQuery(['visit-schedule-lookup-data'], () => MultiRequest<{
        contractTypes: LookupData[];
        lookupDataList: LookupData[];
    }>([
        ContractServices.listContractType().queryParams,
        fetchDataListService<LookupData, { list: string[] }>({
            actionName: 'lookupDataList',
            endpoint: 'CRM',
            payload: { list: ['CUSTOMER_DIVISION'] },
        }).queryParams
    ])(), { refetchOnWindowFocus: false })


    const { data, refetch, isFetching } = useQuery(
        ['fetch-visit-schedule-paging', filter],
        () => crmServices.listVisitSchedule({ ...filter }, filter.pagination,),
        { refetchOnWindowFocus: false }
    )

    console.log(lookup.data);


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
                    loading: isFetching,
                    dataSource: data?.items,
                    pagination: {
                        total: data?.total
                    },
                    columns: [{
                        title: 'Schedule Date',
                        width: 130,
                        render: (_, r) => <a onClick={() => { }}>{formatDate(r.scheduleDate)}</a>,
                        sorter: 'scheduleDate',
                    }]
                },

            }} />
        </Spin>
    )
}

