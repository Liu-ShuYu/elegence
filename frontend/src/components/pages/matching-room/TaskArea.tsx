import React from 'react';

type ScoreColor = 'red' | 'yellow' | 'green';

interface Task {
  id: number;
  requirement: string;
  scoreKey: ScoreColor;
  target: number;
}

interface TaskAreaProps {
  tasks: Task[];
  completedTasks: number[];
  scores: { red: number; yellow: number; green: number };
}

const colorMap: Record<ScoreColor, string> = {
  red: '#FF4D4D',
  yellow: '#F1C40F',
  green: '#2ECC71',
};

const TaskArea: React.FC<TaskAreaProps> = ({ tasks, completedTasks, scores }) => {
  return (
    <div className="task-area">
      <div className="task-container">
        <div className="task-header">
          <h2>🎯 任务目标</h2>
          <div className="drag-tip">
            <span className="drag-tip-icon">✨</span>
            <span className="drag-tip-text">拖拽匹配相同颜色和结果的卡片</span>
          </div>
        </div>
        <div className="tasks-list">
          {tasks.map((task) => {
            const finished = completedTasks.includes(task.id);
            const currentValue = Math.min(scores[task.scoreKey] ?? 0, task.target);

            return (
              <div
                key={task.id}
                className={`task-item ${finished ? 'completed' : ''} ${finished ? 'animate-pulse' : ''}`}
              >
                <span className="task-status" style={{ color: colorMap[task.scoreKey] }}>
                  ●
                </span>
                <span className="task-text">
                  {task.requirement} {currentValue}/{task.target}
                </span>
                {finished && <div className="task-sparkle">✨</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskArea;