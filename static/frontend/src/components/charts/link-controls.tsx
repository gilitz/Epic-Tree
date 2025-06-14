import React, { ChangeEvent } from 'react';

interface LinkControlsProps {
  layout: 'polar' | 'cartesian';
  orientation: 'vertical' | 'horizontal';
  linkType: 'diagonal' | 'step' | 'curve' | 'line';
  stepPercent: number;
  setLayout: (layout: 'polar' | 'cartesian') => void;
  setOrientation: (orientation: 'vertical' | 'horizontal') => void;
  setLinkType: (linkType: 'diagonal' | 'step' | 'curve' | 'line') => void;
  setStepPercent: (stepPercent: number) => void;
}

const controlStyles: React.CSSProperties = { fontSize: 10 };

export const LinkControls: React.FC<LinkControlsProps> = ({
  layout,
  orientation,
  linkType,
  stepPercent,
  setLayout,
  setOrientation,
  setLinkType,
  setStepPercent,
}) => {
  const isPolar = layout === 'polar';
  const isStepType = linkType === 'step';
  
  return (
    <div style={controlStyles}>
      <label>layout:</label>&nbsp;
      <select
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setLayout(e.target.value as 'polar' | 'cartesian')}
        value={layout}>
        <option value="cartesian">cartesian</option>
        <option value="polar">polar</option>
      </select>
      &nbsp;&nbsp;
      <label>orientation:</label>&nbsp;
      <select
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setOrientation(e.target.value as 'vertical' | 'horizontal')}
        value={orientation}
        disabled={isPolar}>
        <option value="vertical">vertical</option>
        <option value="horizontal">horizontal</option>
      </select>
      &nbsp;&nbsp;
      <label>link:</label>&nbsp;
      <select
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setLinkType(e.target.value as 'diagonal' | 'step' | 'curve' | 'line')}
        value={linkType}>
        <option value="diagonal">diagonal</option>
        <option value="step">step</option>
        <option value="curve">curve</option>
        <option value="line">line</option>
      </select>
      {isStepType && !isPolar && (
        <>
          &nbsp;&nbsp;
          <label>step:</label>&nbsp;
          <input
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            type="range"
            min={0}
            max={1}
            step={0.1}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStepPercent(Number(e.target.value))}
            value={stepPercent}
            disabled={!isStepType || isPolar} />
        </>
      )}
    </div>
  );
}; 