"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.secure_encrypt = exports.encrypt = void 0;
const keccak256_1 = __importDefault(require("keccak256"));
const eciesjs_1 = require("eciesjs");
const xchacha20poly1305_1 = require("@stablelib/xchacha20poly1305");
const random_1 = require("@stablelib/random");
function encrypt(question1, answer1, question2, answer2, question3, answer3, password) {
    if (!question1 ||
        !answer1 ||
        !question2 ||
        !answer2 ||
        !question3 ||
        !answer3 ||
        !password) {
        throw new Error("all parameters must not be empty");
    }
    // hash answers
    let answerHash = (0, keccak256_1.default)(answer1.toLowerCase() + answer2.toLowerCase() + answer3.toLowerCase()).toString("hex");
    // encrypt the password
    let nonce = (0, random_1.randomBytes)(24);
    let aead = new xchacha20poly1305_1.XChaCha20Poly1305(new Uint8Array(Buffer.from(answerHash, "utf-8")).slice(0, 32));
    let encryptedPassword = Buffer.from(aead.seal(nonce, new Uint8Array(Buffer.from(password, "utf-8")))).toString("base64");
    // hash the answer hash
    let hashOfHash = (0, keccak256_1.default)(answerHash).toString("hex");
    // plaintext
    let plaintext = JSON.stringify({
        question1,
        question2,
        question3,
        encryptedPassword,
        hashOfHash,
        nonce: Buffer.from(nonce).toString("base64"),
    });
    return plaintext;
}
exports.encrypt = encrypt;
function secure_encrypt(question1, answer1, question2, answer2, question3, answer3, password, base64PubKey) {
    let plaintext = encrypt(question1, answer1, question2, answer2, question3, answer3, password);
    if (!base64PubKey) {
        throw new Error("base64PubKey must not be empty");
    }
    // encrypt the plaintext
    let ciphertext = (0, eciesjs_1.encrypt)(Buffer.from(base64PubKey, "base64").toString("hex"), Buffer.from(Buffer.from(plaintext).toString("base64"))).toString("base64");
    return ciphertext;
}
exports.secure_encrypt = secure_encrypt;
function decrypt(answer1, answer2, answer3, plaintext) {
    if (!answer1 ||
        !answer2 ||
        !answer3 ||
        !plaintext) {
        throw new Error("all parameters must not be empty");
    }
    // parse plaintext
    let plaintextObj = JSON.parse(plaintext);
    if (!plaintextObj.question1 ||
        !plaintextObj.question2 ||
        !plaintextObj.question3 ||
        !plaintextObj.encryptedPassword ||
        !plaintextObj.hashOfHash ||
        !plaintextObj.nonce) {
        throw new Error("deformed plaintext");
    }
    // hash answers
    let answerHash = (0, keccak256_1.default)(answer1.toLowerCase() + answer2.toLowerCase() + answer3.toLowerCase()).toString("hex");
    // validate hashOfHash
    if (plaintextObj.hashOfHash != (0, keccak256_1.default)(answerHash).toString("hex")) {
        throw new Error("invalid plaintext");
    }
    // decrypt 
    let aead = new xchacha20poly1305_1.XChaCha20Poly1305(new Uint8Array(Buffer.from(answerHash, "utf-8")).slice(0, 32));
    let password = aead.open(Buffer.from(plaintextObj.nonce, "base64"), Buffer.from(plaintextObj.encryptedPassword, "base64"));
    if (password) {
        return Buffer.from(password).toString();
    }
    else {
        return "null";
    }
}
exports.decrypt = decrypt;
