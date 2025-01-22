import { kc } from "@/auth";
import { getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import { getServiceUrl } from "@/services/ApiUrl"
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { Upload, UploadFile, UploadProps } from "antd"
import { UploadChangeParam } from "antd/lib/upload";
import { CSSProperties, useEffect, useState } from "react";

export default ({ style, onSave, imageId }: { style?: CSSProperties, onSave: (fileId: string) => void, imageId?: string }) => {

    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <UploadOutlined />}
            <div style={{ marginTop: 8 }}>Upload Photo</div>
        </div>
    );

    const token = localStorage.getItem("accessToken")
    const uploadUrl = () => `${getServiceUrl('FILE')}/upload`

    const getFileUrl = async (fileId: string) => {
        return await getUploadFileObjectUrlV2()(fileId)
    }

    const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            const url = await getFileUrl(info.file.response)
            setImageUrl(url)
            setLoading(false);
            onSave(info.file.response)
        }
    };

    useEffect(() => {
        imageId && getFileUrl(imageId).then(setImageUrl)
    }, [imageId])
    return <Upload
        headers={
            token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        }
        listType="picture-card"
        className="avatar-uploader"
        action={uploadUrl()}
        onChange={handleChange}
        showUploadList={false}

    >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={style || { width: '100%' }} /> : uploadButton}
    </Upload>

}