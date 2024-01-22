import { ServiceType } from "@/services/API";
import { fetchData, fetchDataById } from "@/services/shared/fetchData";
import { useState } from "react";

const useFetchData = <T, R>(service: ServiceType) => {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<R>();

    const doFetch = async (data: T, cb?: (data?: R, message?: string, failed?: boolean ) => void) => {
        try {
            setLoading(true)
            const rs = await fetchData<T, R>({
                service: service,
                data: data
            })

            if (rs) {
                setData(rs)
                cb && cb(rs)
            } else {
                setData( undefined)
                cb && cb(undefined ,undefined, true)
            }

        } finally {
            setLoading(false)
        }
    }

    const doFetchById = async (id: number | string, cb?: (record: R) => void) => {

        try {
            setLoading(true)
            setData(undefined)
            const rs = await fetchDataById<R>({
                service: service,
                id: id
            })

            if (rs) {
                setData(rs)
                cb && cb(rs)
            }

        } finally {
            setLoading(false)
        }

    }

    const clear = () => {
        setData(undefined)
    }

    return {
        data: data,
        loading: loading,
        fetchById: doFetchById,
        fetch: doFetch,
        clear: clear
    }
}

export default useFetchData