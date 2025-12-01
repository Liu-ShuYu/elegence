import React from 'react';
import MatchSlot from './MatchSlot';

interface Card {
  id: number;
  type: 'left' | 'right';
  color: string;
  label: string;
  isMatched?: boolean;
  animationDelay?: number;
}

interface DraggedCard {
  card: Card;
  source: 'left' | 'right';
}

interface MatchingCenterProps {
  matchRows: Array<{ left: Card | null; right: Card | null; rowId: string }>;
  draggedCard: DraggedCard | null;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, rowId: string, slotSide: 'left' | 'right') => void;
}

const MatchingCenter: React.FC<MatchingCenterProps> = ({
  matchRows,
  draggedCard,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const currentRow = matchRows[0] || { left: null, right: null, rowId: '1' };
  const hasCards = currentRow.left || currentRow.right;

  const handleUnifiedDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    onDragOver(e);
  };

  const handleUnifiedDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
    onDragLeave(e);
  };

  const handleUnifiedDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedCard) {
      // 根据卡片来源自动放置到对应的槽位
      const slotSide = draggedCard.source === 'left' ? 'left' : 'right';
      onDrop(e, currentRow.rowId, slotSide);
    }
  };

  return (
    <div className="matching-center unified">
      {!hasCards ? (
        <div 
          className="unified-match-area empty" 
          onDragOver={handleUnifiedDragOver} 
          onDragLeave={handleUnifiedDragLeave}
          onDrop={handleUnifiedDrop}
        >
          <div className="unified-hint">拖拽到这里试试吧~</div>
        </div>
      ) : (
        <div className="unified-match-area with-cards">
          <MatchSlot
            card={currentRow.left}
            side="left"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            rowId={currentRow.rowId}
          />
          <div className="match-divider">VS</div>
          <MatchSlot
            card={currentRow.right}
            side="right"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            rowId={currentRow.rowId}
          />
        </div>
      )}
    </div>
  );
};

export default MatchingCenter;