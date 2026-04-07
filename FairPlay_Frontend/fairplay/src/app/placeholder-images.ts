// Map content types to the three provided local assets in /public.
// Angular copies /public into the build output; these paths remain root-relative.

export const heroDefault = '/sports-tools.jpg';
export const venuePlaceholder = '/venue-placeholder.jpeg';
export const activitiesPlaceholder = '/activities.jpeg';
const sportImages: Record<string, string> = {
  football: '/football.jpg',
  soccer: '/soccer.jpg',
  futsal: '/soccer.jpg',
  badminton: '/sports-tools.jpg',
  basketball: '/sports-tools.jpg',
  cricket: '/sports-tools.jpg',
  tennis: '/sports-tools.jpg',
  venue: venuePlaceholder,
  activity: activitiesPlaceholder
};

function resolveBySport(label: string): string {
  const key = (label ?? '').toLowerCase();

  if (key.includes('avatar') || key.includes('profile')) {
    return heroDefault;
  }

  const match = Object.keys(sportImages).find((name) => key.includes(name));
  return (match && sportImages[match]) || (key.includes('activity') ? activitiesPlaceholder : venuePlaceholder);
}

export function placeholderImage(width: number, height: number, label: string): string {
  return resolveBySport(label);
}

export function sportPlaceholder(label: string, width = 1200, height = 800): string {
  return resolveBySport(label);
}
