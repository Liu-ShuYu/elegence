import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateLevel } from '../utils/levelGenerators';

interface Card {
  id: number;
  type: 'left' | 'right';
  color: string;
  label: string;
  isMatched?: boolean;
  animationDelay?: number;
}

type ScoreColor = 'red' | 'yellow' | 'green';

interface Task {
  id: number;
  requirement: string;
  scoreKey: ScoreColor;
  target: number;
}

export const DEFAULT_PAIR_COUNT = 15;

const withUniqueIds = (cards: Card[], seed: number) =>
  cards.map((card, index) => ({
    ...card,
    id: seed + index + Math.random(),
  }));

export const useMatchingGame = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 基本状态
  const [leftCards, setLeftCards] = useState<Card[]>([]);
  const [rightCards, setRightCards] = useState<Card[]>([]);
  const [matchHistory, setMatchHistory] = useState<Array<{ left: Card; right: Card }>>([]);
  const [matchRows, setMatchRows] = useState<Array<{ left: Card | null; right: Card | null; rowId: string }>>([
    { left: null, right: null, rowId: '1' },
  ]);

  const [scores, setScores] = useState<{ red: number; yellow: number; green: number }>({
    red: 0,
    yellow: 0,
    green: 0,
  });
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showComboEffect, setShowComboEffect] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [lastMatchTime, setLastMatchTime] = useState<number>(0);

  // 获取当前关卡信息
  const currentLevel = location.state?.level || 1;
  const currentTheme = location.state?.theme || 'arithmetic';

  // 获取关卡目标分数
  const getLevelTarget = (level: number) => {
    const targets = [8, 10, 12, 15, 18, 20, 25, 30, 35, 40];
    return targets[level - 1] || 8;
  };
  const targetScore = useMemo(() => getLevelTarget(currentLevel), [currentLevel]);

  // 检查关卡完成条件
  useEffect(() => {
    const totalMatches = scores.red + scores.yellow + scores.green;
    if (totalMatches >= targetScore && !levelCompleted) {
      setLevelCompleted(true);
      setShowCompletionModal(true);

      // 保存关卡完成状态
      const completedLevels = JSON.parse(localStorage.getItem(`completedLevels_${currentTheme}`) || '[]');
      if (!completedLevels.includes(currentLevel)) {
        completedLevels.push(currentLevel);
        localStorage.setItem(`completedLevels_${currentTheme}`, JSON.stringify(completedLevels));
      }
    }
  }, [scores, currentLevel, currentTheme, levelCompleted]);

  // 初始化关卡
  useEffect(() => {
    const lvl = location.state?.level;
    if (lvl) {
      const seed = Date.now();
      const levelData = generateLevel(lvl, DEFAULT_PAIR_COUNT, currentTheme);
      setLeftCards(withUniqueIds(levelData.leftCards, seed));
      setRightCards(withUniqueIds(levelData.rightCards, seed + 1000));
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [location, currentTheme]);

  const tasks: Task[] = useMemo(
    () => [
      { id: 1, requirement: '红色', scoreKey: 'red', target: targetScore },
      { id: 2, requirement: '黄色', scoreKey: 'yellow', target: targetScore },
      { id: 3, requirement: '绿色', scoreKey: 'green', target: targetScore },
    ],
    [targetScore]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => scores[task.scoreKey] >= task.target)
        .map((task) => task.id),
    [tasks, scores]
  );

  const handleClear = () => {
    setMatchHistory([]);
    setMatchRows([
      { left: null, right: null, rowId: '1' },
    ]);
    setCombo(0);
    setMaxCombo(0);
    setShowComboEffect(false);
    setLastMatchTime(0);
  };

  const handleContinueToNextLevel = () => {
    setShowCompletionModal(false);
    navigate('/level-select', { state: { theme: currentTheme } });
  };

  const handleBackToThemeSelect = () => {
    setShowCompletionModal(false);
    navigate('/level-select');
  };

  const refreshCardPools = () => {
    const seed = Date.now();
    const levelData = generateLevel(currentLevel, DEFAULT_PAIR_COUNT, currentTheme);
    setLeftCards(withUniqueIds(levelData.leftCards, seed));
    setRightCards(withUniqueIds(levelData.rightCards, seed + 1000));
    setMatchRows([{ left: null, right: null, rowId: '1' }]);
  };

  const totalMatches = scores.red + scores.yellow + scores.green;
  const progressPercent = Math.min((totalMatches / targetScore) * 100, 100);

  return {
    // 状态
    leftCards,
    setLeftCards,
    rightCards,
    setRightCards,
    tasks,
    matchHistory,
    setMatchHistory,
    completedTasks,
    matchRows,
    setMatchRows,
    scores,
    setScores,
    levelCompleted,
    showCompletionModal,
    setShowCompletionModal,
    showHistoryModal,
    setShowHistoryModal,
    isLoading,
    setIsLoading,
    combo,
    setCombo,
    maxCombo,
    setMaxCombo,
    showComboEffect,
    setShowComboEffect,
    lastMatchTime,
    setLastMatchTime,
    currentLevel,
    currentTheme,
    totalMatches,
    targetScore,
    progressPercent,

    // 方法
    handleClear,
    handleContinueToNextLevel,
    handleBackToThemeSelect,
    refreshCardPools,
  };
};