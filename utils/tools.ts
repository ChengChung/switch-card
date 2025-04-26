export function formatMin(min: number): string {
  return min < 60 ? `${min}min` : `${(min / 60).toFixed(1)}h`
}

export function getCountryFlagSVGURL(country: string): string {
  const c = country.toLowerCase()
  return `https://cdn.jsdelivr.net/npm/round-flag-icons@1.3.0/flags/${c}.svg`
}

export function getAvatarUrl(custom: string, nintendo: string): string {
  return custom || nintendo
}
