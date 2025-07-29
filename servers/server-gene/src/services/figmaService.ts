import axios from 'axios';

// Figma组件类型
interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  style: Record<string, any>;
  children?: FigmaComponent[];
}

// Figma设计规范类型
interface FigmaSpec {
  id: string;
  name: string;
  components: FigmaComponent[];
}

/**
 * 解析Figma组件树
 */
const parseComponentTree = (node: any, result: FigmaComponent[] = []): FigmaComponent[] => {
  if (!node) return result;

  // 只处理可视组件
  if (node.visible !== false && node.type !== 'DOCUMENT' && node.type !== 'CANVAS') {
    const component: FigmaComponent = {
      id: node.id,
      name: node.name,
      type: node.type,
      style: extractStyles(node)
    };

    // 处理子组件
    if (node.children && node.children.length > 0) {
      component.children = [];
      node.children.forEach((child: any) => {
        parseComponentTree(child, component.children);
      });
    }

    result.push(component);
  }

  // 处理同级组件
  if (node.children && node.type === 'CANVAS') {
    node.children.forEach((child: any) => {
      parseComponentTree(child, result);
    });
  }

  return result;
};

/**
 * 提取组件样式
 */
const extractStyles = (node: any): Record<string, any> => {
  const style: Record<string, any> = {};

  // 基本属性
  if (node.absoluteBoundingBox) {
    style.width = `${node.absoluteBoundingBox.width}px`;
    style.height = `${node.absoluteBoundingBox.height}px`;
  }

  // 位置
  if (node.x !== undefined) style.left = `${node.x}px`;
  if (node.y !== undefined) style.top = `${node.y}px`;

  // 背景色
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.visible !== false) {
      const { r, g, b, a } = fill.color;
      style.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
  }

  // 边框
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.visible !== false) {
      const { r, g, b, a } = stroke.color;
      style.borderColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      style.borderWidth = `${node.strokeWeight}px`;
      style.borderStyle = 'solid';
    }
  }

  // 圆角
  if (node.cornerRadius) {
    style.borderRadius = `${node.cornerRadius}px`;
  }

  // 文本样式
  if (node.type === 'TEXT') {
    if (node.style) {
      if (node.style.fontFamily) style.fontFamily = node.style.fontFamily;
      if (node.style.fontSize) style.fontSize = `${node.style.fontSize}px`;
      if (node.style.fontWeight) style.fontWeight = node.style.fontWeight;
      if (node.style.textAlignHorizontal) style.textAlign = node.style.textAlignHorizontal.toLowerCase();
      if (node.style.letterSpacing) style.letterSpacing = `${node.style.letterSpacing}px`;
      if (node.style.lineHeightPx) style.lineHeight = `${node.style.lineHeightPx}px`;
    }

    // 文本颜色
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID') {
        const { r, g, b, a } = fill.color;
        style.color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      }
    }
  }

  return style;
};

/**
 * 从Figma API获取设计规范
 */
export const extractFigmaSpec = async (fileKey: string): Promise<FigmaSpec> => {
  try {
    const figmaToken = process.env.FIGMA_TOKEN;
    if (!figmaToken) {
      throw new Error('缺少Figma API Token');
    }

    const { data } = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': figmaToken }
    });

    const components = parseComponentTree(data.document);

    return {
      id: fileKey,
      name: data.name,
      components
    };
  } catch (error: any) {
    console.error('Figma API错误:', error.message);
    throw new Error(`无法获取Figma设计: ${error.message}`);
  }
};