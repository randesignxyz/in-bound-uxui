import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components"
import { AttachmentFile } from '@/services/data';
import { simpleRequestActions } from "@/services/model";
import { getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import { Image, message } from 'antd'
import { useEffect, useState } from "react";

export default ({ fileInfo, ...props }: DrawerFormProps & { fileInfo: AttachmentFile }) => {
    const requestActions = simpleRequestActions();
    const [url, setUrl] = useState<string>()
    const [visible, setVisible] = useState(false)

    const download = async () => {
        try {
            const rs = await getUploadFileObjectUrlV2(requestActions)(fileInfo.id)
            setUrl(rs)
        } catch (error) {
            setUrl(undefined)
            message.error("Failed to load file.")
        }

    }
    useEffect(() => {
        if (visible) {
            download()
        }
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [visible])
    return (<DrawerForm {...props} open={visible} title={fileInfo.fileName} submitter={false} onOpenChange={setVisible} resize={{
        maxWidth: window.innerWidth * 0.8,
        minWidth: 1000,
    }}>
        {url && fileInfo.fileType.includes("application/pdf", 0) && <iframe src={`${url}`} id="viewer"
            style={{
                width: "100%",
                height: "calc(100vh - 120px)",
                border: "none",
            }}
        />}
        {
            url && fileInfo.fileType.includes("image", 0) && <Image src={url} />
        }
    </DrawerForm>)
}