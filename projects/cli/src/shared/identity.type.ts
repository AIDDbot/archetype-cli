export type Author = { name: string; url: string };

export type Identity = {
  displayName: string;
  description: string;
  author: Author;
  version: string;
};
