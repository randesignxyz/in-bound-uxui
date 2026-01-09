import { CloseIndirectSoParams } from '@/services/sale/data';
import { CheckOutlined, CloudUploadOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Modal, Spin, message } from 'antd';
import React, { useEffect } from 'react';
import { useAccess } from 'umi';
import { Model } from '../../model';
import CancelSo from './CancelSo';
import CloseSo from './CloseSo';
import OrderFormView from './OrderFormView';
import SapPosting from './SapPosting';
import SoFormView from './SoFormView';
import { AllocateServiceAPI } from '@/pages/delivery/allocate/service';
import { simpleRequestActions } from '@/services/model';

interface Props {
  id?: number;
  openInTab?: true;
  actionHandlers?: {
    onBack?: () => void;
    onEdit?: () => void;
  };
}

const SoDetailView: React.FC<Props> = ({ id, openInTab, actionHandlers }) => {
  const requestActions = simpleRequestActions();
  const { state, actions, modals } = Model();
  const access = useAccess();
  useEffect(() => {
    try {
      if (id) {
        actions.fetchSo(id);
        actions.fetchOfferCodes(id);
      }
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
          // const rs = await actions.postSoNew(id, comment);
          await AllocateServiceAPI(requestActions).syncAllocate();
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

  const getOfferItems = () => {
    const checking = (id: number) =>
      state.data?.offerCodes?.reduce((o, e) => {
        if (e.itemsIds.findIndex((it) => it === id) > -1) o.push(e.offerCode);
        return o;
      }, new Array<string>());

    return (
      state.data?.soDetail?.items?.filter(
        (e) => e.type !== 'STD' && (checking(e.itemId)?.length ?? 0) > 0,
      ) ?? []
    );
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
  ];

  return (
    <Spin spinning={state.loading}>
      {openInTab ? (
        <>
          <OrderFormView actionButtons={buttons} soDetail={state.data?.soDetail} />
          <SoFormView data={state.data?.soDetail} />
        </>
      ) : (
        <PageContainer
          breadcrumb={undefined}
          title={!openInTab && 'PO#'}
          subTitle={!openInTab && state.data?.soDetail?.docEntryNum}
          content={
            <OrderFormView
              soDetail={state.data?.soDetail}
              {...(access.canCreateEditSo ? { actionButtons: buttons } : {})}
            />
          } extra={
            access.canCreateEditSo &&
            !openInTab &&
            ['Pending', 'Failed'].some((it) => it === state.data?.soDetail?.status) &&
            buttons
          }
        >
          <SoFormView data={state.data?.soDetail} />
        </PageContainer>
      )}

      <SapPosting
        open={modals.isVisible('sap-posting')}
        onCancel={() => modals.hideModal('sap-posting')}
        onPosting={onSapPostingHandler}
        items={getOfferItems() ?? []}
        offerCodes={state.data?.offerCodes ?? []} //
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
