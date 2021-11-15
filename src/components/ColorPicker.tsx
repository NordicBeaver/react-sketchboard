import React from 'react';
import styles from './ColorPicker.module.css';

export interface ColorPickerProps {
  options: string[];
  current: string;
  onPick?: (color: string) => void;
}

export default function ColorPicker({ options, current, onPick }: ColorPickerProps) {
  return (
    <ul className={styles.colorPicker}>
      {options.map((color) => (
        <li
          key={color}
          className={`${styles.colorPickerOption} ${current === color ? styles.active : ''}`}
          style={{ backgroundColor: `#${color}` }}
          onClick={() => onPick?.(color)}
        ></li>
      ))}
    </ul>
  );
}
