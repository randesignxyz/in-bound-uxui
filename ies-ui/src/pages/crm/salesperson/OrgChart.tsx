// OrgChart.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './OrgChart.css';

interface Employee {
  id: number;
  name: string;
  title: string;
  image?: string; // URL or path to employee image;
  path?:string;
  subordinates?: Employee[];
}

interface OrgChartNodeProps {
  employee: Employee;
  level: number;
}

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ employee, level }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (e.type === 'click') {
      // alert(`Left Click - Employee Details:\nName: ${employee.name}\nTitle: ${employee.title}`);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // alert(`Right Click - Employee Details:\nName: ${employee.name}\nTitle: ${employee.title}`);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // alert(`Double Click - Employee Details:\nName: ${employee.name}\nTitle: ${employee.title}`);
  };

  return (
    <div 
      className={`org-node level-${level}`}
      onClick={handleClick}
      onContextMenu={handleRightClick} // Right-click handler
      onDoubleClick={handleDoubleClick} // Double-click handler
    >
      <div className="employee-container">
        <div className="employee-photo">
          <img src={!employee?.image?"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcazeHuAcZDzv4_61fPLT-S00XnaKXch2YWQ&s":employee?.image} alt={`${employee?.name}'s photo`} />
        </div>
        <div className="employee-card">
          <h3>{employee?.name}</h3>
          <p>{employee?.title}</p>
        </div>
      </div>
      {employee?.subordinates && employee?.subordinates.length > 0 && (
        <div className="subordinates">
          {employee.subordinates?.map((subordinate) => (
            <OrgChartNode 
              key={subordinate.path} 
              employee={subordinate} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OrgChartProps {
  data: Employee;
}

const OrgChart: React.FC<OrgChartProps> = ({ data }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();

  // Smoothly update position using requestAnimationFrame
  const updatePosition = useCallback((newPosition: { x: number; y: number }) => {
    if (!chartRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const chartRect = chartRef.current.getBoundingClientRect();

    // Allow movement anywhere within the container (no strict boundaries)
    setPosition(newPosition);
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle mouse move for dragging with requestAnimationFrame
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !chartRef.current || !containerRef.current) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Use requestAnimationFrame for smooth updates
    cancelAnimationFrame(animationFrameId.current!);
    animationFrameId.current = requestAnimationFrame(() => {
      updatePosition({ x: newX, y: newY });
    });
  }, [isDragging, dragStart, updatePosition]);

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    cancelAnimationFrame(animationFrameId.current!);
  };

  // Handle mouse leave to stop dragging if mouse leaves the container
  const handleMouseLeave = () => {
    setIsDragging(false);
    cancelAnimationFrame(animationFrameId.current!);
  };

  // Handle wheel (scroll) for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001; // Adjust zoom speed
    setZoomLevel((prev) => {
      const newZoom = Math.max(0.1, Math.min(2, prev + zoomDelta)); // Limit zoom 50% to 200%
      return newZoom;
    });
  };

  // Reset zoom and position
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Add event listeners for drag movement
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId.current!);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div 
      className="org-chart-container" 
      ref={containerRef}
      onWheel={handleWheel}
    >
      <div className="zoom-controls">
        <button onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.1))}>-</button>
        <button onClick={handleResetZoom}>Reset</button>
        <button onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.1))}>+</button>
      </div>
      <div 
        className="org-chart-wrapper"
        ref={chartRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center',
          transition: 'transform 0.1s ease-out', // Smooth transition for movement
        }}
      >
        <OrgChartNode employee={data} level={0} />
      </div>
    </div>
  );
};

export default OrgChart;