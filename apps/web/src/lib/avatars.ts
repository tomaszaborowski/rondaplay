export interface CharacterAvatar {
  id: string;
  name: string;
  avatarUrl: string;
  badgeColor: string;
  accentColor: string;
}

export const RONDA_CHARACTERS: CharacterAvatar[] = [
  {
    id: 'avatar-detective',
    name: 'El Impostor',
    avatarUrl: '/avatars/avatar-detective.png',
    badgeColor: '#006a61',
    accentColor: '#72f5e3',
  },
  {
    id: 'avatar-purple',
    name: 'Alex Vortex',
    avatarUrl: '/avatars/avatar-purple.png',
    badgeColor: '#431c5d',
    accentColor: '#b285cd',
  },
  {
    id: 'avatar-blue-suit',
    name: 'Drift King',
    avatarUrl: '/avatars/avatar-blue-suit.png',
    badgeColor: '#006a61',
    accentColor: '#55dbca',
  },
  {
    id: 'avatar-pink-granny',
    name: 'Pixel Queen',
    avatarUrl: '/avatars/avatar-pink-granny.png',
    badgeColor: '#d95a82',
    accentColor: '#f06994',
  },
  {
    id: 'avatar-girl',
    name: 'Speed Star',
    avatarUrl: '/avatars/avatar-girl.png',
    badgeColor: '#d95a82',
    accentColor: '#ffd9e1',
  },
];

export function getAvatarUrl(characterId?: string, customUrl?: string): string {
  if (customUrl && customUrl.trim() !== '') return customUrl;
  const character = RONDA_CHARACTERS.find((c) => c.id === characterId);
  return character ? character.avatarUrl : RONDA_CHARACTERS[0].avatarUrl;
}
