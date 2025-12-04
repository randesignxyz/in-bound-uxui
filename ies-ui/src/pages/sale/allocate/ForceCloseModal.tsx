import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { UploadOutlined } from '@ant-design/icons';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { useAccess } from '@umijs/max';
import { Button, Card, Col, GetProp, Row, Upload, message, Image } from 'antd';
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { UpdateRemarkParams } from '@/pages/delivery/allocate/data';
import imageCompression from 'browser-image-compression';

interface Props extends FormModalProps {
    id?: number;
    onSave: (data: UpdateRemarkParams & { fileUrl?: string }) => void;
    remark?: string,
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const ForceColseModal: React.FC<Props> = ({ onSave, id, remark, ...props }) => {
    const [form] = useForm<UpdateRemarkParams>();
    const access = useAccess();
    const [file, setFile] = useState<UploadFile[]>([]);
   
     useEffect(() => {
        if (props.open) {
            form.resetFields()
        }
    }, [props.open]);

    return (
        <FormModalComp
            title="Force Close"
            width="600px"
            {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entity = {
                    ...dataForm,
                    id,
                    action:"Force Close",
                    activities_name:"Force Close",
                    status:"force-close"
                }
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
                            <ProFormTextArea name="remark" label="Remark" rules={[{ required: true }]}/>
                        </Col>
                        <Col flex="Auto" />
                    </Row>
                </ProForm>
            </Card>
        </FormModalComp>
    );
};

export default ForceColseModal;
