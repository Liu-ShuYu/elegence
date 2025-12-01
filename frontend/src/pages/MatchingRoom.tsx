import React from 'react';
import '../styles/MatchingRoom.css';
import GameHeader from '../components/pages/matching-room/GameHeader';
import TaskArea from '../components/pages/matching-room/TaskArea';
import CardPool from '../components/pages/matching-room/CardPool';
import MatchingCenter from '../components/pages/matching-room/MatchingCenter';
import HistoryModal from '../components/pages/matching-room/HistoryModal';
import CompletionModal from '../components/pages/matching-room/CompletionModal';
import LoadingSpinner from '../components/pages/matching-room/LoadingSpinner';
import ParticleEffect from '../components/pages/matching-room/ParticleEffect';
import { useMatchingGame, DEFAULT_PAIR_COUNT } from '../hooks/useMatchingGame';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useParticleEffect } from '../hooks/useParticleEffect';
import { useMatchingLogic } from '../hooks/useMatchingLogic';
import { generateLevel } from '../utils/levelGenerators';

interface Card {
  id: number;
  type: 'left' | 'right';
  color: string;
  label: string;
  isMatched?: boolean;
  animationDelay?: number;
}

function MatchingRoom() {
  // 使用自定义 hooks
  const gameState = useMatchingGame();
  const dragState = useDragAndDrop();
  const particleState = useParticleEffect();
  const { handleMatch } = useMatchingLogic(
    gameState.combo,
    gameState.lastMatchTime,
    gameState.scores,
    gameState.setCombo,
    gameState.setMaxCombo,
    gameState.setLastMatchTime,
    gameState.setShowComboEffect,
    gameState.setScores,
    gameState.setMatchHistory,
    gameState.matchHistory,
    particleState.createParticles
  );

  const replenishCardPools = (leftCardId: number, rightCardId: number) => {
    let updatedLeft = gameState.leftCards.filter((card) => card.id !== leftCardId);
    let updatedRight = gameState.rightCards.filter((card) => card.id !== rightCardId);

    const missingPairs = Math.max(
      DEFAULT_PAIR_COUNT - updatedLeft.length,
      DEFAULT_PAIR_COUNT - updatedRight.length,
      0
    );

    if (missingPairs > 0) {
      const freshCards = generateLevel(gameState.currentLevel, missingPairs, gameState.currentTheme);
      const timestamp = Date.now();
      const leftNew = freshCards.leftCards.map((card, index) => ({
        ...card,
        id: timestamp + index + Math.random(),
      }));
      const rightNew = freshCards.rightCards.map((card, index) => ({
        ...card,
        id: timestamp + missingPairs + index + Math.random(),
      }));
      updatedLeft = [...updatedLeft, ...leftNew];
      updatedRight = [...updatedRight, ...rightNew];
    }

    gameState.setLeftCards(updatedLeft);
    gameState.setRightCards(updatedRight);
  };

  // 事件处理函数
  const handleDropOnCard = (
    e: React.DragEvent<HTMLDivElement>,
    targetCard: Card
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragState.draggedCard) return;

    // 左右卡片需要交叉匹配
    if (dragState.draggedCard.source !== targetCard.type) {
      let matchResult;
      if (dragState.draggedCard.source === 'left') {
        matchResult = handleMatch(dragState.draggedCard.card, targetCard);
        if (matchResult.isMatch) {
          replenishCardPools(dragState.draggedCard.card.id, targetCard.id);
        }
      } else {
        matchResult = handleMatch(targetCard, dragState.draggedCard.card);
        if (matchResult.isMatch) {
          replenishCardPools(targetCard.id, dragState.draggedCard.card.id);
        }
      }
    }

    dragState.setDraggedCard(null);
  };

  const handleDropOnSlot = (
    e: React.DragEvent<HTMLDivElement>,
    rowId: string,
    slotSide: 'left' | 'right'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragState.draggedCard) return;

    // 左侧卡片拖到左侧槽位，右侧卡片拖到右侧槽位
    if (
      (slotSide === 'left' && dragState.draggedCard.source === 'left') ||
      (slotSide === 'right' && dragState.draggedCard.source === 'right')
    ) {
      gameState.setMatchRows(
        gameState.matchRows.map((row) => {
          if (row.rowId === rowId) {
            if (slotSide === 'left') {
              const updatedRow = { ...row, left: dragState.draggedCard!.card };
              // 自动匹配如果两侧都有卡片
              if (updatedRow.right) {
                const matchResult = handleMatch(updatedRow.left!, updatedRow.right);
                // 如果匹配成功，从卡池中移除这两张卡片并清空槽位
                if (matchResult.isMatch) {
                  replenishCardPools(updatedRow.left!.id, updatedRow.right.id);
                  return { ...row, left: null, right: null };
                }
                // 匹配失败，清空槽位让卡片弹回
                return { ...row, left: null, right: null };
              }
              return updatedRow;
            } else {
              const updatedRow = { ...row, right: dragState.draggedCard!.card };
              // 自动匹配如果两侧都有卡片
              if (updatedRow.left) {
                const matchResult = handleMatch(updatedRow.left, updatedRow.right!);
                // 如果匹配成功，从卡池中移除这两张卡片并清空槽位
                if (matchResult.isMatch) {
                  replenishCardPools(updatedRow.left.id, updatedRow.right!.id);
                  return { ...row, left: null, right: null };
                }
                // 匹配失败，清空槽位让卡片弹回
                return { ...row, left: null, right: null };
              }
              return updatedRow;
            }
          }
          return row;
        })
      );
    }

    dragState.setDraggedCard(null);
  };

  const handleClearWithParticles = () => {
    gameState.handleClear();
    particleState.clearParticles();
  };

  const handleRefreshCardPools = () => {
    gameState.refreshCardPools();
    particleState.clearParticles();
  };

  return (
    <div className="matching-room">
      {/* 粒子效果 */}
      <ParticleEffect particles={particleState.particles} />

      {/* 加载动画 */}
      <LoadingSpinner isLoading={gameState.isLoading} />

      {/* 顶部状态栏 */}
      <GameHeader
        currentLevel={gameState.currentLevel}
        currentTheme={gameState.currentTheme}
        totalMatches={gameState.totalMatches}
        targetScore={gameState.targetScore}
        progressPercent={gameState.progressPercent}
        scores={gameState.scores}
        combo={gameState.combo}
        maxCombo={gameState.maxCombo}
        showComboEffect={gameState.showComboEffect}
        onClear={handleClearWithParticles}
        onRefresh={handleRefreshCardPools}
        onShowHistory={() => gameState.setShowHistoryModal(true)}
        matchHistoryLength={gameState.matchHistory.length}
      />

      {/* 任务区域 */}
      <TaskArea tasks={gameState.tasks} completedTasks={gameState.completedTasks} scores={gameState.scores} />

      {/* 主要游戏区域 */}
      <div className="main-content">
        {/* 左侧卡池 */}
        <CardPool
          title="左卡池"
          cards={gameState.leftCards}
          draggedCard={dragState.draggedCard?.card || null}
          onDragStart={dragState.handleDragStart}
          onDragEnd={dragState.handleDragEnd}
        />

        {/* 中间匹配区 */}
        <MatchingCenter
          matchRows={gameState.matchRows}
          draggedCard={dragState.draggedCard}
          onDragOver={dragState.handleDragOver}
          onDragLeave={dragState.handleDragLeave}
          onDrop={handleDropOnSlot}
        />

        {/* 右侧卡池 */}
        <CardPool
          title="右卡池"
          cards={gameState.rightCards}
          draggedCard={dragState.draggedCard?.card || null}
          onDragStart={dragState.handleDragStart}
          onDragEnd={dragState.handleDragEnd}
          onDragOver={dragState.handleDragOver}
          onDrop={handleDropOnCard}
        />
      </div>

      {/* 匹配历史弹窗 */}
      <HistoryModal
        isOpen={gameState.showHistoryModal}
        onClose={() => gameState.setShowHistoryModal(false)}
        matchHistory={gameState.matchHistory}
      />

      {/* 关卡完成弹窗 */}
      <CompletionModal
        isOpen={gameState.showCompletionModal}
        onClose={() => gameState.setShowCompletionModal(false)}
        onContinue={gameState.handleContinueToNextLevel}
        onBackToTheme={gameState.handleBackToThemeSelect}
        currentLevel={gameState.currentLevel}
        scores={gameState.scores}
        totalMatches={gameState.totalMatches}
        maxCombo={gameState.maxCombo}
      />
    </div>
  );
}

export default MatchingRoom;