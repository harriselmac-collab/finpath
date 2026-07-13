declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css';

declare module '@expo/vector-icons' {
  import React from 'react';
  import { TextProps } from 'react-native';
  export class Ionicons extends React.Component<TextProps & { name: string; size?: number; color?: any }> {}
}
