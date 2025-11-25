import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>欢迎来到AI匹配游戏平台</h1>
      <p>在这里，您可以体验智能匹配的乐趣，与AI对手进行精彩的对战。点击下方按钮开始您的游戏之旅！</p>
      <button className="start-button" onClick={() => navigate('/level_select')}>
        开始游戏
      </button>
    </div>
  );
}

export default Home;