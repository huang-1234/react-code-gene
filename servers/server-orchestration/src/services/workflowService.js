/**
 * 工作流服务
 * 负责管理和执行AI工作流
 */

const { nanoid } = require('nanoid');
const aiTools = require('../tools/aiTools');

// 内存中存储工作流状态
const workflowStates = new Map();

/**
 * 品牌设计工作流
 * @param {Object} params - 工作流参数
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} - 工作流结果
 */
async function brandDesignFlow(params, sessionId) {
  console.log(`执行品牌设计工作流，会话ID: ${sessionId}`);

  try {
    // 步骤1: 生成Logo描述
    console.log('步骤1: 生成Logo描述');
    const logoPrompt = `
      设计一个${params.style || '现代简约'}风格的${params.text || '科技公司'}Logo。
      要求：简洁、易识别、具有品牌特色。
    `;
    const logoResult = await aiTools.callOpenAI(logoPrompt, { taskType: 'logo' });

    // 步骤2: 生成配色方案
    console.log('步骤2: 生成配色方案');
    const colorPrompt = `
      为以下Logo设计配色方案：
      ${logoResult.description}
      要求：和谐、现代、符合品牌调性。
    `;
    const colorResult = await aiTools.callOpenAI(colorPrompt, { taskType: 'color' });

    // 步骤3: 生成Logo图像
    console.log('步骤3: 生成Logo图像');
    const imagePrompt = `
      ${logoResult.description}
      形状: ${logoResult.shape}
      元素: ${logoResult.elements.join(', ')}
      主色: ${colorResult.primary}
      辅色: ${colorResult.secondary}
    `;
    const imageResult = await aiTools.generateImage(imagePrompt, { width: 512, height: 512 });

    // 合并结果
    const result = {
      logo: logoResult,
      colors: colorResult,
      image: imageResult
    };

    // 保存工作流状态
    const taskId = nanoid(10);
    workflowStates.set(taskId, {
      sessionId,
      params,
      result,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });

    return { taskId, ...result };
  } catch (error) {
    console.error('品牌设计工作流执行失败:', error);
    throw error;
  }
}

/**
 * 代码生成工作流
 * @param {Object} params - 工作流参数
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} - 工作流结果
 */
async function codeGenerationFlow(params, sessionId) {
  console.log(`执行代码生成工作流，会话ID: ${sessionId}`);

  try {
    // 步骤1: 分析需求
    console.log('步骤1: 分析需求');
    const analysisPrompt = `
      分析以下代码需求：
      ${params.requirement || '创建一个简单的计数器函数'}
    `;
    const analysisResult = await aiTools.callOpenAI(analysisPrompt);

    // 步骤2: 生成代码
    console.log('步骤2: 生成代码');
    const codePrompt = `
      根据以下需求生成代码：
      ${params.requirement || '创建一个简单的计数器函数'}
      语言: ${params.language || 'javascript'}
    `;
    const codeResult = await aiTools.generateCode(codePrompt, {
      language: params.language || 'javascript'
    });

    // 合并结果
    const result = {
      analysis: analysisResult,
      code: codeResult
    };

    // 保存工作流状态
    const taskId = nanoid(10);
    workflowStates.set(taskId, {
      sessionId,
      params,
      result,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });

    return { taskId, ...result };
  } catch (error) {
    console.error('代码生成工作流执行失败:', error);
    throw error;
  }
}

/**
 * 获取工作流状态
 * @param {string} taskId - 任务ID
 * @returns {Object|null} - 工作流状态
 */
function getWorkflowState(taskId) {
  return workflowStates.get(taskId) || null;
}

/**
 * 获取会话的所有工作流
 * @param {string} sessionId - 会话ID
 * @returns {Array<Object>} - 工作流状态列表
 */
function getSessionWorkflows(sessionId) {
  const results = [];

  for (const [taskId, state] of workflowStates.entries()) {
    if (state.sessionId === sessionId) {
      results.push({ taskId, ...state });
    }
  }

  return results;
}

module.exports = {
  brandDesignFlow,
  codeGenerationFlow,
  getWorkflowState,
  getSessionWorkflows
};
