import React, { useState } from 'react';
import '../styles/MatchingRoom.css';
import GameHeader from '../components/pages/matching-room/GameHeader';
import CardPool from '../components/pages/matching-room/CardPool';
import MatchingCenter from '../components/pages/matching-room/MatchingCenter';
import HistoryModal from '../components/pages/matching-room/HistoryModal';
import CompletionModal from '../components/pages/matching-room/CompletionModal';
import LoadingSpinner from '../components/pages/matching-room/LoadingSpinner';
import ParticleEffect from '../components/pages/matching-room/ParticleEffect';
import HelpModal from '../components/pages/matching-room/HelpModal';
import { useMatchingGame } from '../hooks/useMatchingGame';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useParticleEffect } from '../hooks/useParticleEffect';
import { useMatchingLogic } from '../hooks/useMatchingLogic';

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

  const [showHelpModal, setShowHelpModal] = useState(false);

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
      if (dragState.draggedCard.source === 'left') {
        handleMatch(dragState.draggedCard.card, targetCard);
      } else {
        handleMatch(targetCard, dragState.draggedCard.card);
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
      // 从卡池中移除该卡片
      if (dragState.draggedCard.source === 'left') {
        gameState.leftCards = gameState.leftCards.filter(card => card.id !== dragState.draggedCard!.card.id);
      } else {
        gameState.rightCards = gameState.rightCards.filter(card => card.id !== dragState.draggedCard!.card.id);
      }

      gameState.setMatchRows(
        gameState.matchRows.map((row) => {
          if (row.rowId === rowId) {
            if (slotSide === 'left') {
              const updatedRow = { ...row, left: dragState.draggedCard!.card };
              // 自动匹配如果两侧都有卡片
              if (updatedRow.right) {
                handleMatch(updatedRow.left!, updatedRow.right);
                return { ...row, left: null, right: null };
              }
              return updatedRow;
            } else {
              const updatedRow = { ...row, right: dragState.draggedCard!.card };
              // 自动匹配如果两侧都有卡片
              if (updatedRow.left) {
                handleMatch(updatedRow.left, updatedRow.right!);
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
    // 将所有槽位中的卡片重新放回卡池
    gameState.matchRows.forEach((row) => {
      if (row.left) {
        gameState.leftCards = [...gameState.leftCards, row.left];
      }
      if (row.right) {
        gameState.rightCards = [...gameState.rightCards, row.right];
      }
    });

    gameState.handleClear();
    particleState.clearParticles();
  };

  const handleDragStartFromSlot = (
    _e: React.DragEvent<HTMLDivElement>,
    card: Card,
    _source: 'slot',
    rowId: string,
    slotSide: 'left' | 'right'
  ) => {
    // 从匹配槽位开始拖拽时，移除该槽位中的卡片
    gameState.setMatchRows(
      gameState.matchRows.map((row) => {
        if (row.rowId === rowId) {
          if (slotSide === 'left') {
            return { ...row, left: null };
          } else {
            return { ...row, right: null };
          }
        }
        return row;
      })
    );

    // 将卡片重新放回对应的卡池
    if (slotSide === 'left') {
      gameState.leftCards = [...gameState.leftCards, card];
    } else {
      gameState.rightCards = [...gameState.rightCards, card];
    }

    // 设置拖拽状态
    dragState.setDraggedCard({
      card,
      source: slotSide
    });
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
        combo={gameState.combo}
        maxCombo={gameState.maxCombo}
        showComboEffect={gameState.showComboEffect}
        onClear={handleClearWithParticles}
        onShowHelp={() => setShowHelpModal(true)}
        onShowHistory={() => gameState.setShowHistoryModal(true)}
        matchHistoryLength={gameState.matchHistory.length}
      />

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
          onDragOver={dragState.handleDragOver}
          onDragLeave={dragState.handleDragLeave}
          onDrop={handleDropOnSlot}
          onDragStart={handleDragStartFromSlot}
          draggedCard={dragState.draggedCard?.card || null}
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

        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />

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