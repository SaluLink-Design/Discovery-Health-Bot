/** Default member draft for campaign onboarding — single path, no character fork. */

export const DEFAULT_PERSONA_NAME = 'Thabo';

export const buildDefaultMemberDraft = () => ({
  characterId: 'member',
  name: DEFAULT_PERSONA_NAME,
  idNumber: '',
  email: '',
  medicalAid: 'discovery',
  plan: '',
  planThemeId: '',
  planSubThemeId: '',
  additionalAdults: 0,
  children: 0,
  conditions: [],
  province: '',
  town: '',
});

/** @deprecated Legacy helper — always returns the default draft. */
export const buildDraftFromCharacter = () => buildDefaultMemberDraft();

/** @deprecated No character archetypes — use profile.name instead. */
export const getCharacterById = () => null;

export const DEMO_CHARACTERS = [];
