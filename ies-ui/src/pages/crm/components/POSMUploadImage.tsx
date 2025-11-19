import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { PlusOutlined } from "@ant-design/icons";
import { Upload, Image, Space } from "antd";
import { useState } from "react";
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { getServiceUrl } from "@/services/ApiUrl";

interface Props extends FormModalProps {
    service: 'FILE',
    onSave: (data: string[]) => void,
    editable?: boolean
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
const POSMUploadImage: React.FC<Props> = ({ service, onSave, editable = false, ...props }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const token = localStorage.getItem('accessToken');
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };
    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button" disabled={!editable}>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );
    const uploadUrl = () => {
        if ((service = 'FILE')) {
            return `${getServiceUrl('FILE')}/upload`;
        } else {
            return `${getServiceUrl('WORK_FLOW')}/uploader/upload`;
        }
    };
    return (
        <FormModalComp
            {...props}
            title="POSM Image"
            onSubmit={() => {
                const dataResponse = fileList.map((o) => o.response)
                onSave(dataResponse);
            }}
        >
            <Space wrap>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    accept="image/*"
                    action={uploadUrl()}
                    headers={
                        token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}
                    }
                    multiple
                    onPreview={handlePreview}
                    onChange={handleChange}
                >
                    {uploadButton}
                </Upload>
                {previewImage && (
                    <Image
                        wrapperStyle={{ display: 'none' }}
                        preview={{
                            visible: previewOpen,
                            onVisibleChange: (visible) => setPreviewOpen(visible),
                            afterOpenChange: (visible) => !visible && setPreviewImage(''),
                        }}
                        src={previewImage}
                    />
                )}
            </Space>
        </FormModalComp>
    )
}
export default POSMUploadImage