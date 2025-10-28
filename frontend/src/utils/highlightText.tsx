import { Fragment } from 'react';

/**
 * Escape special regex characters in a string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight matching text with a <mark> element
 * Returns React nodes with highlighted matches
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  try {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        // Reset regex lastIndex after test
        regex.lastIndex = 0;
        return (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-500/30 text-slate-900 dark:text-white rounded px-0.5"
          >
            {part}
          </mark>
        );
      }
      return <Fragment key={index}>{part}</Fragment>;
    });
  } catch (error) {
    // If regex fails (invalid query), return original text
    return text;
  }
}

/**
 * Check if text contains a search query (case-insensitive)
 */
export function containsQuery(text: string | undefined, query: string): boolean {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}
