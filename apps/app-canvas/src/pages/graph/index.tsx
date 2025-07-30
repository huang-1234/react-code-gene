import { useState } from 'react';

function GraphPage() {
  const [data] = useState([
    { name: '项目A', value: 40 },
    { name: '项目B', value: 30 },
    { name: '项目C', value: 20 },
    { name: '项目D', value: 10 },
  ]);

  return (
    <div className="graph-page">
      <h1>图表分析页面</h1>
      <div className="graph-container">
        <div className="graph-visualization">
          {data.map((item, index) => (
            <div key={index} className="bar-chart-item">
              <div className="bar-label">{item.name}</div>
              <div className="bar" style={{ width: `${item.value * 5}px`, height: '30px' }}>
                <span className="bar-value">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="graph-info">
          <h3>图表说明</h3>
          <p>这是一个简单的图表展示页面，可以在此处添加更多数据可视化内容。</p>
          <p>未来可以集成更复杂的图表库如ECharts、Chart.js等。</p>
        </div>
      </div>
    </div>
  );
}

export default GraphPage;
