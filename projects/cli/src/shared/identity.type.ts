/** The identity fields of the `package.json` of the project. Each one is required. */
export interface Author {
  name: string;
  url: string;
}
export interface Identity {
  displayName: string;
  description: string;
  author: Author;
  version: string;
}
