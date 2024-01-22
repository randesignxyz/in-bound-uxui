import React, { useState, useEffect } from 'react';
import { Row, Col, Checkbox, Tag, Button, Modal, List, Card } from 'antd';

import { TeamOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ApprovalSetup,
  CustomCandidateUser,
  DestUser,
  SaveFirstLevelCandidateUser,
} from '@/services/process-workflow/data';
import { SearchAccount } from '@/services/account/data';
import SearchAccountComp from '@/pages/process-flow/components/SearchAccount';

const title = (item: ApprovalSetup) => {
  return (
    <p>
      {item.originator.type === 'group' ? <TeamOutlined /> : <UserOutlined />}
      {item.originator.name}
    </p>
  );
};

const CandidateUserComp: React.FC<{
  candidateUser?: SaveFirstLevelCandidateUser;
  onSaveHandler: (data: SaveFirstLevelCandidateUser) => void;
}> = ({ candidateUser, onSaveHandler }) => {
  const [approverList, setApproverList] = useState<DestUser[]>([]);
  const [customItems, setCustomItems] = useState<ApprovalSetup[]>([]);
  const [includingHoD, setIncludingHoD] = useState(false);
  const [visibility, setVisibility] = useState<{
    type: 'user' | 'group' | 'all';
    target: 'addDefaultCandidates' | 'addCustomOriginators' | 'addCustomCandidates';
    selected?: ApprovalSetup;
    approvalOnly: boolean;
  }>();

  useEffect(() => {
    candidateUser && candidateUser.includingDeptHead && setIncludingHoD(true);
    candidateUser && setApproverList(candidateUser.candidates);
    candidateUser &&
      candidateUser.custom &&
      setCustomItems(
        candidateUser.custom.map((it) => {
          return {
            originator: it.originator,
            assignee: undefined,
            candidateGroups: [],
            candidateUsers: it.candidates,
            type: 'candidateUsers',
          } as ApprovalSetup;
        }),
      );
  }, [candidateUser]);

  useEffect(() => {
    updateData();
  }, [includingHoD, approverList, customItems]);

  const onAddedHandler = (item: SearchAccount) => {
    if (visibility?.target === 'addDefaultCandidates') {
      setApproverList([...approverList, { userId: item.id, userName: item.name } as DestUser]);
    } else if (visibility?.target === 'addCustomOriginators') {
      setCustomItems([
        ...customItems,
        {
          originator: {
            ...item,
          },
          candidateUsers: [],
          candidateGroups: [],
          type: 'candidateUsers',
        },
      ]);
    } else if (visibility?.target === 'addCustomCandidates') {
      const items = [
        ...customItems.map((it) =>
          it.originator.id === visibility?.selected?.originator.id &&
          it.originator.type === visibility?.selected?.originator.type
            ? {
                ...it,
                candidateUsers: [...it.candidateUsers, { userId: item.id, userName: item.name }],
              }
            : it,
        ),
      ];
      setCustomItems(items);
    }
  };

  const remove = (item: ApprovalSetup) => {
    setCustomItems([...customItems.filter((it) => it !== item)]);
  };

  const removeDefaultCandidate = (item: DestUser) => {
    setApproverList([...approverList.filter((it) => it !== item)]);
  };

  const removeCustomerCandidate = (item: ApprovalSetup, candidate: DestUser) => {
    const items = [
      ...customItems.map((it) =>
        it.originator.id === item.originator.id && it.originator.type === item.originator.type
          ? {
              ...it,
              candidateUsers: [...it.candidateUsers.filter((c) => c.userId !== candidate.userId)],
            }
          : it,
      ),
    ];
    setCustomItems(items);
  };

  const selectedItems = (): SearchAccount[] => {
    if (visibility?.target === 'addDefaultCandidates') {
      return [
        ...approverList.map((item) => {
          return { id: item.userId, name: item.userName, type: 'user' } as SearchAccount;
        }),
      ];
    } else if (visibility?.target === 'addCustomOriginators') {
      return [
        ...customItems.map((item) => {
          return { ...item.originator } as SearchAccount;
        }),
      ];
    } else if (visibility?.target === 'addCustomCandidates') {
      // return [
      //     ...(visibility.data.selected?.candidateUsers || []).map(item => {
      //         return {
      //             id: item.userId,
      //             name: item.userName,
      //             type: 'user',
      //             description: ''
      //         } as SearchAccount
      //     })
      // ]
    }
    return [];
  };

  const updateData = () => {
    const data = {
      includingDeptHead: includingHoD,
      candidates: approverList,
      custom: customItems.map((item) => {
        return {
          originator: item.originator,
          candidates: item.candidateUsers,
        } as CustomCandidateUser;
      }),
    } as SaveFirstLevelCandidateUser;

    onSaveHandler(data);
  };

  return (
    <div>
      <Row style={{ height: '30px' }}>
        <Col flex="auto">
          <Checkbox checked={includingHoD} onChange={(e) => setIncludingHoD(e.target.checked)}>
            {' '}
            Including Department Head{' '}
          </Checkbox>
        </Col>
      </Row>
      <Row>
        <Col flex="auto">
          {approverList.length === 0 && (
            <Button
              type="link"
              onClick={() => {
                setVisibility({
                  approvalOnly: true,
                  type: 'user',
                  target: 'addDefaultCandidates',
                });
              }}
            >
              Set Approvers
            </Button>
          )}
          <>
            {approverList &&
              approverList.map((item) => (
                <Tag
                  closable
                  onClose={() => removeDefaultCandidate(item)}
                  key={`default-user-${item.userId}`}
                >
                  <UserOutlined />
                  {item.userName}
                </Tag>
              ))}
          </>
          {approverList.length > 0 && (
            <Button
              type="link"
              onClick={() => {
                setVisibility({
                  approvalOnly: true,
                  type: 'user',
                  target: 'addDefaultCandidates',
                });
              }}
            >
              Add
            </Button>
          )}
        </Col>
        <Col flex={'50px'}>
          <Button
            type="link"
            onClick={() => {
              setVisibility({
                approvalOnly: false,
                type: 'user',
                target: 'addCustomOriginators',
              });
            }}
          >
            {' '}
            Add Overwrite
          </Button>
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
                      {item.candidateUsers.length > 0 && (
                        <>
                          {item.candidateUsers.map((it) => {
                            return (
                              <Tag
                                closable
                                onClose={() => removeCustomerCandidate(item, it)}
                                key={`custom-user-${it.userId}`}
                              >
                                {' '}
                                {it.userName}{' '}
                              </Tag>
                            );
                          })}
                        </>
                      )}

                      {item.candidateUsers.length === 0 && (
                        <Button
                          type="link"
                          onClick={() => {
                            setVisibility({
                              type: 'user',
                              target: 'addCustomCandidates',
                              approvalOnly: true,
                              selected: item,
                            });
                          }}
                        >
                          Add Candidate
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

      <Modal
        title="Search"
        width={'1000px'}
        open={!!visibility}
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
    </div>
  );
};

export default CandidateUserComp;
