import { useState, useEffect } from 'react';
import D3Graph from '../../components/D3Graph';
import { Graph, topologicalSort } from '../../faking-algorithm/graph/base';

function GraphPage() {
  const [graph] = useState(() => {
    // 创建一个示例图
    const g = new Graph<string>(false); // 无向图

    // 添加一些节点和边
    g.addEdge('A', 'B', 5);
    g.addEdge('A', 'C', 3);
    g.addEdge('B', 'D', 2);
    g.addEdge('C', 'D', 1);
    g.addEdge('C', 'E', 6);
    g.addEdge('D', 'E', 4);
    g.addEdge('D', 'F', 8);
    g.addEdge('E', 'F', 2);

    return g;
  });

  const [directedGraph] = useState(() => {
    // 创建一个有向图用于拓扑排序示例
    const g = new Graph<string>(true); // 有向图

    g.addEdge('课程1', '课程2');
    g.addEdge('课程1', '课程3');
    g.addEdge('课程2', '课程4');
    g.addEdge('课程3', '课程4');
    g.addEdge('课程3', '课程5');
    g.addEdge('课程4', '课程6');
    g.addEdge('课程5', '课程6');

    return g;
  });

  const [topoResult, setTopoResult] = useState<string[]>([]);

  useEffect(() => {
    // 计算拓扑排序
    const result = topologicalSort(directedGraph);
    setTopoResult(result);
  }, [directedGraph]);

  return (
    <div className="graph-page">
      <div className="page-header">
        <h1>图表可视化与算法</h1>
        <p className="page-description">
          本页面展示了图论数据结构的可视化和相关算法的应用
        </p>
      </div>

      <div className="graph-layout">
        <div className="graph-section">
          <div className="section-header">
            <h2>无向带权图</h2>
            <div className="section-description">
              <p>这是一个无向带权图的可视化示例。节点可以拖动调整位置，边上的数字表示权重。</p>
            </div>
          </div>

          <div className="graph-container">
            <div className="graph-visualization">
              <D3Graph
                graph={graph}
                width={650}
                height={450}
                nodeColor="#3498db"
                nodeRadius={25}
              />
            </div>
            <div className="graph-info">
              <div className="info-card">
                <h3>图的邻接表表示</h3>
                <pre className="adjacency-list">{graph.toString()}</pre>
              </div>
              <div className="info-card">
                <h3>图的特性</h3>
                <ul className="graph-properties">
                  <li>节点数量: <strong>{graph.getVertices().length}</strong></li>
                  <li>是否有向: <strong>{graph.isDirected ? '是' : '否'}</strong></li>
                  <li>边的数量: <strong>{graph.getEdgeCount()}</strong></li>
                </ul>
                <p>拖动节点可以调整布局，边上的数字表示权重值。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="graph-section">
          <div className="section-header">
            <h2>有向图与拓扑排序</h2>
            <div className="section-description">
              <p>拓扑排序可以用于确定依赖关系的执行顺序，例如：课程学习顺序、任务调度等。</p>
            </div>
          </div>

          <div className="graph-container">
            <div className="graph-visualization">
              <D3Graph
                graph={directedGraph}
                width={650}
                height={450}
                nodeColor="#e74c3c"
                nodeRadius={25}
              />
            </div>
            <div className="graph-info">
              <div className="info-card">
                <h3>拓扑排序结果</h3>
                {topoResult.length > 0 ? (
                  <>
                    <div className="topo-sequence">
                      {topoResult.map((node, index) => (
                        <div key={node} className="topo-node">
                          {node}
                          {index < topoResult.length - 1 && <span className="topo-arrow">→</span>}
                        </div>
                      ))}
                    </div>
                    <p className="topo-explanation">
                      上图显示了课程依赖关系的拓扑排序结果，按此顺序学习可确保先修课程已完成。
                    </p>
                  </>
                ) : (
                  <div className="topo-error">
                    <p>图中存在环，无法进行拓扑排序</p>
                    <p>拓扑排序只适用于有向无环图(DAG)</p>
                  </div>
                )}
              </div>
              <div className="info-card">
                <h3>图的邻接表表示</h3>
                <pre className="adjacency-list">{directedGraph.toString()}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphPage;
