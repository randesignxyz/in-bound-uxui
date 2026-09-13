import { LookupData } from "@/components/core/comp";
import { ServiceType } from "@/services/API";
import { getLookupData } from "@/services/shared/fetchData";
import { useState } from "react";

const useLookupDataWithCb = (service: ServiceType, initData?: LookupData[], limit?: number) => {

    const [lastFetchId, setLastFetchId] = useState<number>(0)
    const [fetching, setFetching] = useState<boolean>(false)
    const [data, setData] = useState<LookupData[]>([])

    const load = async (value?: string) => {
        try {

            console.log('fetching user', value);

            setFetching(true)
            setLastFetchId(i => i+ 1)
            const fetchId = lastFetchId
            setData([])
            const rs = await getLookupData({
                service: service,
                searchValue: value || '',
                limit: limit
            })

            if(fetchId !== lastFetchId) {
                console.log(`cancel return data for fetch id ${fetchId} -/ last fetch- ${lastFetchId}`)
                return
            }

            console.log(`set return data for fetch id ${fetchId} -/ last fetch- ${lastFetchId}`)
            setData(rs)

        } finally {
            setFetching(false)            
        }

    }

    return {
        fetching: fetching,
        data: data,
        load: load
    }
}

export default useLookupDataWithCb