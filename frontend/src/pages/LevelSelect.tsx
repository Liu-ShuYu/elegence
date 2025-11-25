import { useNavigate } from 'react-router-dom';
import '../styles/LevelSelect.css';

function LevelSelect() {
  const navigate = useNavigate();

  return (
    <div className="level-select-container">
      <div className="level-select-header">
        <h1>选择关卡</h1>
        <p>选择一个关卡开始挑战 — 每个关卡为不同难度的匹配练习。</p>
      </div>

      <div className="level-grid">
        <div className="level-card">
          <div className="level-title">关卡 1 · 十以内加减法</div>
          <div className="level-desc">左右两侧均为十以内的加减法表达式，只有同色且计算结果相同的配对才算成功。</div>
          <div className="level-meta">
            <div className="difficulty">简单</div>
            <div className="level-actions">
              <button className="level-button" onClick={() => navigate('/matching_room', { state: { level: 1 } })}>开始</button>
            </div>
          </div>
        </div>

        <div className="level-card level-locked">
          <div className="level-title">关卡 2 · 两位数加减</div>
          <div className="level-desc">（占位）更高难度的算术匹配，之后解锁。</div>
          <div className="level-meta">
            <div className="difficulty">中等</div>
            <div className="level-actions">
              <button className="level-button" onClick={() => navigate('/matching_room')}>使用默认</button>
            </div>
          </div>
        </div>

        <div className="level-card level-locked">
          <div className="level-title">关卡 3 · 时间挑战</div>
          <div className="level-desc">（占位）在限定时间内完成尽可能多的配对。</div>
          <div className="level-meta">
            <div className="difficulty">高级</div>
            <div className="level-actions">
              <button className="level-button" onClick={() => navigate('/matching_room')}>使用默认</button>
            </div>
          </div>
        </div>
      </div>

      <button className="back-button" onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}

export default LevelSelect;
