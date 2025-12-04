import PageWrapper from "@/components/PageWrapper"
import RequestForm from "./Form"
import { simpleRequestActions } from "@/services/model"
import { useQuery } from "@umijs/max"
import { BookingAPI } from "../service";


export default ()=>{
    const requestActions = simpleRequestActions();

    const {data, isFetching, refetch} = useQuery({
        queryKey:["bookings"],
        queryFn:()=>BookingAPI(requestActions).page()
    })

    return (
        <PageWrapper

            tabRender={(it)=>[
                {
                    tabLabel:"New",
                    action:"add",
                    tabKey:"add",
                    panel:()=><RequestForm
                        id={it?.id}
                    />
                }
            ]}
            listView={{
                title:"Request List",
                type:"Table",
                onRefresh:refetch,
                props:{
                    dataSource:data?.items,
                    loading:isFetching,
                    columns:[
                        {
                            title:"Code",
                            dataIndex:"code",
                        },
                        {
                            title:"Employee Name",
                            dataIndex:"empName"
                        },
                        {
                            title:"Purpose",
                            dataIndex:"Purpose"
                        },
                        {
                            title:"Start Date",
                            dataIndex:"startDate"
                        },
                        {
                            title:"End Date",
                            dataIndex:"endDate"
                        }
                    ]
                }
            }}

        />
    )
}