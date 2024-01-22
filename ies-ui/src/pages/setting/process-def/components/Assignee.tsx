import SearchAccountComp from '@/pages/process-flow/components/SearchAccount';
import { DestSelector, SearchAccount } from '@/services/account/data';
import {
  ApprovalSetup,
  CustomAssignee,
  DestUser,
  SaveFirstLevelAssignee,
} from '@/services/process-workflow/data';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Button, Card, Col, List, Modal, Radio, Row, Tag } from 'antd';
import { uniq, uniqueId } from 'lodash';
import React, { useEffect, useState } from 'react';
import SelectorApproval from './SelectorApproval';

const AssigneeComp: React.FC<{
  assignee?: SaveFirstLevelAssignee;
  onSave: (data: SaveFirstLevelAssignee) => void;
}> = ({ assignee, onSave }) => {
  const [assigneeType, setAssigneeType] = useState<'sa' | 'hod' | 'multi' | 'ori' | 'internal'>('hod');
  const [destSelectorList, setDestSetSelectorList] = useState<(DestSelector & { key: string })[]>(
    [],
  );
  const [customItems, setCustomItems] = useState<ApprovalSetup[]>([]);
  const [defaultAssignee, setDefaultAssignee] = useState<DestUser>();
  const [visibility, setVisibility] = useState<{
    approvalOnly: boolean;
    type: 'user' | 'group' | 'all';
    target: 'setDefaultApprover' | 'addCustomOriginator' | 'setCustomApprover' | 'addApprover';
    selected?: ApprovalSetup;
  }>();

  useEffect(() => {
    if (assignee?.destSelectorList && assignee?.destSelectorList.length > 0) {
      const list = uniq(assignee.destSelectorList.map((it) => it.userId));
      const selectorList = list.map((it) => ({
        approver: it,
        key: uniqueId().toString(),
        selectors:
          assignee.destSelectorList
            ?.filter((i) => i.userId == it)
            .map((it) => ({
              key: uniqueId().toString(),
              selector: it.selectorType,
              operand: it.operand,
              dataType: it.dataType,
              value: it.selectorValue,
              remarks: it.remarks,
            })) || [],
      }));

      setDestSetSelectorList(selectorList);

      setAssigneeType('multi');

      return;
    }

    if (assignee?.originator) {
      setAssigneeType('ori');
      return;
    }

    assignee && setAssigneeType(assignee.departmentHead ? 'hod' : 'sa');

    assignee &&
      !assignee.departmentHead &&
      assignee.defaultAssignee &&
      setDefaultAssignee(assignee.defaultAssignee);

    assignee &&
      assignee.custom &&
      setCustomItems(
        assignee.custom.map((it) => {
          return {
            originator: it.originator,
            assignee: it.assignee,
            candidateGroups: [],
            candidateUsers: [],
            type: 'assignee',
          } as ApprovalSetup;
        }),
      );
    if (assignee?.internal) {
      setAssigneeType('internal')
    }
  }, []);

  useEffect(() => {
    updateData();
  }, [assigneeType, customItems, defaultAssignee, destSelectorList]);

  const updateData = () => {
    const assignee = {
      departmentHead: assigneeType === 'hod',
      originator: assigneeType == 'ori',
      defaultAssignee: defaultAssignee,
      internal: assigneeType == 'internal',
      custom: customItems.map((item) => {
        return {
          originator: item.originator,
          assignee: item.assignee,
        } as CustomAssignee;
      }),
      destSelectorList: destSelectorList.flatMap((it) =>
        it.selectors.map((i) => ({
          userId: it.approver,
          selectorType: i.selector,
          operand: i.operand,
          dataType: i.dataType,
          selectorValue: i.value,
          remarks: i.remarks,
        })),
      ),
    } as SaveFirstLevelAssignee;

    onSave(assignee);
  };

  const onAddedHandler = (item: SearchAccount) => {
    if (visibility?.target === 'setDefaultApprover') {
      setDefaultAssignee({
        userId: item.id,
        userName: item.name,
      } as DestUser);
      setVisibility(undefined);
    } else if (visibility?.target === 'setCustomApprover') {
      setCustomItems([
        ...customItems.map((it) => {
          if (it === visibility?.selected) {
            return {
              ...it,
              assignee: {
                userId: item.id,
                userName: item.name,
              },
            };
          } else {
            return it;
          }
        }),
      ]);

      setVisibility(undefined);
    } else if (visibility?.target == 'addApprover') {
    }
  };

  const remove = (item: ApprovalSetup) => {
    setCustomItems([...customItems.filter((it) => it !== item)]);
  };

  const title = (item: ApprovalSetup) => {
    return (
      <p>
        {item.originator.type === 'group' ? <TeamOutlined /> : <UserOutlined />}
        {item.originator.name}
      </p>
    );
  };

  const selectedItems = () => {
    if (visibility?.target === 'setDefaultApprover') {
      return defaultAssignee
        ? [
          {
            id: defaultAssignee.userId,
            name: defaultAssignee.userName,
            type: 'user',
          } as SearchAccount,
        ]
        : [];
    } else if (visibility?.target === 'addCustomOriginator') {
      return customItems.map((it) => {
        return { ...it.originator } as SearchAccount;
      });
    } else if (visibility?.target === 'setCustomApprover') {
      return visibility?.selected?.assignee
        ? [
          {
            id: visibility?.selected?.assignee.userId,
            name: visibility?.selected?.assignee.userName,
            type: 'user',
          } as SearchAccount,
        ]
        : [];
    }

    return [];
  };

  return (
    <div>
      <Row style={{ height: '30px' }}>
        <Col flex="auto">
          <Radio.Group
            style={{ marginBottom: '20px' }}
            onChange={(e) => {
              setDefaultAssignee(undefined);
              setDestSetSelectorList([]);
              setCustomItems([]);
              setAssigneeType(e.target.value);
            }}
            value={assigneeType}
          >
            <Radio value="hod">Department Head</Radio>
            <Radio value="sa">Single Approver</Radio>
            <Radio value="multi">Mixed Approvers</Radio>
            <Radio value="ori">Originator</Radio>
            <Radio value="internal">Internal</Radio>
          </Radio.Group>
        </Col>
        <Col flex={'50px'}>
          {assigneeType == 'sa' && (
            <Button
              onClick={() =>
                setVisibility({
                  type: 'user',
                  approvalOnly: true,
                  target: 'setDefaultApprover',
                })
              }
              size="small"
              type="link"
              icon={defaultAssignee ? <EditOutlined /> : <PlusCircleOutlined />}
            >
              {defaultAssignee ? defaultAssignee.userName : 'Set Approver'}
            </Button>
          )}
          {assigneeType == 'multi' && (
            <Button
              size="small"
              onClick={() =>
                setVisibility({
                  approvalOnly: true,
                  type: 'user',
                  target: 'addApprover',
                })
              }
              icon={<PlusCircleOutlined />}
              type="link"
            >
              Add Approver
            </Button>
          )}
        </Col>
      </Row>

      {customItems.length > 0 && (
        <Row>
          <Col flex="auto">
            <List<ApprovalSetup>
              style={{ marginTop: '5px' }}
              grid={{ column: 4 }}
              bordered
              dataSource={customItems}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    size="small"
                    title={title(item)}
                    style={{ marginTop: '5px', width: '200px' }}
                    extra={
                      <Button
                        danger
                        size="small"
                        shape="circle"
                        onClick={() => {
                          remove(item);
                        }}
                        icon={<DeleteOutlined />}
                      />
                    }
                  >
                    <p>
                      {item.assignee && item.assignee?.userName}
                      {!item.assignee && (
                        <Button
                          type="link"
                          onClick={() => {
                            setVisibility({
                              type: 'user',
                              approvalOnly: true,
                              target: 'setCustomApprover',
                              selected: item,
                            });
                          }}
                        >
                          Set Approver
                        </Button>
                      )}
                    </p>
                  </Card>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      )}

      {assigneeType == 'multi' && (
        <ProList<DestSelector & { key: string }>
          dataSource={destSelectorList}
          showActions="hover"
          rowKey={(it) => it.approver + uniqueId().toString()}
          metas={{
            title: { dataIndex: 'approver' },
            description: {
              render: (_, r) =>
                r.selectors
                  .map((it) => `${it.selector} (${it.dataType}) ${it.operand} ${it.value}`)
                  .map((it) => <Tag>{it}</Tag>),
            },
            actions: {
              render: (_, r) => [
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDestSetSelectorList((v) => v.filter((it) => it.key != r.key))}
                />,
              ],
            },
          }}
        />
      )}

      {visibility && (
        <Modal
          title="Search"
          width={'1000px'}
          open={visibility?.target != 'addApprover'}
          destroyOnClose
          footer={false}
          onCancel={() => setVisibility(undefined)}
        >
          {visibility && (
            <SearchAccountComp
              type={visibility.type}
              approverOnly={visibility.approvalOnly}
              selected={selectedItems()}
              onAdded={onAddedHandler}
            />
          )}
        </Modal>
      )}

      {visibility?.target == 'addApprover' && (
        <SelectorApproval
          open={true}
          onSave={(appover, selectors) =>
            setDestSetSelectorList((v) => [
              ...v,
              { key: uniqueId().toString(), approver: appover, selectors: selectors },
            ])
          }
          onOpenChange={(visible) => !visible && setVisibility(undefined)}
        />
      )}
    </div>
  );
};

export default AssigneeComp;
