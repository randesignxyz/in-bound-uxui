import { useState } from "react"
import LoadingTimeReport from "./LoadingTimeReport"
import { ModalFormProps } from "@ant-design/pro-components"
import DeliveryTimeReport from "./DeliveryTimeReport"

export type ReportName = 'LOADING_TIME' | 'DELIVERY_TIME'

export type ReportType = {
    type: ReportName,
    props?: ModalFormProps
}


export default ({ report, onClose }: { report?: ReportType, onClose: () => void }) => {
    return <div>
        <LoadingTimeReport open={report?.type == 'LOADING_TIME'} onOpenChange={visible => !visible && onClose()} {...report?.props} />
        <DeliveryTimeReport open={report?.type == 'DELIVERY_TIME'} onOpenChange={visible => !visible && onClose()} {...report?.props} />
    </div>
}