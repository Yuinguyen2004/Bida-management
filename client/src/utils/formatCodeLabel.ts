export const formatCodeLabel = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
