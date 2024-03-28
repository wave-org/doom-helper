import keccak256 from "keccak256";
import { encrypt as ecies } from "eciesjs";
import { XChaCha20Poly1305 } from "@stablelib/xchacha20poly1305";
import { randomBytes } from "@stablelib/random";
import moment from "moment";

export function encrypt(chachakey, password, preObject) {
  // hash chachakey
  let chachakeyHash = keccak256(
    chachakey
  ).toString("hex");
  // encrypt the password
  let nonce = randomBytes(24);
  let aead = new XChaCha20Poly1305(
    new Uint8Array(Buffer.from(chachakeyHash, "utf-8")).slice(0, 32)
  );
  let encryptedPassword = Buffer.from(
    aead.seal(nonce, new Uint8Array(Buffer.from(password, "utf-8")))
  ).toString("base64");
  // hash the chachakey hash
  let hashOfHash = keccak256(chachakeyHash).toString("hex");
  // plaintext
  let plaintext = JSON.stringify({
    ...preObject,
    encryptedPassword,
    hashOfHash,
    nonce: Buffer.from(nonce).toString("base64"),
  });
  return plaintext
}

export function secure_encrypt(plaintext, hexPubKey) {
  // encrypt the plaintext
  let ciphertext = ecies(
    hexPubKey,
    Buffer.from(Buffer.from(plaintext).toString("base64"))
  ).toString("base64");
  return ciphertext
}

export function decrypt(chachakey, plaintext) {
  // parse plaintext
  let plaintextObj = JSON.parse(plaintext);
  if (
    !plaintextObj.encryptedPassword ||
    !plaintextObj.hashOfHash ||
    !plaintextObj.nonce
  ) {
    throw new Error("deformed plaintext")
  }
  // hash chachakey
  let chachakeyHash = keccak256(
    chachakey
  ).toString("hex");
  // validate hashOfHash
  if (plaintextObj.hashOfHash != keccak256(chachakeyHash).toString("hex")) {
    throw new Error("invalid plaintext")
  }
  // decrypt 
  let aead = new XChaCha20Poly1305(
    new Uint8Array(Buffer.from(chachakeyHash, "utf-8")).slice(0, 32)
  );
  let password = aead.open(
    Buffer.from(plaintextObj.nonce, "base64"),
    Buffer.from(plaintextObj.encryptedPassword, "base64")
  );
  if (password) {
    return Buffer.from(password).toString()
  } else {
    return "null"
  }
}

export function generateRandomPassword() {
  const array = new Uint32Array(32);
  crypto.getRandomValues(array);
  return keccak256(
    Buffer.from(array).toString() +
      moment().format("x") +
      "f8f8a2f43c8376ccb0871305060d7b27b0554d2cc72bccf41b27056084114514"
  )
    .slice(0, 32)
    .toString("hex");
};