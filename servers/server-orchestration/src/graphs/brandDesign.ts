import { StateGraph } from '@langchain/langgraph';
import { logoAgent, colorAgent } from '../agents/designAgents';
import { BinaryOperator } from '@langchain/langgraph/dist/channels/binop';

// 定义状态类型
interface BrandDesignState {
  brief: any;
  assets: any[];
  sessionId?: string;
}

// 创建状态图
const graph = new StateGraph<BrandDesignState>({
  channels: {
    brief: { value: null },
    assets: { value: [] as unknown as BinaryOperator<any[]> },
    sessionId: { value: null }
  }
});

// 添加节点：生成Logo
graph.addNode('generate_logo', async (state: BrandDesignState) => {
  console.log('执行Logo生成节点');
  const logoResult = await logoAgent(state.brief);
  return { assets: [logoResult] };
});

// 添加节点：应用配色
graph.addNode('apply_colors', async (state: BrandDesignState) => {
  console.log('执行配色节点');
  const colorResult = await colorAgent(state.assets[0]);
  return { assets: [colorResult] };
});

// 添加边：定义节点间的流转关系
graph.addEdge('generate_logo', 'apply_colors');

// 设置入口点
graph.setEntryPoint('generate_logo');

// 编译图
export const brandDesignFlow = graph.compile();
