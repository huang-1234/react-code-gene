/**
 * 基于邻接表的图实现，支持有向/无向图、带权边、动态增删节点
 */
export class Graph<T extends string | number> {
  public readonly isDirected: boolean;
  private adjacencyList: Map<T, { vertex: T; weight?: number }[]>;

  constructor(isDirected = false) {
    this.isDirected = isDirected;
    this.adjacencyList = new Map();
  }

  /** 添加顶点 */
  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  /** 添加边（可选权重） */
  addEdge(source: T, destination: T, weight?: number): void {
    this.addVertex(source);
    this.addVertex(destination);
    this.adjacencyList.get(source)?.push({ vertex: destination, weight });

    // 无向图需双向连接
    if (!this.isDirected) {
      this.adjacencyList.get(destination)?.push({ vertex: source, weight });
    }
  }

  /** 删除顶点（同步移除关联边） */
  removeVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) return;

    // 移除指向该顶点的边
    for (const [v, edges] of this.adjacencyList) {
      this.adjacencyList.set(v, edges.filter(e => e.vertex !== vertex));
    }
    this.adjacencyList.delete(vertex);
  }

  /** 获取邻接节点 */
  getNeighbors(vertex: T): { vertex: T; weight?: number }[] {
    return this.adjacencyList.get(vertex) || [];
  }

  /** 可视化邻接表（调试用） */
  print(): void {
    this.adjacencyList.forEach((edges, vertex) => {
      const edgeStr = edges.map(e =>
        `${e.vertex}${e.weight ? `(${e.weight})` : ''}`
      ).join(", ");
      console.log(`${vertex} -> ${edgeStr}`);
    });
  }

  // 辅助方法：获取所有顶点
  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  // 获取边的数量
  getEdgeCount(): number {
    let count = 0;
    this.adjacencyList.forEach(edges => {
      count += edges.length;
    });

    // 如果是无向图，每条边被计算了两次
    return this.isDirected ? count : count / 2;
  }
  /**
   * 将图转换为字符串
   * @example
   * ```
   * const graph = new Graph();
   * graph.addEdge(1, 2);
   * graph.addEdge(1, 3);
   * graph.addEdge(2, 4);
   * graph.addEdge(3, 4);
   * graph.addEdge(4, 5);
   * console.log(graph.toString());
   * 1 -> 2, 3
   * 2 -> 1, 4
   * 3 -> 1, 4
   * 4 -> 2, 3, 5
   * 5 -> 4
   * ```
   * @returns 图的字符串表示
   */
  toString() {
    const result: string[] = [];
    this.adjacencyList.forEach((edges, vertex) => {
      result.push(`${vertex} -> ${edges.map(e => e.vertex).join(", ")}`);
    });
    return result.join("\n");
  }
}


/**
 * 基于邻接表的拓扑排序（Kahn算法）
 * @returns 拓扑序或空数组（检测到环）
 */
export function topologicalSort<T extends string | number>(graph: Graph<T>): T[] {
  const inDegree = new Map<T, number>();
  const queue: T[] = [];
  const result: T[] = [];

  // 1. 初始化所有顶点的入度为0
  graph.getVertices().forEach(v => inDegree.set(v, 0));

  // 2. 计算每个顶点的入度
  graph.getVertices().forEach(v => {
    graph.getNeighbors(v).forEach(neighbor => {
      inDegree.set(neighbor.vertex, (inDegree.get(neighbor.vertex) || 0) + 1);
    });
  });

  // 3. 入度为0的顶点入队
  inDegree.forEach((degree, vertex) => {
    if (degree === 0) queue.push(vertex);
  });

  // 4. BFS遍历
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    graph.getNeighbors(current).forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor.vertex)! - 1);
      inDegree.set(neighbor.vertex, newDegree);
      if (newDegree === 0) queue.push(neighbor.vertex);
    });
  }

  // 5. 环检测
  return result.length === graph.getVertices().length ? result : [];
}
