export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', color: '#f7df1e', bg: '#fffbce', darkBg: '#2d2b00' },
  { value: 'typescript', label: 'TypeScript', color: '#3178c6', bg: '#dbeafe', darkBg: '#0c1f3d' },
  { value: 'python',     label: 'Python',     color: '#3776ab', bg: '#dbeafe', darkBg: '#0c1f3d' },
  { value: 'css',        label: 'CSS',        color: '#1572b6', bg: '#dbeafe', darkBg: '#0c1f3d' },
  { value: 'html',       label: 'HTML',       color: '#e34f26', bg: '#fee2e2', darkBg: '#3d0c0c' },
  { value: 'java',       label: 'Java',       color: '#b07219', bg: '#fef3c7', darkBg: '#3d2a00' },
  { value: 'cpp',        label: 'C++',        color: '#00599c', bg: '#dbeafe', darkBg: '#0c1f3d' },
  { value: 'rust',       label: 'Rust',       color: '#dea584', bg: '#fef3c7', darkBg: '#3d2000' },
  { value: 'go',         label: 'Go',         color: '#00add8', bg: '#cffafe', darkBg: '#002a3d' },
  { value: 'sql',        label: 'SQL',        color: '#336791', bg: '#dbeafe', darkBg: '#0c1f3d' },
  { value: 'json',       label: 'JSON',       color: '#6b7280', bg: '#f3f4f6', darkBg: '#1f2937' },
  { value: 'bash',       label: 'Bash',       color: '#4eaa25', bg: '#dcfce7', darkBg: '#052e16' },
  { value: 'markdown',   label: 'Markdown',   color: '#083fa1', bg: '#dbeafe', darkBg: '#0c1f3d' },
  { value: 'php',        label: 'PHP',        color: '#777bb4', bg: '#ede9fe', darkBg: '#1e1b4b' },
  { value: 'ruby',       label: 'Ruby',       color: '#cc342d', bg: '#fee2e2', darkBg: '#3d0c0c' },
  { value: 'other',      label: 'Other',      color: '#6b7280', bg: '#f3f4f6', darkBg: '#1f2937' },
]

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map(l => [l.value, l]))

export function getLanguageInfo(value) {
  return LANGUAGE_MAP[value] || LANGUAGE_MAP['other']
}
