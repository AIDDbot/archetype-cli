export type OptionReader<Value> = (value: unknown, field: string) => Value;
export type RawOptions = Readonly<Record<string, unknown>>;
export type ReadOption = <Value>(name: string, reader: OptionReader<Value>) => Value;
export type OptionForm<Values> = (read: ReadOption) => Values;

export function readOptions<Values>(options: RawOptions, form: OptionForm<Values>): Values {
  const read: ReadOption = (name, reader) => reader(options[name], `--${name}`);
  return form(read);
}
