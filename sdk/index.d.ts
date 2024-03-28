export function encrypt(chachakey: string, password: string, preObject: any): string;
export function secure_encrypt(plaintext: string, hexPubKey: string): string;
export function decrypt(chachakey: string, plaintext: string): string;
export function generateRandomPassword(): string;
