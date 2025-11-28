import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LevelSelect.css';
import ThemeSelector from '../components/pages/level-select/ThemeSelector';
import LevelGrid from '../components/pages/level-select/LevelGrid';
import LevelHeader from '../components/pages/level-select/LevelHeader';
import ThemeHeader from '../components/pages/level-select/ThemeHeader';
import type { Theme, Level } from '../types/game';
import { createThemes } from '../data/gameData';
import { getDifficultyColor } from '../utils/gameUtils';
import { useGameProgress } from '../hooks/useGameProgress';

function LevelSelect() {
  const navigate = useNavigate();
  const { gameProgress } = useGameProgress();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // 根据游戏进度动态生成主题数据
  const themes = createThemes(gameProgress);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
  };

  const handleLevelSelect = (level: Level) => {
    navigate('/matching_room', {
      state: {
        level: level.id,
        levelData: level,
        theme: selectedTheme?.id,
        themeName: selectedTheme?.name
      }
    });
  };

  const handleBackToThemes = () => {
    setSelectedTheme(null);
  };

  if (selectedTheme) {
    // 显示关卡选择界面
    return (
      <div className="level-select-container">
        <LevelHeader theme={selectedTheme} />

        <LevelGrid
          levels={selectedTheme.levels}
          onLevelSelect={handleLevelSelect}
          getDifficultyColor={getDifficultyColor}
        />

        <button className="back-button" onClick={handleBackToThemes}>
          ← 返回主题选择
        </button>
      </div>
    );
  }

  // 显示主题选择界面
  return (
    <div className="level-select-container">
      <ThemeHeader />

      <ThemeSelector
        themes={themes}
        onThemeSelect={handleThemeSelect}
      />
    </div>
  );
}

export default LevelSelect;