import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { OptionFormItem } from '../types';

/**
 * Option Form hook — purely local persistence (serverless).
 * Data is saved directly to the browser's localStorage.
 */
export function useOptionForm() {
  const [optionForm, setOptionFormState] = useLocalStorage<OptionFormItem[]>('cap-predictor-option-form', []);

  const reRank = (items: OptionFormItem[]) => items.map((item, idx) => ({ ...item, rank: idx + 1 }));

  const addOption = useCallback((collegeCode: string, choiceCode: string, collegeName: string, courseName: string, district: string) => {
    if (optionForm.some(item => item.choiceCode === choiceCode)) return;

    const newItem: OptionFormItem = {
      collegeCode, choiceCode, collegeName, courseName, district,
      rank: optionForm.length + 1,
    };

    setOptionFormState([...optionForm, newItem]);
  }, [optionForm, setOptionFormState]);

  const removeOption = useCallback((choiceCode: string) => {
    setOptionFormState(reRank(optionForm.filter(item => item.choiceCode !== choiceCode)));
  }, [optionForm, setOptionFormState]);

  const moveOption = useCallback((index: number, direction: 'up' | 'down') => {
    const items = [...optionForm];
    if (direction === 'up' && index > 0) {
      [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index + 1], items[index]] = [items[index], items[index + 1]];
    } else {
      return;
    }
    setOptionFormState(reRank(items));
  }, [optionForm, setOptionFormState]);

  const setRank = useCallback((choiceCode: string, newRank: number) => {
    const items = [...optionForm];
    const index = items.findIndex(item => item.choiceCode === choiceCode);
    if (index === -1) return;

    const targetIndex = Math.max(0, Math.min(items.length - 1, newRank - 1));
    const [removed] = items.splice(index, 1);
    items.splice(targetIndex, 0, removed);

    setOptionFormState(reRank(items));
  }, [optionForm, setOptionFormState]);

  const setOptionForm = useCallback((items: OptionFormItem[]) => {
    setOptionFormState(reRank(items));
  }, [setOptionFormState]);

  const hasOption = useCallback((choiceCode: string) => {
    return optionForm.some(item => item.choiceCode === choiceCode);
  }, [optionForm]);

  const exportOptionFormText = useCallback(() => {
    if (optionForm.length === 0) return 'My Option Form is empty.';

    let text = '🎓 *MY CAP ADMISSION OPTION ENTRY FORM* 🎓\n\n';
    optionForm.forEach((item) => {
      text += `Preference #${item.rank}\n`;
      text += `🔢 Choice Code: *${item.choiceCode}*\n`;
      text += `🏫 College: ${item.collegeName}\n`;
      text += `💻 Branch: ${item.courseName}\n`;
      text += `Code: ${item.collegeCode} | 📍 District: ${item.district}\n\n`;
    });

    text += 'Generated via CAP Admission Predictor';
    return text;
  }, [optionForm]);

  return {
    optionForm,
    addOption,
    removeOption,
    moveOption,
    setRank,
    hasOption,
    setOptionForm,
    exportOptionFormText,
  };
}
