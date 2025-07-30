import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

// 创建LLM实例
const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
});

/**
 * Logo生成智能体
 * @param brief Logo设计需求
 * @returns 生成的Logo描述
 */
export async function logoAgent(brief: any): Promise<any> {
  const prompt = PromptTemplate.fromTemplate(`
    你是一位专业的Logo设计师。请根据以下设计需求，创建一个Logo的详细描述：

    公司/产品名称: {name}
    行业: {industry}
    风格偏好: {style}
    颜色偏好: {color}

    请提供Logo的详细描述，包括形状、元素、布局和寓意。

    输出格式:
    {
      "description": "Logo详细描述",
      "elements": ["元素1", "元素2"],
      "shape": "主要形状",
      "symbolism": "象征意义"
    }
  `);

  try {
    const formattedPrompt = await prompt.format({
      name: brief.text || '未指定',
      industry: brief.industry || '科技',
      style: brief.style || '现代简约',
      color: brief.color || '蓝色系'
    });

    const response = await llm.invoke(formattedPrompt);

    // 解析JSON响应
    const content = response.content;
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (e) {
        return { description: content };
      }
    }

    return { description: '无法生成Logo描述' };
  } catch (error) {
    console.error('Logo生成错误:', error);
    return { error: '生成Logo时出错', description: '默认Logo描述' };
  }
}

/**
 * 配色智能体
 * @param logoData Logo数据
 * @returns 应用配色后的Logo数据
 */
export async function colorAgent(logoData: any): Promise<any> {
  const prompt = PromptTemplate.fromTemplate(`
    你是一位专业的品牌配色专家。请根据以下Logo描述，提供一套和谐的配色方案：

    Logo描述: {description}

    请提供主色调、辅助色和强调色，使用HEX颜色代码。

    输出格式:
    {
      "primary": "#HEXCODE",
      "secondary": "#HEXCODE",
      "accent": "#HEXCODE",
      "palette": ["#HEXCODE1", "#HEXCODE2", "#HEXCODE3"]
    }
  `);

  try {
    const formattedPrompt = await prompt.format({
      description: logoData.description || '现代简约风格的Logo'
    });

    const response = await llm.invoke(formattedPrompt);

    // 解析JSON响应
    const content = response.content;
    if (typeof content === 'string') {
      try {
        const colorData = JSON.parse(content);
        return {
          ...logoData,
          colors: colorData
        };
      } catch (e) {
        return {
          ...logoData,
          colors: { primary: '#3498db', secondary: '#2ecc71', accent: '#e74c3c' }
        };
      }
    }

    return logoData;
  } catch (error) {
    console.error('配色生成错误:', error);
    return {
      ...logoData,
      colors: { primary: '#3498db', secondary: '#2ecc71', accent: '#e74c3c' }
    };
  }
}
