import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Define static objects outside component to avoid recreation
const edgeStyle = { stroke: '#64748b', strokeWidth: 2 };
const markerEnd = {
  type: 'arrowclosed',
  color: '#64748b',
};
const nodeStyle = {
  background: '#ffffff',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  padding: '10px',
  minWidth: '120px',
  minHeight: '60px',
};

const GraphVisualization = ({ yarray }) => {
  const [inputNodes, setInputNodes] = useState([]);

  useEffect(() => {
    if (!yarray) return

    const updateNodes = () => {
      const arrayData = yarray.toArray ? yarray.toArray() : yarray.toJSON();
      console.log('Graph nodes updated:', arrayData);
      setInputNodes(arrayData)
    }

    updateNodes()
    yarray.observe(updateNodes)

    return () => {
      yarray.unobserve(updateNodes)
    }
  }, [yarray])

  const { nodes, edges } = useMemo(() => {
    console.log('Processing nodes:', inputNodes);
    if (!inputNodes || !Array.isArray(inputNodes)) {
      console.log('No valid inputNodes, returning empty arrays');
      return { nodes: [], edges: [] };
    }

    // Force-directed layout simulation
    const forceLayout = (nodes, edges, width = 2000, height = 2000) => {
      const nodePositions = new Map();
      const nodeCount = nodes.length;
      
      // Initialize deterministic positions
      nodes.forEach((node, index) => {
        const hash = node.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        nodePositions.set(node.id, {
          x: (Math.abs(hash) % width) + (index * 100) % width,
          y: (Math.abs(hash >> 16) % height) + (index * 150) % height,
          vx: 0,
          vy: 0
        });
      });

      // Simple force simulation
      for (let iteration = 0; iteration < 200; iteration++) {
        // Combined force function: attract when far, repulse when close
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            const pos1 = nodePositions.get(node1.id);
            const pos2 = nodePositions.get(node2.id);
            
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Optimal distance between nodes
            const optimalDistance = 200;
            
            // Combined force: Lennard-Jones-like potential
            // Repulsive at short distances, attractive at medium distances
            const force = (optimalDistance - distance) * 0.5;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            pos1.vx += fx;
            pos1.vy += fy;
            pos2.vx -= fx;
            pos2.vy -= fy;
          }
        }

        // Additional spring force for connected nodes
        edges.forEach(edge => {
          const pos1 = nodePositions.get(edge.source);
          const pos2 = nodePositions.get(edge.target);
          
          if (pos1 && pos2) {
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Spring force to maintain edge length
            const targetLength = 120;
            const springForce = (distance - targetLength) * 0.3;
            const fx = (dx / distance) * springForce;
            const fy = (dy / distance) * springForce;
            
            pos1.vx += fx;
            pos1.vy += fy;
            pos2.vx -= fx;
            pos2.vy -= fy;
          }
        });

        // Apply velocity and damping
        nodePositions.forEach(pos => {
          pos.x += pos.vx * 0.1;
          pos.y += pos.vy * 0.1;
          pos.vx *= 0.9;
          pos.vy *= 0.9;
          
          // Keep nodes within bounds
          pos.x = Math.max(80, Math.min(width - 80, pos.x));
          pos.y = Math.max(80, Math.min(height - 80, pos.y));
        });
      }
      
      return nodePositions;
    };

    // Create edges first for layout calculation
    const processedEdges = [];
    inputNodes.forEach(node => {
      if (node.out_node_id) {
        const outNodes = Array.isArray(node.out_node_id) ? node.out_node_id : [node.out_node_id];
        outNodes.forEach(outNodeId => {
          processedEdges.push({
            id: `${node.id}-${outNodeId}`,
            source: node.id,
            target: outNodeId,
            type: 'straight',
            sourceHandle: null,
            targetHandle: null,
            style: edgeStyle,
            markerEnd,
          });
        });
      }
    });

    // Calculate positions using force layout
    const positions = forceLayout(inputNodes, processedEdges);

    const processedNodes = inputNodes.map(node => ({
      id: node.id,
      type: 'default',
      position: positions.get(node.id) || { x: 100, y: 100 },
      data: { 
        label: (
          <div className="text-center">
            <div className="font-semibold text-sm">{node.name}</div>
            {node.description && (
              <div className="text-xs text-gray-600 mt-1 max-w-32 overflow-hidden text-ellipsis">
                {node.description}
              </div>
            )}
          </div>
        )
      },
      style: nodeStyle,
    }));
    return { nodes: processedNodes, edges: processedEdges };
  }, [inputNodes]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  // Update flow nodes and edges when the computed nodes/edges change
  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="top-right"
      >
        <Controls />
        <Background color="#f1f5f9" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default GraphVisualization;