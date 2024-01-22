
import { PageResult, Paging } from "@/components/core/comp";
import { ServiceType } from "@/services/API";
import { queryData } from "@/services/shared/fetchData";
import { useState } from "react";

const useQueryData = <T, R>(service: ServiceType) => {

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<PageResult<R>>()
    const [criteria, setCriteria] = useState<T>()

    const load = async (searchCriteria: T) => {

        const search = {...criteria, ...searchCriteria}
        doQuery(search)
    }

    const goto = async( paging :Paging) => {

        doQuery(criteria, paging)
    }

    const doQuery = async(searchCriteria?: T,  paging? :Paging) => {
        try{

            setCriteria(searchCriteria)
            const rs = await queryData< T,R>({
                service: service,
                searchCriteria: searchCriteria,
                paging: paging
            })

            setResult(rs || undefined)
        }finally {
            setLoading(false)
        }
    }

    return {
        loading: loading,
        result: result,
        load: load,
        goto: goto
    }


}

export default useQueryData