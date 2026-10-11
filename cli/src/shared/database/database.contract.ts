import type { SQLInputValue, StatementSync } from "node:sqlite";

export type Database = Readonly<{
  execute: (sql: string) => void;
  prepare: (sql: string) => StatementSync;
}>;
export type DatabaseValue = SQLInputValue;
