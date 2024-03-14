import keccak256 from "keccak256";
import { encrypt as ecies } from "eciesjs";
import { XChaCha20Poly1305 } from "@stablelib/xchacha20poly1305";
import { randomBytes } from "@stablelib/random";

export function encrypt(question1:string, answer1:string, question2:string, answer2:string, question3:string, answer3:string, password:string):string {
  if (
    !question1 ||
    !answer1 ||
    !question2 ||
    !answer2 ||
    !question3 ||
    !answer3 ||
    !password
  ) {
    throw new Error("all parameters must not be empty")
  }
  // hash answers
  let answerHash = keccak256(
    answer1.toLowerCase() + answer2.toLowerCase() + answer3.toLowerCase()
  ).toString("hex");
  // encrypt the password
  let nonce = randomBytes(24);
  let aead = new XChaCha20Poly1305(
    new Uint8Array(Buffer.from(answerHash, "utf-8")).slice(0, 32)
  );
  let encryptedPassword = Buffer.from(
    aead.seal(nonce, new Uint8Array(Buffer.from(password, "utf-8")))
  ).toString("base64");
  // hash the answer hash
  let hashOfHash = keccak256(answerHash).toString("hex");
  // plaintext
  let plaintext = JSON.stringify({
    question1,
    question2,
    question3,
    encryptedPassword,
    hashOfHash,
    nonce: Buffer.from(nonce).toString("base64"),
  });
  return plaintext
}

export function secure_encrypt(question1:string, answer1:string, question2:string, answer2:string, question3:string, answer3:string, password:string, base64PubKey:string):string {
  let plaintext = encrypt(question1, answer1, question2, answer2, question3, answer3, password)
  if (!base64PubKey) {
    throw new Error("base64PubKey must not be empty")
  }
  // encrypt the plaintext
  let ciphertext = ecies(
    Buffer.from(base64PubKey, "base64").toString("hex"),
    Buffer.from(Buffer.from(plaintext).toString("base64"))
  ).toString("base64");
  return ciphertext
}

export function decrypt(answer1:string, answer2:string, answer3:string, plaintext:string):string {
  if (
    !answer1 ||
    !answer2 ||
    !answer3 ||
    !plaintext
  ) {
    throw new Error("all parameters must not be empty")
  }
  // parse plaintext
  let plaintextObj = JSON.parse(plaintext);
  if (
    !plaintextObj.question1 ||
    !plaintextObj.question2 ||
    !plaintextObj.question3 ||
    !plaintextObj.encryptedPassword ||
    !plaintextObj.hashOfHash ||
    !plaintextObj.nonce
  ) {
    throw new Error("deformed plaintext")
  }
  // hash answers
  let answerHash = keccak256(
    answer1.toLowerCase() + answer2.toLowerCase() + answer3.toLowerCase()
  ).toString("hex");
  // validate hashOfHash
  if (plaintextObj.hashOfHash != keccak256(answerHash).toString("hex")) {
    throw new Error("invalid plaintext")
  }
  // decrypt 
  let aead = new XChaCha20Poly1305(
    new Uint8Array(Buffer.from(answerHash, "utf-8")).slice(0, 32)
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