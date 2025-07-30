import { create } from 'zustand';

// 画布状态接口
interface CanvasState {
  // 画布元素
  elements: any[];
  annotations: any[];

  // 画布历史
  history: any[];
  historyIndex: number;

  // 会话信息
  sessionId: string | null;

  // 操作方法
  addElement: (element: any) => void;
  addAnnotation: (annotation: any) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  setSessionId: (id: string) => void;
}

// 创建画布状态存储
const useCanvasStore = create<CanvasState>((set) => ({
  // 初始状态
  elements: [],
  annotations: [],
  history: [],
  historyIndex: -1,
  sessionId: null,

  // 添加元素
  addElement: (element) => {
    set((state) => {
      const newElements = [...state.elements, element];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        elements: newElements,
        annotations: state.annotations,
      });

      return {
        elements: newElements,
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  // 添加批注
  addAnnotation: (annotation) => {
    set((state) => {
      const newAnnotations = [...state.annotations, annotation];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        elements: state.elements,
        annotations: newAnnotations,
      });

      return {
        annotations: newAnnotations,
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  // 清除画布
  clearCanvas: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        elements: [],
        annotations: [],
      });

      return {
        elements: [],
        annotations: [],
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  // 撤销操作
  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;

      const newIndex = state.historyIndex - 1;
      const previousState = state.history[newIndex];

      return {
        elements: previousState.elements,
        annotations: previousState.annotations,
        historyIndex: newIndex,
      };
    });
  },

  // 重做操作
  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;

      const newIndex = state.historyIndex + 1;
      const nextState = state.history[newIndex];

      return {
        elements: nextState.elements,
        annotations: nextState.annotations,
        historyIndex: newIndex,
      };
    });
  },

  // 设置会话ID
  setSessionId: (id) => {
    set({ sessionId: id });
  },
}));

export default useCanvasStore;
