import { useCallback, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function SubredditGraph({ data, onNodeClick }) {
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const graphRef = useRef();

  const handleNodeClick = useCallback(
    (node) => {
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  const handleNodeHover = useCallback((node) => {
    setHoverNode(node);
    if (node) {
      setHighlightNodes(new Set([node.id]));
      setHighlightLinks(new Set(node.neighbors.map((link) => link.id)));
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, []);

  const paintRing = useCallback(
    (node, ctx) => {
      // Add ring just for highlighted nodes
      if (highlightNodes.has(node.id)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false);
        ctx.fillStyle = node === hoverNode ? "#ff0000" : "#ff000033";
        ctx.fill();
      }
    },
    [highlightNodes, hoverNode]
  );

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-xl border border-gray-700/50">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel="name"
        nodeAutoColorBy="group"
        nodeRelSize={6}
        linkWidth={(link) => (highlightLinks.has(link.id) ? 2 : 1)}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={(link) =>
          highlightLinks.has(link.id) ? 4 : 0
        }
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={paintRing}
        linkColor={(link) =>
          highlightLinks.has(link.id) ? "#ff0000" : "#666666"
        }
        backgroundColor="#111827"
      />
    </div>
  );
}
