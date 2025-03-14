import { getUrlReporting } from "@/pages/ReportUrl"
import { downloadGenericReport } from "@/services/apiGateway"
import { simpleRequestActions } from "@/services/model"
import { PrinterOutlined } from "@ant-design/icons"
import { Button, message, Modal, ModalProps, Space, Spin } from "antd"
import moment from "moment"
import { useEffect, useState } from "react"

interface Props extends ModalProps {
    id?: number
}

const base64ToBlob = (base64: string): Blob => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
};
const blobToURL = (blob: Blob): string => {
    return URL.createObjectURL(blob);
};
const POPrintModal: React.FC<Props> = ({ id, ...props }) => {
    const requestActions = simpleRequestActions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const onDowloadReportHandler = async (id?: number) => {
        try {
            // const dataForm = await form.validateFields()
            const reportName = 'stock-request-report-form'
            // setLoading(true)
            const data = await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.pdf`,
                type: 'PDF',
                data: {
                    reportName: reportName,
                    reportPath: getUrlReporting('sale/forms'),
                    data: [
                        { key: 'purchaseId', value: id, type: 'string' },
                    ]
                }

            });
            const pdfBlob = base64ToBlob(data.PDF);
            const url = blobToURL(pdfBlob);
            setPdfUrl(url);
            console.log(data);
        } catch (error: any) {
            message.error(error.message || "Failed to generate report.")
            // setLoading(false)
        }



    }




    useEffect(() => {
        id && onDowloadReportHandler(id)
    }, [props.open, id])
    return (
        <Modal
            {...props}
            title={"Print"}
            footer={<Space>
                <Button
                    icon={<PrinterOutlined />}

                >Print</Button>
            </Space>}
        >
            {pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Viewer"
                />
            ) : (
                <p>No PDF available to display.</p>
            )}
        </Modal>
    )
}

export default POPrintModal