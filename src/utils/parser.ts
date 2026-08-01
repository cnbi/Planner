/**
 * Inline parsing helpers for `@tag_name` and `#project_name`
 */

export interface ParsedInput {
  cleanTitle: string;
  tags: string[];
  project?: string;
}

export function parseInlineMetadata(input: string): ParsedInput {
  if (!input) {
    return { cleanTitle: '', tags: [] };
  }

  // Regex to match @tag_name
  const tagRegex = /@([a-zA-Z0-9_\-]+)/g;
  // Regex to match #project_name
  const projectRegex = /#([a-zA-Z0-9_\-]+)/g;

  const tags: string[] = [];
  let project: string | undefined = undefined;

  let match: RegExpExecArray | null;

  // Extract tags
  while ((match = tagRegex.exec(input)) !== null) {
    const tag = match[1].toLowerCase();
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Extract project (take the last #project specified if multiple)
  while ((match = projectRegex.exec(input)) !== null) {
    project = match[1].toLowerCase();
  }

  // Optionally clean title by removing tags and projects if desired,
  // or keep cleanTitle without the trailing or inline symbols
  let cleanTitle = input
    .replace(/@([a-zA-Z0-9_\-]+)/g, '')
    .replace(/#([a-zA-Z0-9_\-]+)/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleanTitle) {
    cleanTitle = input.trim();
  }

  return {
    cleanTitle,
    tags,
    project,
  };
}
