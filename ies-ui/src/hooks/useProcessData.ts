import { ServiceType } from "@/services/API"
import { processData } from "@/services/shared/processData"

import { useState } from "react"

const useProcessData = <T, R>(service: ServiceType) => {

    const [result, setResult] = useState<R>()
    const [loading, setLoading] = useState<boolean>(false)

    const exec = async (payload: T, cb?: (message?: any) => void) => {

        try {
            setLoading(true)
            const rs = await processData<T, R>({
                service: service,
                payload: payload
            })
            setResult(rs)
            rs && cb && cb(rs)
        } finally {
            setLoading(false)
        }


    }
    return {
        loading: loading,
        result: result,
        exec: exec
    }
}

export default useProcessData