import { useState } from "react"
import LoadingTimeReport from "./LoadingTimeReport"
import { ModalFormProps } from "@ant-design/pro-components"

export type ReportName = 'LOADING_TIME'
export type ReportType = {
    type: ReportName,
    props?: ModalFormProps
}


export default ({ report, onClose }: { report?: ReportType, onClose: () => void }) => {
    return <div>
        <LoadingTimeReport open={report?.type == 'LOADING_TIME'} onOpenChange={visible => !visible && onClose()} {...report?.props} />
    </div>
}