import { useState } from "react";
import { getMultiLookupData } from "@/services/shared/fetchData";
import { Endpoint } from "@/services/API";


const useLookupMultiData = <T>(serviceName: Endpoint, types: string[], limit: number = 10) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<T>()

    const load = async() => {
        try{
            setLoading(true)
            const rs = await getMultiLookupData<T>({
                serviceName: serviceName,
                types: types
            })

            rs && setData(rs)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading: loading,
        data: data,
        load: load
    }
}

export default useLookupMultiData