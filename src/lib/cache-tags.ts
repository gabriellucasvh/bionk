export function profileTag(username: string): string {
  return `profile:${username}`;
}

export function profileBaseTag(username: string): string {
  return `profile:base:${username}`;
}

export function profileLinksTag(username: string): string {
  return `profile:links:${username}`;
}

export function profileSectionsTag(username: string): string {
  return `profile:sections:${username}`;
}

export function profileTextsTag(username: string): string {
  return `profile:texts:${username}`;
}

export function profileVideosTag(username: string): string {
  return `profile:videos:${username}`;
}

export function profileImagesTag(username: string): string {
  return `profile:images:${username}`;
}

export function profileMusicsTag(username: string): string {
  return `profile:musics:${username}`;
}

export function profileEventsTag(username: string): string {
  return `profile:events:${username}`;
}

export function profileSocialLinksTag(username: string): string {
  return `profile:social:${username}`;
}

export function profileCustomizationsTag(username: string): string {
  return `profile:custom:${username}`;
}

export function allProfileTags(username: string): string[] {
  return [
    profileTag(username),
    profileBaseTag(username),
    profileLinksTag(username),
    profileSectionsTag(username),
    profileTextsTag(username),
    profileVideosTag(username),
    profileImagesTag(username),
    profileMusicsTag(username),
    profileEventsTag(username),
    profileSocialLinksTag(username),
    profileCustomizationsTag(username),
  ];
}
