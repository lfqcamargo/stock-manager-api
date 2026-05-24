export type EncryptOptions = {
  expiresIn?: string | number;
};

export abstract class Encrypter {
  abstract encrypt(
    payload: Record<string, unknown>,
    options?: EncryptOptions,
  ): Promise<string>;
}
