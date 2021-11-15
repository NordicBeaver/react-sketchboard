import React from 'react';
import styles from './ColorPicker.module.css';

export interface ColorPickerProps {
  options: string[];
  onPick?: (color: string) => void;
}

export default function ColorPicker({ options, onPick }: ColorPickerProps) {
  return (
    <ul className={styles.colorPicker}>
      {options.map((color) => (
        <li
          className={styles.colorPickerOption}
          style={{ backgroundColor: `#${color}` }}
          onClick={() => onPick?.(color)}
        ></li>
      ))}
    </ul>
  );
}
