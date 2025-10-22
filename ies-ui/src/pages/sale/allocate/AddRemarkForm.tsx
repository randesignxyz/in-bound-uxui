import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { UploadOutlined } from '@ant-design/icons';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { useAccess } from '@umijs/max';
import { Button, Card, Col, GetProp, Row, Upload, message, Image } from 'antd';
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { UpdateRemarkParams } from './data';
import imageCompression from 'browser-image-compression';

interface Props extends FormModalProps {
    id?: number;
    onSave: (data: UpdateRemarkParams & { fileUrl?: string }) => void;
    remark?: string,
    attachment?: [],
    sales_planid?:number | string
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const AddRemarkModal: React.FC<Props> = ({ onSave, id, remark, attachment,sales_planid, ...props }) => {
    const [form] = useForm<UpdateRemarkParams>();
    const access = useAccess();
    const [file, setFile] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    console.log('id', id)
    const compressImage = async (file: RcFile): Promise<File> => {
        const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };
        return await imageCompression(file, options);
    }
    const handleRemove = (file: UploadFile<any>) => {
        const f = file as RcFile & { thumbUrl?: string };
        if (f.thumbUrl) {
            URL.revokeObjectURL(f.thumbUrl);
        }
        setFile(prev => prev.filter(item => item.uid !== file.uid));
    };

    function toRcFileWithPreview(file: File, uid: string): RcFile & { thumbUrl: string } {
        const rcFile = new File([file], file.name, {
            type: file.type,
            lastModified: file.lastModified,
        }) as RcFile & { thumbUrl: string };

        rcFile.uid = uid;
        rcFile.thumbUrl = URL.createObjectURL(file);

        return rcFile;
    }

    const getBase64 = (file: FileType): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const attachmentsToUploadFiles = (attachments: string[]): UploadFile[] => {
        return attachments.map((url, index) => ({
            uid: `existing-${index}`,
            name: url.split('/').pop() || `file-${index}`,
            status: 'done',
            url,   // just use the url string directly
            originFileObj: undefined,
        }));
    };
    const initFormData = () => {

        form.setFieldsValue({
            attachment: attachment,
            remark: remark
        });
    };

    function getCleanFileNameFromFirebaseUrl(url: string): string {
        const decoded = decodeURIComponent(url)
        const filenameWithParams = decoded.split('/').pop() || '';
        const filename = filenameWithParams.split('?')[0]
        return stripPrefixFromFileName(filename)
    }

    function stripPrefixFromFileName(filename: string): string {
        const parts = filename.split('-');
        if (parts.length > 1) {
            return parts.slice(1).join('-')
        }
        return filename
    }

    useEffect(() => {
        if (props.open) {
            if (attachment && attachment.length > 0) {
                const existingFiles = attachmentsToUploadFiles(attachment);
                setFile(existingFiles);
            } else {
                setFile([]);
            }
            form.resetFields();
            initFormData();
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Add Remark"
            width="600px"
            {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entity = {
                    ...dataForm,
                    id,
                    file,
                    sales_planid,
                    action:"Add Remark",
                    activities_name:"Add Remark"
                    
                };
                onSave?.(entity)
            }}
            onResetForm={() => {
                form.resetFields();
                setFile([]);
            }}
        >
            <Card>
                <ProForm form={form} submitter={false}>
                    <Row gutter={20}>
                        <Col flex={400}>
                            <ProFormTextArea name="remark" label="Remark" />
                        </Col>
                        <Col flex="Auto" />
                    </Row>
                    {/* <Upload
                        listType="picture-card"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt" // adjust as needed
                        beforeUpload={() => false}
                        fileList={file}
                        onRemove={handleRemove}
                        onPreview={handlePreview}
                        onChange={async (info) => {
                            const newFileList = await Promise.all(
                                info.fileList.map(async (file) => {
                                    const originFile = file.originFileObj;

                                    // Skip compression if already compressed or no origin file
                                    if (!originFile || (file as any).isCompressed) return file;

                                    const isImage = originFile.type.startsWith('image/');

                                    if (isImage) {
                                        // Compress image
                                        const compressedFile = await compressImage(originFile as RcFile);
                                        const rcFileWithPreview = toRcFileWithPreview(
                                            compressedFile,
                                            file.uid || `${Date.now()}-${Math.random()}`
                                        );
                                        return {
                                            ...file,
                                            originFileObj: rcFileWithPreview,
                                            name: rcFileWithPreview.name,
                                            thumbUrl: rcFileWithPreview.thumbUrl,
                                            isCompressed: true,
                                        };
                                    }

                                    // For non-images, just return original file
                                    return file;
                                })
                            );

                            setFile(newFileList);
                        }}
                    >
                        <UploadOutlined /> Add image or file
                    </Upload> */}
                    <Upload
                        multiple
                        accept="*"
                        beforeUpload={() => false}
                        fileList={file.map((f) => ({
                            ...f,
                            name: f.url ? getCleanFileNameFromFirebaseUrl(f.url) : stripPrefixFromFileName(f.name),
                        }))}
                        listType="text" // This makes all uploads show as a list
                        onRemove={handleRemove}
                        onPreview={handlePreview}
                        onChange={async (info) => {
                            const newFileList = await Promise.all(
                                info.fileList.map(async (file) => {
                                    if (
                                        file.originFileObj &&
                                        file.type?.startsWith('image/') &&
                                        !(file as any).isCompressed
                                    ) {
                                        const compressedFile = await compressImage(file.originFileObj as RcFile);
                                        const rcFileWithPreview = toRcFileWithPreview(compressedFile, file.uid);
                                        return {
                                            ...file,
                                            originFileObj: rcFileWithPreview,
                                            name: rcFileWithPreview.name,
                                            thumbUrl: undefined,
                                            isCompressed: true,
                                        };
                                    }
                                    return file;
                                })
                            );

                            setFile(newFileList);
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Upload Files / Images</Button>
                    </Upload>


                    {file && (
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

                </ProForm>
            </Card>
        </FormModalComp>
    );
};

export default AddRemarkModal;
