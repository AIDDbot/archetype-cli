export type Command = Readonly<{
  name: string;
  execute: () => void;
}>;
