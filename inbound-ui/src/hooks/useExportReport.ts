import { ExportType, ServiceType } from "@/services/API";
import { request } from "@umijs/max";
import { message } from "antd";
import moment from "moment";
import { useState } from "react";

const useExportReport = (service: ServiceType) => {

    const [downloading, setDownloading] = useState<boolean>(false)

    const download = (data: any, fileName: string, type: ExportType, cb?: () => void) => {

        setDownloading(true)
        const blob = request(`/api/export/report/${service.action}/type/${type}`, {
            method: 'POST',
            responseType: 'blob',
            data: data
        })
        blob.then(v => {
            
            const element = document.createElement("a");
            element.href = URL.createObjectURL(v);
            element.download = `${fileName}-${moment().format()}.${type === 'EXCEL' ? 'xls' : 'pdf'}`;
            document.body.appendChild(element);
            element.click();
            // cb && cb()
        }).catch(reason => {
            message.error("Failed to generate report.")
        }).finally(() => setDownloading(false))
    }

    return {
        downloading: downloading,
        download: download
    }
}

export default useExportReport