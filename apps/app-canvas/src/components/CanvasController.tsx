import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { z } from 'zod';

// 指令类型验证模式
const CommandSchema = z.object({
  type: z.enum(['draw', 'annotate', 'clear']),
  params: z.record(z.unknown()).optional(),
});

// 组件属性类型
interface CanvasControllerProps {
  width?: number;
  height?: number;
  onCommand?: (command: any) => void;
}

/**
 * 画布指令控制器组件
 * 支持绘图、批注和清除操作
 */
const CanvasController: React.FC<CanvasControllerProps> = ({
  width = 800,
  height = 600,
  onCommand,
}) => {
  // 状态
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [commandText, setCommandText] = useState('');

  // 引用
  const stageRef = useRef<any>(null);

  // 处理鼠标按下事件
  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    // 获取鼠标位置
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // 创建新的批注
    const newAnnotation = {
      x: point.x,
      y: point.y,
      text: '批注',
      id: `annotation-${Date.now()}`,
    };

    setAnnotations([...annotations, newAnnotation]);
  };

  // 处理鼠标抬起事件
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 处理指令提交
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 解析指令
      const [type, ...paramsParts] = commandText.split(' ');
      const paramsText = paramsParts.join(' ');

      // 构建指令对象
      const command = {
        type,
        params: paramsText ? JSON.parse(`{${paramsText}}`) : {},
      };

      // 验证指令
      const validatedCommand = CommandSchema.parse(command);

      // 执行指令
      executeCommand(validatedCommand);

      // 回调
      if (onCommand) {
        onCommand(validatedCommand);
      }

      // 清空指令输入
      setCommandText('');
    } catch (error) {
      console.error('指令解析错误:', error);
    }
  };

  // 执行指令
  const executeCommand = (command: any) => {
    switch (command.type) {
      case 'draw':
        // 绘制元素
        const newElement = {
          type: command.params.shape || 'rect',
          x: command.params.x || 100,
          y: command.params.y || 100,
          width: command.params.width || 100,
          height: command.params.height || 100,
          fill: command.params.color || 'blue',
          id: `element-${Date.now()}`,
        };
        setElements([...elements, newElement]);
        break;
      case 'annotate':
        // 添加批注
        const newAnnotation = {
          x: command.params.x || 150,
          y: command.params.y || 150,
          text: command.params.text || '批注',
          id: `annotation-${Date.now()}`,
        };
        setAnnotations([...annotations, newAnnotation]);
        break;
      case 'clear':
        // 清除画布
        setElements([]);
        setAnnotations([]);
        break;
      default:
        console.warn('未知指令类型:', command.type);
    }
  };

  // 导出画布为图片
  const exportImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'canvas-export.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="canvas-controller">
      <div className="canvas-container">
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          style={{ border: '1px solid #ccc' }}
        >
          <Layer>
            {/* 绘制元素 */}
            {elements.map((element) => (
              <Rect
                key={element.id}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={element.fill}
                draggable
              />
            ))}

            {/* 绘制批注 */}
            {annotations.map((annotation) => (
              <Text
                key={annotation.id}
                x={annotation.x}
                y={annotation.y}
                text={annotation.text}
                fontSize={16}
                fill="black"
                draggable
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="canvas-controls">
        <form onSubmit={handleCommandSubmit}>
          <input
            type="text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder="输入指令 (例: draw shape:rect x:100 y:100)"
            className="command-input"
          />
          <button type="submit">执行</button>
        </form>

        <div className="canvas-actions">
          <button onClick={() => executeCommand({ type: 'clear' })}>
            清除画布
          </button>
          <button onClick={exportImage}>
            导出图片
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasController;
