/**
 * Strip HTML tags from a string and return plain text
 * Also converts HTML entities to their text equivalents
 */
export function stripHtml(html: string | undefined): string {
  if (!html) return '';

  // Create a temporary div element to leverage browser's HTML parsing
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // Get text content (automatically handles HTML entities)
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Strip HTML and truncate to a maximum length
 */
export function stripAndTruncate(html: string | undefined, maxLength: number = 200): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
