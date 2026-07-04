import React from 'react';
import type { LuaInstance } from './parser';
import { udim2ToSize, udim2ToPosition, parseColor3, parseString } from './utils';

interface RendererProps {
  instance: LuaInstance;
}

export const LuaComponentRenderer: React.FC<RendererProps> = ({ instance }) => {
  const { className, properties, children } = instance;

  // Base styles applied to almost all Roblox UI elements
  const baseStyle: React.CSSProperties = {
    ...udim2ToSize(properties['Size'] || 'UDim2.new(0, 100, 0, 100)'), // default size
    ...udim2ToPosition(properties['Position'] || 'UDim2.new(0, 0, 0, 0)'),
    backgroundColor: parseColor3(properties['BackgroundColor3']) || 'transparent',
    overflow: 'hidden', // to prevent children from spilling in unexpected ways
    boxSizing: 'border-box',
    display: properties['Visible'] === 'false' ? 'none' : 'flex',
    flexDirection: 'column',
  };

  // Border (BorderSizePixel, BorderColor3)
  const borderSize = parseInt(properties['BorderSizePixel'] || '0');
  if (borderSize > 0) {
    const borderColor = parseColor3(properties['BorderColor3']) || 'black';
    baseStyle.border = `${borderSize}px solid ${borderColor}`;
  }

  // Common text properties for text elements
  const isTextElement = className === 'TextLabel' || className === 'TextButton' || className === 'TextBox';
  const textProps: React.CSSProperties = {};
  let textContent = '';

  if (isTextElement) {
    textContent = parseString(properties['Text']) || '';
    textProps.color = parseColor3(properties['TextColor3']) || 'black';
    textProps.justifyContent = 'center';
    textProps.alignItems = 'center';
    textProps.textAlign = 'center';
    
    const textScaled = properties['TextScaled'] === 'true';
    if (textScaled) {
      textProps.fontSize = 'min(100%, 20px)'; // simplistic handling of TextScaled
    } else {
      const fontSize = properties['TextSize'];
      if (fontSize) {
        textProps.fontSize = `${parseInt(fontSize)}px`;
      }
    }
  }

  // BackgroundTransparency
  const bgTransparency = parseFloat(properties['BackgroundTransparency'] || '0');
  if (bgTransparency === 1) {
    baseStyle.backgroundColor = 'transparent';
  } else if (bgTransparency > 0 && baseStyle.backgroundColor !== 'transparent') {
    // A bit hacky, but proper rgba would require parsing the rgb and injecting alpha.
    baseStyle.opacity = 1 - bgTransparency;
  }

  // Render children recursively
  const renderChildren = () => {
    return children.map((child, idx) => (
      <LuaComponentRenderer key={child.id || idx} instance={child} />
    ));
  };

  // Map to appropriate HTML elements
  switch (className) {
    case 'ScreenGui':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} title={`ScreenGui: ${instance.id}`}>
          {renderChildren()}
        </div>
      );
    case 'Frame':
    case 'ScrollingFrame':
      return (
        <div style={baseStyle} title={`Frame: ${instance.id}`}>
          {renderChildren()}
        </div>
      );
    case 'TextLabel':
      return (
        <div style={{ ...baseStyle, ...textProps }} title={`TextLabel: ${instance.id}`}>
          {textContent}
          {renderChildren()}
        </div>
      );
    case 'TextButton':
      return (
        <button style={{ ...baseStyle, ...textProps, cursor: 'pointer', border: 'none', padding: 0 }} title={`TextButton: ${instance.id}`}>
          {textContent}
          {renderChildren()}
        </button>
      );
    case 'TextBox':
      return (
        <input 
          type="text" 
          defaultValue={textContent} 
          style={{ ...baseStyle, ...textProps, border: 'none', padding: 0 }} 
          title={`TextBox: ${instance.id}`}
        />
      );
    case 'ImageLabel':
    case 'ImageButton':
      const imageUri = parseString(properties['Image']);
      // rbxassetid:// conversion might be needed, but we can't load roblox assets directly easily.
      // So we just render a placeholder or the raw url if it's http
      const bgImage = imageUri?.startsWith('http') ? `url(${imageUri})` : 'none';
      return (
        <div style={{ ...baseStyle, backgroundImage: bgImage, backgroundSize: '100% 100%' }} title={`ImageLabel: ${instance.id}`}>
          {renderChildren()}
        </div>
      );
    default:
      // Fallback for unknown classes
      return (
        <div style={{...baseStyle, border: '1px dashed red'}} title={`Unknown (${className}): ${instance.id}`}>
          {renderChildren()}
        </div>
      );
  }
};
