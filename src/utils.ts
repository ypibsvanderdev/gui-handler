export function parseUDim2(value: string | undefined): { scaleX: number, offsetX: number, scaleY: number, offsetY: number } | null {
  if (!value) return null;
  // Match UDim2.new(0, 0, 0, 0)
  const regex = /UDim2\.new\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/;
  const match = value.match(regex);
  if (match) {
    return {
      scaleX: parseFloat(match[1]),
      offsetX: parseFloat(match[2]),
      scaleY: parseFloat(match[3]),
      offsetY: parseFloat(match[4]),
    };
  }
  return null;
}

export function udim2ToSize(value: string | undefined) {
  const parsed = parseUDim2(value);
  if (!parsed) return {};
  return {
    width: `calc(${parsed.scaleX * 100}% + ${parsed.offsetX}px)`,
    height: `calc(${parsed.scaleY * 100}% + ${parsed.offsetY}px)`,
  };
}

export function udim2ToPosition(value: string | undefined) {
  const parsed = parseUDim2(value);
  if (!parsed) return {};
  return {
    left: `calc(${parsed.scaleX * 100}% + ${parsed.offsetX}px)`,
    top: `calc(${parsed.scaleY * 100}% + ${parsed.offsetY}px)`,
    position: 'absolute' as const,
  };
}

export function parseColor3(value: string | undefined): string | null {
  if (!value) return null;
  const rgbRegex = /Color3\.fromRGB\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/;
  const rgbMatch = value.match(rgbRegex);
  if (rgbMatch) {
    return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
  }

  const newRegex = /Color3\.new\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/;
  const newMatch = value.match(newRegex);
  if (newMatch) {
    return `rgb(${parseFloat(newMatch[1]) * 255}, ${parseFloat(newMatch[2]) * 255}, ${parseFloat(newMatch[3]) * 255})`;
  }
  return null;
}

// Remove surrounding quotes from strings
export function parseString(value: string | undefined): string | null {
  if (!value) return null;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
