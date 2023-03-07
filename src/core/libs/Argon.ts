import argon from "argon2";

export class Argon {
  static async encrypt(text: string): Promise<string> {
    return await argon.hash(text);
  }

  static async compare(text: string, encrypted: string): Promise<boolean> {
    return await argon.verify(encrypted, text);
  }
}
