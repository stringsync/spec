export interface Reader {
  read(): Promise<string>;
}

export type Readable = string | Reader;
