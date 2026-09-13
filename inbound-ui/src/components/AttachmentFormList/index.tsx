import { PaperClipOutlined } from '@ant-design/icons';
import ProForm, { ProFormList, ProFormText } from '@ant-design/pro-form';
import { Button, Space, Upload } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { useRef, useState } from 'react';

export interface AttatchmentInfo {
  id: string;
  fileName: string;
  description?: string;
  
}

interface Props {
  onChange?: (files: AttatchmentInfo[]) => void;
}

export default ({ onChange }: Props) => {
  const ref = useRef<any>();
  const [form] = useForm<{ attachedFiles: AttatchmentInfo[] }>();
  const [removedList, setRemovedList] = useState<string[]>([]);
  const [dataForm, setDataForm] = useState<AttatchmentInfo[]>([]);
  const [uploadData, setUploadData] = useState<UploadChangeParam<UploadFile>>();

  return (
    <ProForm form={form} submitter={false}>
      <ProFormList
        key={'id'}
        alwaysShowItemLabel={false}
        creatorButtonProps={{
          creatorButtonText: 'Attach',
          icon: <PaperClipOutlined />,
        }}
        copyIconProps={false}
        deleteIconProps={{
          tooltipText: 'Delete record',
        }}
        actionGuard={{
          beforeAddRow: (p1) => {
            // setSearcVisible(!p1);
            if (!p1) ref.current?.click();
            return !!p1;
          },
          beforeRemoveRow: (index) => {
            const item = dataForm[index as number];
            setRemovedList(v => [...v, item.id] )
            return true;
          },
        }}
        name={'attachedFiles'}
      >
        {(f, index) => {
          return (
            <Space>
              <ProFormText width={'lg'} name={'fileName'} fieldProps={{ readOnly: true }} />
              <ProFormText width={'xl'} name={'description'} />
            </Space>
          );
        }}
      </ProFormList>
      <Upload
        onChange={(info) => {
          const items = info.fileList.filter(it=> !removedList.some(it1=> it1==it.uid) ).map((it) => ({
            id: it.uid,
            fileName: it.name,
          }));
          setDataForm(items);
          onChange?.(items)
          form.setFieldsValue({
            attachedFiles: items,
          });
          setUploadData(info);
        }}
      >
        <Button ref={ref} />
      </Upload>
    </ProForm>
  );
};
