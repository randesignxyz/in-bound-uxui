import { useState } from "react";
import { getAllLookupData, getLookupData } from "@/services/shared/fetchData";
import { ServiceType } from "@/services/API";
import { LookupData } from "@/components/core/comp";


const useLookupData = (service: ServiceType, cache: boolean = false , initData?: LookupData[], limit?: number) => {
    
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LookupData[]>(initData || []);

    const loadAll = async (cb?:(data: LookupData[])=> void) => {

        try {

            if(cache && data.length> 0) {
                cb && cb(data)
                return
            } 

            setLoading(true)
            setData([])
            const rs = await getAllLookupData({service: service})
            setData(rs || [])
            cb && cb(rs || [])
        }finally {
            setLoading(false)
        }
    }

    const load = async (value: string, cb?:(data: LookupData[]) => void) => {
        try{

            if(cache && data.length> 0) {
                cb && cb(data)
                return
            } 
        
            setLoading(true)
            setData([])
            const rs = await getLookupData({
                service: service,
                searchValue: value,
                limit: limit
            })

            setData(rs || [])
            cb && cb(rs || [])
        }finally{
            setLoading(false)
        }
    }

    const clear = () => {
        setData([])
        setLoading(false)
    }
    return {
        loading: loading,
        data: data,
        loadAll: loadAll,
        load: load,
        clear: clear
    }
}

export default useLookupData;