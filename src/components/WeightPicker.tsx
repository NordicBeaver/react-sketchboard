import React from 'react';
import styles from './WeightPicker.module.css';

export interface WeightPickerProps {
  options: number[];
  current: number;
  onPick?: (weight: number) => void;
}

export default function WeightPicker({ options, current, onPick }: WeightPickerProps) {
  return (
    <ul className={styles.weightPicker}>
      {options.map((weight) => (
        <li
          key={weight}
          className={`${styles.weightPickerOption} ${current === weight ? styles.active : ''}`}
          onClick={() => onPick?.(weight)}
        >
          <span className={styles.dot} style={{ width: weight, height: weight }}></span>
        </li>
      ))}
    </ul>
  );
}
