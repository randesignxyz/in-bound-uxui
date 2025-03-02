import { OrganizationChart, RCNode } from '@ant-design/charts';
import React, { useEffect } from 'react';

const { OrganizationChartNode } = RCNode;

interface Props{
    data:any[];
    dir:"horizontal"|"vertical"
}

const DemoOrganizationChart = ({data, dir}:Props) => {

return <OrganizationChart 
    padding={[40, 0, 0, 120]}
    autoFit={"view"}
    data={data}
    height={600}
    direction={dir}
    node={{
        style: {
            component: (d) => {
              const { name, position, status } = d.data || {};
              const isActive = d.states?.includes('active');
              return <OrganizationChartNode name={name} position={position} status={
                position=="SE"?"offline"
                :position=="Auditor"?"busy"
                :"online"
              } isActive={isActive} />;
            },
            size: [240, 80],
          },
    }}
    edge={{
        style: {
            radius: 16,
            lineWidth: 2,
            endArrow: true,
          },
    }}
    layout={ {
        type: 'antv-dagre',
        nodesep: 24,
        ranksep: 50,
      }}
      transforms={ (prev) => [
            ...prev.filter((transform) => transform.type !== 'collapse-expand-react-node'),
            {
              ...prev.find((transform) => transform.type === 'collapse-expand-react-node'),
              enable: true,
              iconOffsetY: 34,
            },
          ]
      }
  />;
};

export default DemoOrganizationChart