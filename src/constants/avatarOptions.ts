export type AvatarOption = {
  id: string;
  iconName: string;
  bgColor: string;
  iconColor: string;
  label: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'person-green', iconName: 'person', bgColor: '#DCFCE7', iconColor: '#15803D', label: 'Person Green' },
  { id: 'face-blue', iconName: 'face', bgColor: '#DBEAFE', iconColor: '#2563EB', label: 'Face Blue' },
  { id: 'pets-orange', iconName: 'pets', bgColor: '#FFEDD5', iconColor: '#EA580C', label: 'Pets Orange' },
  { id: 'favorite-pink', iconName: 'favorite', bgColor: '#FCE7F3', iconColor: '#DB2777', label: 'Favorite Pink' },
  { id: 'star-purple', iconName: 'star', bgColor: '#F3E8FF', iconColor: '#7C3AED', label: 'Star Purple' },
  { id: 'eco-teal', iconName: 'eco', bgColor: '#CCFBF1', iconColor: '#0F766E', label: 'Eco Teal' },
  { id: 'coffee-amber', iconName: 'local-cafe', bgColor: '#FEF3C7', iconColor: '#B45309', label: 'Coffee Amber' },
  { id: 'food-indigo', iconName: 'restaurant', bgColor: '#E0E7FF', iconColor: '#4338CA', label: 'Food Indigo' },
  { id: 'cake-red', iconName: 'cake', bgColor: '#FEE2E2', iconColor: '#DC2626', label: 'Cake Red' },
  { id: 'music-cyan', iconName: 'music-note', bgColor: '#CFFAFE', iconColor: '#0891B2', label: 'Music Cyan' },
  { id: 'game-lime', iconName: 'sports-esports', bgColor: '#ECFCCB', iconColor: '#65A30D', label: 'Game Lime' },
  { id: 'school-brown', iconName: 'school', bgColor: '#E7E5E4', iconColor: '#78716C', label: 'School Brown' },
  { id: 'spa-slate', iconName: 'spa', bgColor: '#E2E8F0', iconColor: '#475569', label: 'Spa Slate' },
  { id: 'bolt-yellow', iconName: 'bolt', bgColor: '#FEF9C3', iconColor: '#CA8A04', label: 'Bolt Yellow' },
  { id: 'park-emerald', iconName: 'park', bgColor: '#D1FAE5', iconColor: '#059669', label: 'Park Emerald' },
];

export const getAvatarById = (avatarId?: string): AvatarOption => {
  return AVATAR_OPTIONS.find((item) => item.id === avatarId) || AVATAR_OPTIONS[0];
};