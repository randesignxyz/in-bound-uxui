import { getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import { Image } from 'antd';

interface Props extends DrawerFormProps {
    onClose: () => void;
    attachment?: Attachment
}
const QuickViewFile: React.FC<Props> = ({ onClose, attachment, ...props }) => {
    const fetchBlob = async () => {
        if (attachment) {
            const blob = await getUploadFileObjectUrlV2()(attachment?.fileId || "");
            setPdfUrl(blob);
        }
    }
    useEffect(() => {
        props.open && fetchBlob();
    }, [props.open]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const onCheckImageExtension = (fileType?:string) =>{
        return fileType?.split('/')[0] == "image";
    }
    return (
        <>
            <DrawerForm
                {...props}
                drawerProps={{
                    onClose: onClose
                }}
                resize={{
                    onResize() {
                    },
                    maxWidth: window.innerWidth * 0.8,
                    minWidth: 700,
                  }}
                submitter={false}
                title={attachment?.fileName}
            >
                {onCheckImageExtension(attachment?.fileType) && <Image src={pdfUrl ||""} /> ||
                <iframe src={`${pdfUrl}`} id="viewer"
                    style={{
                        width: "100%",
                        height: "90vh"
                    }}
                />
                }
            </DrawerForm>
        </>
    )
}
export default QuickViewFile