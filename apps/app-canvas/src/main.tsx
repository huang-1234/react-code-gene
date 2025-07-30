import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/antd.css' // 导入Ant Design样式
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
