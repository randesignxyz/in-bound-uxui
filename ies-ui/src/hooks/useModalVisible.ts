import { useState } from "react"


type Status = 'EDIT'| 'READONLY'

const useModalVisible = <T extends string, D>(init: Record<T, boolean>) => {
    const [data, setData] = useState<D>()
    const [modalVisible, setModalVisible] = useState<Record<T, boolean>>({ ...init })
    const [status, setStatus] = useState<Status>()

    const show = async (name: T, data?: D, status?: Status) => {

        setData(_ => data)
        setStatus( _ => status)
        setModalVisible(v => {
            v[name] = true
            return { ...v}
        })
        return Promise.resolve()
    }

    const doSetStatus = (status?: Status) => {
        setStatus(status)
    }
    const hide = async (name: T) => {
        setModalVisible(v => {
            v[name] = false
            return { ...v}
        })
        setData(undefined)
        setStatus(undefined)
        return Promise.resolve()
    }

    return {
        modalName: modalVisible,
        data: data,
        status: status,
        setStatus: doSetStatus,
        show: show,
        hide: hide
    }
}

export default useModalVisible