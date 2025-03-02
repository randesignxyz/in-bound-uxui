import { UserAddOutlined, UserSwitchOutlined, UserDeleteOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Divider, Dropdown, Input, MenuProps, Modal, Space, Tree, Typography } from "antd";
import { DataNode } from "antd/es/tree";
import { useCallback, useMemo, useState } from "react";
import { simpleRequestActions } from "@/services/model";

interface Props {
  data?: SalespersonOrg[];
}

interface SalesOrgDataNode extends DataNode {
  key: number;
  title: string;
  position?: string;
  saleId?: number;
  children?: SalesOrgDataNode[];
  isMatch?: boolean;
}

const buildTree = (data: SalespersonOrg[] = []): SalesOrgDataNode[] => {
  const nodeMap = new Map<number, SalesOrgDataNode>();
  const tree: SalesOrgDataNode[] = [];

  data.forEach(item => {
    nodeMap.set(item.id, {
      key: item.id,
      title: `${item.name || 'Unnamed'} (${item.empNo})`,
      position: item.position,
      saleId: item.saleId,
      children: [],
    });
  });

  data.forEach(item => {
    const node = nodeMap.get(item.id)!;
    if (item.parentId === null) {
      tree.push(node);
    } else {
      const parentNode = Array.from(nodeMap.values()).find(
        n => nodeMap.get(n.key)?.saleId === item.parentId
      );
      if (parentNode?.children) {
        parentNode.children.push(node);
      } else {
        tree.push(node);
      }
    }
  });

  return tree;
};

const filterTree = (nodes: SalesOrgDataNode[], query: string): SalesOrgDataNode[] => {
  if (!query.trim()) return [...nodes];
  
  const lowerQuery = query.toLowerCase();
  return nodes
    .map(node => ({
      ...node,
      children: node.children ? filterTree(node.children, query) : [],
    }))
    .filter(node => {
      const matches = node.title.toLowerCase().includes(lowerQuery);
      return matches || (node.children?.length ?? 0) > 0;
    })
    .map(node => ({
      ...node,
      isMatch: node.title.toLowerCase().includes(lowerQuery),
    }));
};

const getAllKeys = (nodes: SalesOrgDataNode[]): number[] =>
  nodes.reduce((keys, node) => {
    keys.push(node.key);
    if (node.children) keys.push(...getAllKeys(node.children));
    return keys;
  }, [] as number[]);

export default ({ data }: Props) => {
  const requestAction = simpleRequestActions();
  const [salespersonState, setSalespersonState] = useState<{
    visible?: { name: "MODAL"; payloads?: SalespersonOrg };
  }>();
  const originalTree = useMemo(() => buildTree(data), [data]);
  const allKeys = useMemo(() => getAllKeys(originalTree), [originalTree]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filteredTree = useMemo(() => filterTree(originalTree, searchQuery), [originalTree, searchQuery]);
  const filteredKeys = useMemo(() => getAllKeys(filteredTree), [filteredTree]);
  const [expandedKeys, setExpandedKeys] = useState<number[]>(allKeys);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Default zoom level is 1 (100%)

  const itemsAction = useCallback((item: SalesOrgDataNode): MenuProps["items"] => [
    { key: "add", label: "Add Subordinate", icon: <UserAddOutlined /> },
    { key: "move", label: "Move", icon: <UserSwitchOutlined /> },
    { type: "divider" },
    { key: "remove", label: "Remove", danger: true, icon: <UserDeleteOutlined /> },
  ], []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setExpandedKeys(value ? getAllKeys(filterTree(originalTree, value)) : allKeys);
  }, [allKeys, originalTree]);

  const handleExpandAll = useCallback(() => {
    setExpandedKeys(searchQuery ? filteredKeys : allKeys);
  }, [allKeys, filteredKeys, searchQuery]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys([]);
  }, []);

  const onExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys as number[]);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2)); // Max zoom: 200%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Min zoom: 50%
  }, []);

  const titleRender = useCallback((item: SalesOrgDataNode) => {
    const styleMap = {
      SE: { border: "#e9925a", bg: "#e9925a" },
      Auditor: { border: "#41c7c8", bg: "#41c7c8" },
      default: { border: "#4081fd", bg: "#4081fd" },
    };
    const { border, bg } = styleMap[item.position as keyof typeof styleMap] || styleMap.default;

    return (
      <Dropdown
        trigger={["contextMenu"]}
        menu={{ items: itemsAction(item), style: { width: 200, float: "right" } }}
      >
        <div style={{
          marginTop: 10,
          borderRadius: 5,
          padding: "2px 5px",
          backgroundColor: "white",
          border: `1px solid ${border}`,
          borderTop: `3px solid ${border}`,
        }}>
          <Space align="baseline">
            <Avatar style={{ backgroundColor: bg, verticalAlign: "middle" }} size={24} gap={0}>
              {item.title?.charAt(0)}
            </Avatar>
            <Typography.Title level={5}>{item.title}</Typography.Title>
            <Typography.Text type="secondary">{item.position}</Typography.Text>
          </Space>
        </div>
      </Dropdown>
    );
  }, [itemsAction]);

  return (
    <Card
      title={
        <Space direction="horizontal">
          <Input.Search
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
            allowClear
            style={{ width: 200 }}
          />
          <Button onClick={handleExpandAll}>Expand All</Button>
          <Button onClick={handleCollapseAll}>Collapse All</Button>
          <Button onClick={handleZoomIn} icon={<ZoomInOutlined />} />
          <Button onClick={handleZoomOut} icon={<ZoomOutOutlined />} />
        </Space>
      }
      headStyle={{ position: "sticky", top: 0, zIndex: 1, background: "#fff" }}
      bodyStyle={{ paddingTop: 0 }}
    >
      <Divider style={{ margin: "16px 0" }} />
      <div style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: "top left", 
        transition: "transform 0.3s ease",
        maxHeight: "70vh", 
        overflow: "auto",
        msOverflowStyle: "none", // Hide scrollbar in IE and Edge
        scrollbarWidth: "none", // Hide scrollbar in Firefox
      }}>
        <style>{`
          div::-webkit-scrollbar {
            display: none; // Hide scrollbar in Chrome, Safari, and Opera
          }
        `}</style>
        <Tree
          showLine
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          itemHeight={64}
          treeData={filteredTree}
          titleRender={titleRender}
        />
      </div>
      <Modal
        title="Salesperson"
        open={salespersonState?.visible?.name === "MODAL"}
        onCancel={() => setSalespersonState({ visible: undefined })}
      >
        <Typography.Text>Please Select Salesperson</Typography.Text>
      </Modal>
    </Card>
  );
};