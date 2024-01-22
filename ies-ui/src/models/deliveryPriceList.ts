import { useState } from "react"
import { querySap, fetchSap } from "@/services/shared/queryData"
import { processSapData } from "@/services/shared/dataProcessing"
import { domain } from "@/services/del-expense/data"
import { PageResult } from "@/components/core/comp"



export default () => {

    const [loading, setLoading] = useState(false)
    const [outsourceData, setOutsourceData] = useState<PageResult<domain.delivery.Outsource>>()
    const [outsourcePriceList, setOutsourcePriceList] = useState<PageResult<domain.delivery.OutsourcePrice>>()
    const [pricePlaceList, setPricePlaceList] = useState<PageResult<domain.delivery.PricePlace>>()
    const [deliveryItemList, setDeliveryItemList] = useState<PageResult<domain.delivery.DeliveryItem>>()
    const [outsourcePrice, setOutsourcePrice] = useState<domain.delivery.OutsourcePrice>()
    const [outsourcePrices, setOutsourcePrices] = useState<PageResult<domain.delivery.OutsourcePrice>>()

    const loadOutsource = async (searchValue: string, cb?: () => void) => {

        try {
            setLoading(true)
            const rs = await querySap<domain.delivery.Outsource>({
                type: 'query_delivery_outsource',
                payload: {
                    searchValue: searchValue
                }
            })

            setOutsourceData(rs)

            rs && cb && cb()

        } finally {
            setLoading(false)
        }

    }

    const loadOutsourcePrice = async (outsourceId: number, cb?: () => void) => {

        try {
            setLoading(true)
            const rs = await querySap<domain.delivery.OutsourcePrice>({
                type: 'query_outsource_price',
                payload: {
                    outsourceId: outsourceId
                }
            })

            setOutsourcePriceList(rs)
            rs && cb && cb()

        } finally {
            setLoading(false)
        }

    }

    const clearOutsourcePrice = () => {
        setOutsourcePrice(undefined)
        setOutsourcePriceList(undefined)
    }

    const loadPricePlace = async () => {
        try {
            setLoading(true)
            const rs = await querySap<domain.delivery.PricePlace>({
                type: 'query_price_place',
                payload: {
                    searchValue: ''
                }
            })

            setPricePlaceList(rs)
        } finally {
            setLoading(false)
        }
    }

    const savePrice = async(outsourceId: number, destCode: string, uom: String, currency: string, type: string,  productTypeId: number, effectiveDate: moment.Moment , expiryDate?: moment.Moment, cb?:() => void) => {
        try{
            setLoading(true)
            const rs = await processSapData({
                action: "save_price",
                payload: {
                    outsourceId: outsourceId,
                    destCode: destCode,
                    uom: uom,
                    currency: currency,
                    type: type,
                    productTypeId: productTypeId,
                    effectiveDate: effectiveDate,
                    expiryDate: expiryDate
                } 
            })

            rs && cb && cb()
        }finally {
            setLoading(false)
        }
    }

    const deletePrice = async(item: domain.delivery.OutsourcePrice, cb?: () => void) => {
        try{
            setLoading(true)
            const rs = await processSapData({
                action : "delete_price",
                payload: {
                  id: item.id
                }
            })
            rs && cb && cb()
        }finally {
            setLoading(false)
        }
    }

    const loadDeliveryItem = async(productTypeId: number) => {
        try{
            setLoading(true)
            const rs = await querySap<domain.delivery.DeliveryItem>({
                type: 'query_delivery_item',
                payload: {
                    productTypeId: productTypeId
                }
            })

            rs && setDeliveryItemList(rs)
        }finally {
            setLoading(false)
        }
    }

    const addPriceItem = async(priceId: number, itemCode: string, unit: number, price: number, cb?: () => void) => {
        try{
            setLoading(true)
            const rs = await processSapData({
                action : "save_price_item",
                payload: {
                    priceId: priceId,
                    itemCode: itemCode,
                    unit: unit,
                    price: price
                }
            })
            rs && cb && cb()
        }finally {
            setLoading(false)
        }
    }

    const deletePriceItem = async(item: domain.delivery.OutsourcePriceItem, cb?:() => void) => {
        try{ 
            setLoading(true)
            const rs = await processSapData({
                action : "delete_price_item",
                payload: {
                  id: item.id
                }
            })
            rs && cb && cb()
        }finally{
            setLoading(false)
        }
    }

    const queryOutsourcePrice = async(docEntry: number)  => {
        try{
            setLoading(true)
            const rs = await querySap<domain.delivery.OutsourcePrice>({
                type: 'query_outsource_price_by_doc_entry',
                payload: {
                    docEntry: docEntry
                }
            })

            rs && setOutsourcePrices(rs)
           
        }finally {
            setLoading(false)
        }
    }

    const getOutsourcePrice = async(id: number) => {
        try{
            setLoading(true)
            const rs = await fetchSap<domain.delivery.OutsourcePrice>({
                type: 'fetch_outsource_price',
                payload: {
                    id: id
                }
            })

            setOutsourcePrice(rs)
            rs && setOutsourcePrice(rs)
        }finally {
            setLoading(false)
        }
    }

    return {
        loading: loading,
        outsourceData: outsourceData,
        outsourcePriceList: outsourcePriceList,
        outsourcePrice: outsourcePrice,
        outsourcePrices: outsourcePrices,
        pricePlaceList: pricePlaceList,
        deliveryItemList: deliveryItemList,
        savePrice: savePrice,
        deletePrice: deletePrice, 
        addPriceItem: addPriceItem, 
        deletePriceItem: deletePriceItem,
        loadOutsource: loadOutsource,
        loadOutsourcePrice: loadOutsourcePrice,
        getOutsourcePrice: getOutsourcePrice,
        queryOutsourcePrice: queryOutsourcePrice, 
        clearOutsourcePrice: clearOutsourcePrice,
        loadPricePlace: loadPricePlace,
        loadDeliveryItem: loadDeliveryItem
    }

}