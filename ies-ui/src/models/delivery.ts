import { useState } from "react"
import { getSapInitLookupData } from "@/services/shared/fetchData"
import { processSapData } from "@/services/shared/dataProcessing"
import { querySap, fetchSap } from "@/services/shared/queryData"
import { domain } from "@/services/del-expense/data"
import { PageResult, Paging } from "@/components/core/comp"
import { message } from "antd"

export interface searchDeliveryCost {
    outsourceId: number,
    settledOn: moment.Moment,
    claimedType: 'claimed' | 'unClaimed' | 'all', //claimed, unClaimed, all
    settlementId?: number,
    startDate?: moment.Moment,
    endDate?: moment.Moment,
    shippingCode?: string,
    customerCode?: string,
    province?: string,
    licenseFlat?: string,
    cancelled?: boolean
}
export interface SearchDNCriteria {
    startDate?: moment.Moment,
    endDate?: moment.Moment,
    shippingCode?: string,
    licenseFlat?: string,
    customerCode?: string,
    province?: string,
    claimedType?: string,
    cancelled?: string
}

export default () => {

    const [loading, setLoading] = useState(false)
    const [initLookupData, setInitLookupData] = useState<domain.delivery.DeliveryInitLookupData>()
    const [deliveryData, setDeliveryData] = useState<PageResult<domain.delivery.DeliveryItem>>()
    const [deliveryDetail, setDeliveryDetail] = useState<domain.delivery.DeliveryDetail>()
    const [deliveryCost, setDeliveryCost] = useState<PageResult<domain.delivery.DeliveryCost>>()
    const [invoice, setInvoice] = useState<domain.delivery.DeliveryInvoice>()
    const [params, setParams] = useState<searchDeliveryCost>()

    const [invoiceItemData, setInvoiceItemData] = useState<PageResult<domain.delivery.DeliveryNote>>()

    const clearAll = () => {
        setInitLookupData(undefined)
        setDeliveryData(undefined)
        setDeliveryDetail(undefined)
        setDeliveryCost(undefined)
        setInvoice(undefined)
    }

    const doLoadInitLookupData = async () => {

        setLoading(true)
        const rs = await getSapInitLookupData<domain.delivery.DeliveryInitLookupData>({
            types: 'outsource'
        })
        setInitLookupData(rs)
        setLoading(false)
    }

    const addNewInventory = async (data: domain.delivery.AddInventory, cb?: () => void) => {

        try {
            setLoading(true)
            const res = await processSapData({
                action: "addNewDelivery",
                payload: data
            })
            res && cb && cb()

        } finally {
            setLoading(false)
        }

    }

    const doFetchList = async (settledOn?: moment.Moment, outsourceId?: number, paging?: Paging) => {
        setLoading(true)
        const rs = await querySap<domain.delivery.DeliveryItem>({
            type: 'query_delivery_settlement',
            payload: {
                settledOn: settledOn,
                outsourceId: outsourceId
            },
            paging: paging
        })
        setDeliveryData(rs)
        setLoading(false)

    }

    const fetchDeliveryDetail = async (id: number) => {
        setLoading(true)
        const rs = await fetchSap<domain.delivery.DeliveryDetail>({
            type: 'fetch_delivery_by_id',
            payload: {
                id: id
            }
        })
        setDeliveryDetail(rs)
        setLoading(false)
    }

    const fetchInvoiceItem = async (invoiceId: number, cb?: () => void) => {
        try {
            setLoading(true)

            const rs = await querySap<domain.delivery.DeliveryNote>({
                type: 'query_delivery_invoice_items',
                payload: {
                    id: invoiceId
                }
            })

            rs && setInvoiceItemData(rs)

            rs && cb && cb()
        } finally {
            setLoading(false)
        }
    }

    const fetchInvoice = async (invoiceId: number) => {
        setLoading(true)
        const rs = await fetchSap<domain.delivery.DeliveryInvoice>({
            type: 'fetch_delivery_invoice',
            payload: {
                id: invoiceId
            }
        })
        setInvoice(rs)
        setLoading(false)
    }

    const fetchDeliveryCost = async (filterParams?: searchDeliveryCost, paging?: Paging, cb?: () => void) => {

        try {
            setLoading(true)
            if (filterParams) setParams(filterParams)

            const rs = await querySap<domain.delivery.DeliveryCost>({
                type: 'query_delivery_cost',
                payload: filterParams ? {
                    ...filterParams
                } : params,
                paging: paging
            })



            rs && setDeliveryCost(rs)
            rs && cb && cb()

        } finally {
            setLoading(false)
            cb && cb()
        }
    }

    const clearDeliveryCost = () => {
        setDeliveryCost(undefined)
    }

    const saveInvoice = async (data: domain.delivery.SaveInvoice, cb?: () => void) => {

        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'save_invoice',
                payload: data
            })

            rs && cb && cb()
        } finally {
            setLoading(false)
        }
    }

    const saveSingleItem = async (
        invoiceId: number,
        invoiceNo: string,
        data: domain.delivery.SaveInvoiceItem,
        cb?: () => void
    ) => {
        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'save_invoice_single_item',
                payload: {
                    invoiceId: invoiceId,
                    invoiceItem: data
                }
            })

            rs && cb && cb()

        } finally {
            setLoading(false)
        }
    }

    const removeInvoiceItem = async (docEntry: number, cb?: () => void) => {
        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'remove_invoice_item',
                payload: {
                    docEntry: docEntry
                }
            })

            rs && cb && cb()

        } finally {
            setLoading(false)
        }
    }

    const fix = async (docEntry: number, cb?: () => void) => {
        try {
            setLoading(true)
            await processSapData<{ docEntry: number }>({
                action: 'fix',
                payload: {
                    docEntry
                }
            })

        } finally {
            setLoading(false)
        }
    }

    const submit = async (id: number, remarks?: string, cb?: () => void) => {
        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'submit',
                payload: {
                    deliveryId: id,
                    remarks: remarks
                }
            })
            rs && cb && cb()
        }catch (error:any) {            
            throw error
        } finally {
            setLoading(false)
        }
    }
    const rework = async (id: number, remarks?: string, cb?: () => void) => {
        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'rework',
                payload: {
                    deliveryId: id,
                    remarks: remarks
                }
            })
            rs && cb && cb()

        } finally {
            setLoading(false)
        }
    }
    const complete = async (id: number,docRef?: string, remarks?: string,reconcile?:boolean, cb?: () => void) => {
        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'complete',
                payload: {
                    deliveryId: id,
                    remarks: remarks,
                    docRef:docRef,
                    reconcile:reconcile
                }
            })
            rs && cb && cb()

        }catch (error:any) {           
            throw error
        } finally {
            setLoading(false)
        }
    }

    const cancel = async (id: number, renarks: string) => {
        try {
            setLoading(true)
            const rs = await processSapData({
                action: 'cancel',
                payload: {
                    deliveryId: id,
                    remarks: renarks,
                }
            })
        } catch (error) {
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {
        loading: loading,
        deliveryData: deliveryData,
        initLookupData: initLookupData,
        deliveryDetail: deliveryDetail,
        invoice: invoice,
        deliveryCost: deliveryCost,
        invoiceItemData: invoiceItemData,
        loadInitLookupData: doLoadInitLookupData,
        saveInvoice: saveInvoice,
        saveSingleItem: saveSingleItem,
        addNewInventory: addNewInventory,
        removeInvoiceItem: removeInvoiceItem,
        doFetchList: doFetchList,
        fetchDeliveryDetail: fetchDeliveryDetail,
        fetchInvoice: fetchInvoice,
        fetchDeliveryCost: fetchDeliveryCost,
        fetchInvoiceItem: fetchInvoiceItem,
        clearInvoice: () => { setInvoice(undefined) },
        clearDeliveryCost: clearDeliveryCost,
        submit: submit,
        cancel: cancel,
        clearAll: clearAll,
        fix: fix,
        complete: complete,
        rework: rework
    }
}