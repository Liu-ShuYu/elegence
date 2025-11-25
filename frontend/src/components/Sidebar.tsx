import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 如果在主页，不显示sidebar
  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {isOpen && (
          <div className="sidebar-content">
            <h3>导航</h3>
            <button
              className={`sidebar-button ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
            >
              🏠 主页
            </button>
            <button
              className={`sidebar-button ${location.pathname === '/level_select' ? 'active' : ''}`}
              onClick={() => {
                navigate('/level_select');
                setIsOpen(false);
              }}
            >
              🎯 选关
            </button>
            <button
              className={`sidebar-button ${location.pathname === '/matching_room' ? 'active' : ''}`}
              onClick={() => {
                navigate('/matching_room');
                setIsOpen(false);
              }}
            >
              🎮 游戏
            </button>
          </div>
        )}
      </div>

      {/* 悬浮按钮 - 控制sidebar展开/收起 */}
      <button className="floating-sidebar-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>
    </>
  );
}

export default Sidebar;