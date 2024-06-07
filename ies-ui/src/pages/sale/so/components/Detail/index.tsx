import { useAccess } from 'umi';
import { CheckOutlined, CloudUploadOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Spin } from 'antd';
import React, { useEffect } from 'react';
import { Model } from '../../model';
import CancelSo from './CancelSo';
import SapPosting from './SapPosting';
import SoFormView from './SoFormView';
import CloseSo from './CloseSo';
import { CloseIndirectSoParams } from '@/services/sale/data';
import { PageContainer, ProForm } from '@ant-design/pro-components';
import OrderFormView from './OrderFormView';


interface Props {
  id?: number;
  openInTab?: true;
  actionHandlers?: {
    onBack?: () => void;
    onEdit?: () => void;
  };
}

const SoDetailView: React.FC<Props> = ({ id, openInTab, actionHandlers }) => {
  const { state, actions, modals } = Model();
  const access = useAccess();
  useEffect(() => {
    try {
      id && actions.fetchSo(id);
    } catch {
      message.error('Failed to load so.');
    }
  }, [id]);

  const onSapPostingHandler = (comment?: string) => {
    if (!id) {
      message.error('So not found.');
      return;
    }
    Modal.confirm({
      title: 'SAP SO Posting',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          const rs = await actions.postSo(id, comment);
          actions.fetchSo(id);
          modals.hideModal('sap-posting');
          message.success(`So has been posted sucessfully. SAP Doc No: ${rs.data}.`);
        } catch (e) {
          const error = e as { error: string; message: string };
          message.error(error.message);
        }
      },
    });
  };

  const onCancelSoHandlers = (remarks: string) => {
    if (!id) {
      message.error('So not found.');
      return;
    }
    Modal.confirm({
      title: 'Cancelling So',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await actions.cancelSo(id, remarks);
          modals.hideModal('cancel-so');
          message.success(`So has been canceled sucessfully.`);
          actions.fetchSo(id);
        } catch (e) {
          const error = e as { error: string; message: string };
          message.error(error.message);
        }
      },
    });
  };

  const onCloseSoHandler = (data: CloseIndirectSoParams) => {
    if (!id) {
      message.error('So cannot be found.');
      return;
    }

    Modal.confirm({
      title: 'Closing So',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await actions.closeSo(id, data);
          modals.hideModal('close-so');
          message.success(`So has been closed sucessfully.`);
          actions.fetchSo(id);
        } catch (e) {
          const error = e as { error: string; message: string };
          message.error(error.message);
        }
      },
    });
  };

  const buttons = [
    <Button
      type="link"
      icon={<StopOutlined />}
      key="cancel"
      onClick={() => modals.showModal('cancel-so')}
    >
      Cancel
    </Button>,
    <Button
      type="link"
      htmlType="button"
      icon={<EditOutlined />}
      onClick={() => actionHandlers?.onEdit?.()}
      key="edit"
    >
      Edit
    </Button>,
    state.data?.soDetail?.invoiceType === 121 && (
      <Button
        type="link"
        htmlType="button"
        onClick={() => modals.showModal('sap-posting')}
        key="sapPosting"
      >
        <CloudUploadOutlined /> SAP Posting
      </Button>
    ),
    state.data?.soDetail?.invoiceType === 122 && (
      <Button
        type="link"
        htmlType="button"
        onClick={() => modals.showModal('close-so')}
        key="close"
      >
        <CheckOutlined /> Close
      </Button>
    ),
  ]

  return (
    <Spin spinning={state.loading}>

      {openInTab ? <>
        <OrderFormView actionButtons={buttons} soDetail={state.data?.soDetail} />
        <SoFormView data={state.data?.soDetail} />
      </> : <PageContainer
        breadcrumb={undefined}
        title={!openInTab && "PO#"}
        subTitle={!openInTab && state.data?.soDetail?.docEntryNum}
        content={<OrderFormView soDetail={state.data?.soDetail} />}
        extra={
          access.canCreateEditSo && !openInTab &&
          ['Pending', 'Failed'].some((it) => it === state.data?.soDetail?.status) && buttons
        }
      >
        <SoFormView data={state.data?.soDetail} />

      </PageContainer>}


      <SapPosting
        open={modals.isVisible('sap-posting')}
        onCancel={() => modals.hideModal('sap-posting')}
        onPosting={onSapPostingHandler}
      />
      <CancelSo
        open={modals.isVisible('cancel-so')}
        onCancel={() => modals.hideModal('cancel-so')}
        onCacelSo={onCancelSoHandlers}
      />

      <CloseSo
        data={{
          distributorId: state.data?.soDetail?.distributor?.id,
        }}
        itemList={state.data?.soDetail?.deliveries || []}
        open={modals.isVisible('close-so')}
        onCancel={() => modals.hideModal('close-so')}
        onCloseSo={onCloseSoHandler}
      />
    </Spin>
  );
};

export default SoDetailView;
