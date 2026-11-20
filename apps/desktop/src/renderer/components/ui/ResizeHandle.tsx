import React, { useEffect, useState } from 'react';

interface ResizeHandleProps {
  direction: 'vertical' | 'horizontal';
  onResize: (delta: number) => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    let lastPos = direction === 'vertical' ? 0 : 0;
    let initialized = false;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'vertical' ? e.clientX : e.clientY;
      if (!initialized) {
        lastPos = currentPos;
        initialized = true;
        return;
      }
      const delta = currentPos - lastPos;
      lastPos = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, direction, onResize]);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      className={`transition-colors select-none z-30 ${
        direction === 'vertical'
          ? 'w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500'
          : 'h-1 hover:h-1.5 cursor-row-resize bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500'
      } ${isDragging ? 'bg-indigo-500' : ''} ${className}`}
    />
  );
};
