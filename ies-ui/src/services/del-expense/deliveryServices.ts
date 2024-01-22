
import { RequestActions } from "../apiGateway";
import { processSapData } from "../shared/dataProcessing";
import { querySap } from "../shared/queryData";
import { Pagination } from "../shared/data";
import { DeliveryCost, SaveInvoiceItem } from "./data";


export namespace DeliveryServiceAPI {

    export const findDeliveryNotes = (actions?: RequestActions) => {
        return async (params: any, pagination?: Pagination) => {
            try {
                actions?.start?.()
                const rs = await querySap<DeliveryCost>({
                    type: 'query_delivery_cost',
                    payload: {
                        ...params
                    },
                    paging: {
                        page: pagination?.page || 0,
                        pageSize: pagination?.pageSize || 20
                    }
                })
                actions?.end?.('SUCCESS')
                return rs

            } catch (error) {
                actions?.end?.('FAILED', '')
                throw error
            }
        }
    }

    export const getClaimed = (actions?: RequestActions) => {
        return async (params: any) => {
            try {
                actions?.start?.()
                const rs = await querySap<DeliveryCost>({
                    type: 'query_delivery_cost_all',
                    payload: {...params}
                })
                actions?.end?.('SUCCESS')
                return rs
            } catch (error) {
                actions?.end?.('FAILED', '')
                throw error
            }
        }
    }


    export const deliveryClaimed = (actions?: RequestActions) => {
        return async (invoiceId: number, data: SaveInvoiceItem) => {

            try {
                actions?.start?.()

                await processSapData({
                    action: 'save_invoice_single_item',
                    payload: {
                        invoiceId: invoiceId,
                        invoiceItem: data
                    }
                })

                actions?.end?.('SUCCESS')
                
            } catch (error) {
                actions?.end?.('FAILED', '')
                throw error
            }

        }
    }

    export const deliveryMultiClaimed = (actions?: RequestActions) => {
        return async (invoiceId: number, docEntryList: number[]) => {

            try {
                actions?.start?.()

                await processSapData({
                    action: 'save_invoice_multi_items',
                    payload: {
                        invoiceId: invoiceId,
                        docEntryList: docEntryList
                    }
                })

                actions?.end?.('SUCCESS')
                
            } catch (error) {
                actions?.end?.('FAILED', '')
                throw error
            }

        }
    }

    export const deliveryClaimedAll = (actions?: RequestActions) => {
        return async (invoiceId: number, docEntryList: number[]) => {
            try {
                actions?.start?.()

                await processSapData({
                    action: 'save_invoice_multi_items',
                    payload: {
                        invoiceId: invoiceId,
                        docEntryList: docEntryList
                    }
                })
                actions?.end?.('SUCCESS')
            }catch (error) {
                actions?.end?.('FAILED', '')
                throw error
            }
        }
    }

}