import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Shortlist hook — purely local persistence (serverless).
 * Data is saved directly to the browser's localStorage.
 */
export function useShortlist() {
  const [shortlist, setShortlist] = useLocalStorage(
    "cap-predictor-shortlist",
    [],
  );

  const add = useCallback(
    (collegeCode, choiceCode, collegeName, courseName, district) => {
      const exists = shortlist.some(
        (item) =>
          item.collegeCode === collegeCode && item.choiceCode === choiceCode,
      );
      if (exists) return;

      const newItem = {
        collegeCode,
        choiceCode,
        collegeName,
        courseName,
        district,
        addedAt: new Date().toISOString(),
      };
      setShortlist([...shortlist, newItem]);
    },
    [shortlist, setShortlist],
  );

  const remove = useCallback(
    (collegeCode, choiceCode) => {
      setShortlist(
        shortlist.filter(
          (item) =>
            !(
              item.collegeCode === collegeCode && item.choiceCode === choiceCode
            ),
        ),
      );
    },
    [shortlist, setShortlist],
  );

  const toggle = useCallback(
    (collegeCode, choiceCode, collegeName, courseName, district) => {
      const exists = shortlist.some(
        (item) =>
          item.collegeCode === collegeCode && item.choiceCode === choiceCode,
      );
      if (exists) {
        remove(collegeCode, choiceCode);
      } else {
        add(collegeCode, choiceCode, collegeName, courseName, district);
      }
    },
    [shortlist, add, remove],
  );

  const isShortlisted = useCallback(
    (collegeCode, choiceCode) => {
      return shortlist.some(
        (item) =>
          item.collegeCode === collegeCode && item.choiceCode === choiceCode,
      );
    },
    [shortlist],
  );

  const exportAsText = useCallback(() => {
    if (shortlist.length === 0) return "My Shortlist is empty.";

    let text = "🎓 *MY CAP ADMISSION SHORTLIST* 🎓\n\n";
    shortlist.forEach((item, index) => {
      text += `${index + 1}. *${item.collegeName}*\n`;
      text += `   📍 District: ${item.district}\n`;
      text += `   💻 Branch: ${item.courseName}\n`;
      text += `   🔢 Choice Code: ${item.choiceCode}\n\n`;
    });

    text += "Generated via CAP Admission Predictor";
    return text;
  }, [shortlist]);

  return { shortlist, add, remove, toggle, isShortlisted, exportAsText };
}
