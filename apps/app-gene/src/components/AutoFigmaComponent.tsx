import { useState, useEffect, CSSProperties } from 'react';
import { figmaApi } from '../services/api';

interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  style: Record<string, any>;
  children?: FigmaComponent[];
}

interface FigmaSpec {
  id: string;
  name: string;
  components: FigmaComponent[];
}

interface AutoFigmaComponentProps {
  figmaUrl: string;
  overrides?: Record<string, CSSProperties>;
}

const Loading = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    加载中...
  </div>
);

const renderComponent = (component: FigmaComponent, overrides?: Record<string, CSSProperties>) => {
  const style = {
    ...component.style,
    ...(overrides?.[component.name] || {})
  };

  return (
    <div key={component.id} style={style}>
      {component.children?.map(child => renderComponent(child, overrides))}
    </div>
  );
};

export const AutoFigmaComponent = ({ figmaUrl, overrides }: AutoFigmaComponentProps) => {
  const [spec, setSpec] = useState<FigmaSpec>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchFigmaSpec = async () => {
      try {
        setLoading(true);
        // 从URL中提取文件ID
        const fileIdMatch = figmaUrl.match(/file\/([^\/]+)/);
        if (!fileIdMatch) {
          throw new Error('无效的Figma URL');
        }

        const fileId = fileIdMatch[1];
        const response = await figmaApi.getDesignSpec(fileId);
        setSpec(response as unknown as FigmaSpec);
      } catch (err: any) {
        setError(err.message || '加载Figma设计失败');
      } finally {
        setLoading(false);
      }
    };

    fetchFigmaSpec();
  }, [figmaUrl]);

  if (loading) return <Loading />;

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!spec) {
    return <div>未找到设计规范</div>;
  }

  return (
    <div className="figma-component-wrapper" style={overrides?.wrapper}>
      {spec.components.map(comp => renderComponent(comp, overrides))}
    </div>
  );
};