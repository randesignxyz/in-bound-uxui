import { DrawerForm, DrawerFormProps, ProCard } from '@ant-design/pro-components';
import dagre from '@dagrejs/dagre';
import { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowNodeType } from './data';
import { createFlowService } from './services';

export default ({
  type,
  fromId,
  ...props
}: DrawerFormProps & { type: FlowNodeType; fromId: number }) => {
  const srv = createFlowService();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'LR' });

  const nodeWidth = 172;
  const nodeHeight = 36;

  const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  const initData = async () => {
    const rs = await srv.fetch(type, fromId);
    if (rs.nodes.length <= 0) return;
    const nodes = rs.nodes.map((it) => {
      const hasLeft = rs.edges.some((it1) => it1.target == it.id);
      const hasRight = rs.edges.some((it1) => it1.source == it.id);
      console.log(rs.edges, it, hasLeft, hasRight);

      return {
        id: it.id,
        type: !hasLeft ? 'input' : !hasRight ? 'output' : undefined,
        data: { label: it.data.label },
        position: { x: 0, y: 0 },
        style: { background: it.current ? '#b3ffc6' : undefined },

        sourcePosition: it.sourcePosition,
        targetPosition: it.targetPosition,
      };
    });

    const edges = rs.edges.map((it) => ({
      id: it.id,
      source: it.source,
      target: it.target,
      animated: it.animated,
    }));
    const layout = getLayoutedElements(nodes, edges, 'LR');

    // const maxRow = _.max(rs.nodes.map((it) => it.seq)) || 0;
    // const middle = _.divide(maxRow, 2);

    setEdges(layout.edges);

    setNodes(layout.nodes);
  };

  useEffect(() => {
    if (!props.open) {
      return;
    }
    initData();

    // setNodes([`
    //   {
    //     id: '1',
    //     type: 'input',`
    //     data: { label: 'An input node' },
    //     position: { x: 0, y: 50 },
    //     style: { background: '#b3ffc6' },
    //     sourcePosition: Position.Right,
    //   },
    //   //   {
    //   //     id: '2',
    //   //     type: 'selectorNode',
    //   //     data: { onChange: onChange, color: initBgColor },
    //   //     style: { border: '1px solid #777', padding: 10 },
    //   //     position: { x: 300, y: 50 },
    //   //     targetPosition: Position.Left,
    //   //     sourcePosition: Position.Right,
    //   //   },
    //   {
    //     id: '3',
    //     type: 'output',

    //     data: { label: 'Output A' },
    //     position: { x: 250, y: 25 },

    //     targetPosition: Position.Left,
    //     sourcePosition: Position.Right,
    //   },
    //   {
    //     id: '4',
    //     type: 'output',
    //     data: { label: 'Output B' },
    //     position: { x: 250, y: 100 },
    //     targetPosition: Position.Left,
    //   },
    // ]);

    // setEdges([
    //   {
    //     id: 'e1-2',
    //     source: '1',
    //     target: '3',

    //     animated: true,
    //     style: { stroke: '#fff' },
    //   },
    //   {
    //     id: 'e2a-3',
    //     source: '1',
    //     target: '3',
    //     sourceHandle: 'a',
    //     // animated: true,
    //     // style: { stroke: '#fff' },
    //   },
    //   {
    //     id: 'e2b-4',
    //     source: '1',
    //     target: '4',
    //     sourceHandle: 'b',
    //     animated: true,
    //     // style: { stroke: '#fff' },
    //   },
    // ]);
  }, [props.open]);

  return (
    <DrawerForm
      resize={{
        minWidth: 1000,
        maxWidth: window.innerWidth * 0.95,
      }}
      submitter={false}
      title="View Flow"
      {...props}
    >
      {!srv.request.request?.loading && (
        <ProCard style={{ height: window.innerHeight - 80 }}>
          <ReactFlow
            fitView
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            // onEdgesChange={onEdgesChange}
            //   onConnect={onConnect}
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </ProCard>
      )}
    </DrawerForm>
  );
};
