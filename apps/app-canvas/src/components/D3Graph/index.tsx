/**
 * @description 使用d3.js绘制图表
 */
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Graph } from "../../faking-algorithm/graph/base";

interface D3GraphProps {
  graph: Graph<string | number>;
  width?: number;
  height?: number;
  nodeRadius?: number;
  nodeColor?: string;
  linkColor?: string;
  textColor?: string;
}

const D3Graph = ({
  graph,
  width = 600,
  height = 400,
  nodeRadius = 20,
  nodeColor = "#3498db",
  linkColor = "#95a5a6",
  textColor = "#333"
}: D3GraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !graph) return;

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    // 准备数据
    const vertices = graph.getVertices();
    const nodes = vertices.map(id => ({ id }));
    const links: { source: string | number; target: string | number; weight?: number }[] = [];

    // 从图中提取边
    vertices.forEach(vertex => {
      const neighbors = graph.getNeighbors(vertex);
      neighbors.forEach(neighbor => {
        links.push({
          source: vertex,
          target: neighbor.vertex,
          weight: neighbor.weight
        });
      });
    });

    // 创建力导向图
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // 创建SVG元素
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // 添加箭头标记（用于有向图）
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .join("marker")
      .attr("id", d => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", nodeRadius + 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", linkColor)
      .attr("d", "M0,-5L10,0L0,5");

    // 绘制连线
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", linkColor)
      .attr("stroke-width", 2)
      .attr("marker-end", graph.isDirected ? "url(#arrow)" : null);

    // 绘制节点
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    // 添加节点圆形背景
    const node = nodeGroup.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", nodeColor)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // 添加节点文本
    const text = nodeGroup.append("text")
      .text(d => d.id)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", textColor)
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

    // 添加边权重文本（如果有）
    const edgeText = svg.append("g")
      .selectAll("text")
      .data(links.filter(d => d.weight !== undefined))
      .join("text")
      .text(d => d.weight !== undefined ? d.weight.toString() : "")
      .attr("fill", "#666")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("background", "#fff")
      .attr("text-anchor", "middle");

    // 添加边权重背景（提高可读性）
    const edgeTextBg = svg.append("g")
      .selectAll("circle")
      .data(links.filter(d => d.weight !== undefined))
      .join("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("opacity", 0.8);

    // 更新力导向图
    simulation.on("tick", () => {
      // 限制节点在视图范围内
      nodes.forEach((d: any) => {
        d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
        d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
      });

      // 更新连线位置
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // 更新节点组位置
      nodeGroup
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      // 更新边权重背景位置
      edgeTextBg
        .attr("cx", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("cy", (d: any) => (d.source.y + d.target.y) / 2);

      // 更新边权重文本位置
      edgeText
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
    });

    // 拖拽功能
    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [graph, width, height, nodeRadius, nodeColor, linkColor, textColor]);

  return <svg ref={svgRef} className="d3-graph"></svg>;
};

export default D3Graph;
