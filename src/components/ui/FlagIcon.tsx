import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

interface FlagIconProps {
  countryCode: string;
  size?: number;
}

export function FlagIcon({ countryCode, size = 24 }: FlagIconProps) {
  return (
    <Svg
      width={Math.round(size * 1.4)}
      height={size}
      viewBox="0 0 28 20"
      accessibilityLabel={`${countryCode} flag`}
      accessibilityRole="image"
    >
      {renderFlag(countryCode)}
      <Rect x="0.4" y="0.4" width="27.2" height="19.2" rx="2" fill="none" stroke="rgba(27,28,25,0.18)" strokeWidth="0.8" />
    </Svg>
  );
}

function renderFlag(countryCode: string) {
  switch (countryCode) {
    case 'GB':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#012169" />
          <Path d="M0 0L28 20M28 0L0 20" stroke="#FFF" strokeWidth="5" />
          <Path d="M0 0L28 20M28 0L0 20" stroke="#C8102E" strokeWidth="2" />
          <Path d="M14 0V20M0 10H28" stroke="#FFF" strokeWidth="6" />
          <Path d="M14 0V20M0 10H28" stroke="#C8102E" strokeWidth="3.2" />
        </>
      );
    case 'FR':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#FFF" />
          <Rect width="9.34" height="20" rx="2" fill="#0055A4" />
          <Rect x="18.66" width="9.34" height="20" rx="2" fill="#EF4135" />
        </>
      );
    case 'MA':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#C1272D" />
          <Polygon points="14,5.2 15.1,8.5 18.6,8.5 15.8,10.5 16.9,13.8 14,11.8 11.1,13.8 12.2,10.5 9.4,8.5 12.9,8.5" fill="none" stroke="#006233" strokeWidth="1.1" />
        </>
      );
    case 'ES':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#AA151B" />
          <Rect y="5" width="28" height="10" fill="#F1BF00" />
        </>
      );
    case 'DE':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#000" />
          <Rect y="6.67" width="28" height="6.67" fill="#DD0000" />
          <Rect y="13.34" width="28" height="6.66" rx="2" fill="#FFCE00" />
        </>
      );
    case 'PT':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#FF0000" />
          <Rect width="11.2" height="20" rx="2" fill="#046A38" />
          <Circle cx="11.2" cy="10" r="2.6" fill="#FBCB0A" />
        </>
      );
    case 'IT':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#FFF" />
          <Rect width="9.34" height="20" rx="2" fill="#009246" />
          <Rect x="18.66" width="9.34" height="20" rx="2" fill="#CE2B37" />
        </>
      );
    case 'NL':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#AE1C28" />
          <Rect y="6.67" width="28" height="6.67" fill="#FFF" />
          <Rect y="13.34" width="28" height="6.66" rx="2" fill="#21468B" />
        </>
      );
    case 'TR':
      return (
        <>
          <Rect width="28" height="20" rx="2" fill="#E30A17" />
          <Circle cx="11" cy="10" r="4.2" fill="#FFF" />
          <Circle cx="12.5" cy="10" r="3.35" fill="#E30A17" />
          <Polygon points="17.1,7.5 17.7,9.2 19.5,9.2 18,10.3 18.6,12 17.1,11 15.6,12 16.2,10.3 14.7,9.2 16.5,9.2" fill="#FFF" />
        </>
      );
    default:
      return <Rect width="28" height="20" rx="2" fill="#E5E3DE" />;
  }
}

export default FlagIcon;
