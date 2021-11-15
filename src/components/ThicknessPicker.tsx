import React from 'react';
import styles from './ThicknessPicker.module.css';

export interface ThicknessPickerProps {
  options: number[];
  current: number;
  onPick?: (thickness: number) => void;
}

export default function ThicknessPicker({ options, current, onPick }: ThicknessPickerProps) {
  return (
    <ul className={styles.thicknessPicker}>
      {options.map((thickness) => (
        <li
          key={thickness}
          className={`${styles.thicknessPickerOption} ${current === thickness ? styles.active : ''}`}
          onClick={() => onPick?.(thickness)}
        >
          <span className={styles.dot} style={{ width: thickness, height: thickness }}></span>
        </li>
      ))}
    </ul>
  );
}
