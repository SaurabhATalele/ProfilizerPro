declare module "bcryptjs" {
  function genSalt(rounds?: number): Promise<string>;
  function hash(s: string, salt: string | number): Promise<string>;
  function compare(s: string, hash: string): Promise<boolean>;
  function hashSync(s: string, salt: string | number): string;
  function compareSync(s: string, hash: string): boolean;
  function genSaltSync(rounds?: number): string;

  export default {
    genSalt,
    hash,
    compare,
    hashSync,
    compareSync,
    genSaltSync,
  };
}
