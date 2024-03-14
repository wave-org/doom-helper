"use client";
import React, { useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { request, IncomingMessage, RequestOptions } from "http";
import shared from "../shared";
import keccak256 from "keccak256";
import { XChaCha20Poly1305 } from "@stablelib/xchacha20poly1305";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Home() {
  const handleHttpRequest = (
    path: string,
    method: string,
    reqData?: any,
    respHandle?: (response: IncomingMessage) => void,
    respDataHandle?: (chunk: any) => void
  ) => {
    return new Promise((resolve: any, reject: any) => {
      const reqOpts: RequestOptions = {
        path,
        method,
      };
      let postData = null;
      if (reqData) {
        postData = JSON.stringify(reqData);
        reqOpts.headers = {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        };
      }
      const req = request(reqOpts, (res) => {
        res.setEncoding("utf8");
        if (respDataHandle) {
          res.on("data", respDataHandle);
        }
        res.on("end", () => {
          resolve();
        });
      });
      if (respHandle) {
        req.on("response", respHandle);
      }
      req.on("error", (e) => {
        reject(e);
      });
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };

  const syncRequest = async (
    path: string,
    method: string,
    reqData?: any,
    respHandle?: (response: IncomingMessage) => void,
    respDataHandle?: (chunk: any) => void
  ) => {
    await handleHttpRequest(path, method, reqData, respHandle, respDataHandle);
  };

  const [publickKey, setPublicKey] = React.useState("");

  const [toast, setToast] = React.useState("");
  const [errorToast, setErrorToast] = React.useState("");

  const [question1, setQuestion1] = React.useState("");
  const [answer1, setAnswer1] = React.useState("");
  const [question2, setQuestion2] = React.useState("");
  const [answer2, setAnswer2] = React.useState("");
  const [question3, setQuestion3] = React.useState("");
  const [answer3, setAnswer3] = React.useState("");

  const [userPassword, setUserPassword] = React.useState("");

  const [plaintext, setPlaintext] = React.useState("");
  const [encryptedPassword, setEncryptedPassword] = React.useState("");
  const [hashOfHash, setHashOfHash] = React.useState("");
  const [nonce, setNonce] = React.useState("");

  const doCommit = () => {
    if (!plaintext) {
      setErrorToast("plaintext is empty");
      return;
    }
    let plaintextObj = JSON.parse(plaintext);
    if (
      !plaintextObj.question1 ||
      !plaintextObj.question2 ||
      !plaintextObj.question3 ||
      !plaintextObj.encryptedPassword ||
      !plaintextObj.hashOfHash ||
      !plaintextObj.nonce
    ) {
      setErrorToast("invalid plaintext");
      return;
    }
    setInvalidPlaintext(true);
    setQuestion1(plaintextObj.question1);
    setQuestion2(plaintextObj.question2);
    setQuestion3(plaintextObj.question3);
    setEncryptedPassword(plaintextObj.encryptedPassword);
    setHashOfHash(plaintextObj.hashOfHash);
    setNonce(plaintextObj.nonce);
  };

  const [invalidPlaintext, setInvalidPlaintext] = React.useState(false);

  const doDecrypt = () => {
    if (
      !question1 ||
      !answer1 ||
      !question2 ||
      !answer2 ||
      !question3 ||
      !answer3
    ) {
      setErrorToast("have empty question or answer");
      return;
    }
    // hash answers
    let answerHash = keccak256(
      answer1.toLowerCase() + answer2.toLowerCase() + answer3.toLowerCase()
    ).toString("hex");
    if (hashOfHash != keccak256(answerHash).toString("hex")) {
      setErrorToast("hashOfHashs not equal");
      return;
    }
    let aead = new XChaCha20Poly1305(
      new Uint8Array(Buffer.from(answerHash, "utf-8")).slice(0, 32)
    );
    let password = aead.open(
      Buffer.from(nonce, "base64"),
      Buffer.from(encryptedPassword, "base64")
    );
    if (password) {
      setUserPassword(Buffer.from(password).toString());
    } else {
      setErrorToast("decrypt password fail");
      return;
    }
  };

  useEffect(() => {
    // check whether doom-001 key is existing
    syncRequest(
      shared.kongAddress + "/connector/checkKeyExisting/v1",
      "POST",
      {
        apiKey: shared.apiKey,
        keyID: shared.doomWebKeyID,
      },
      undefined,
      (chunk: any) => {
        const respData = JSON.parse(chunk);
        // create a new one if not exist
        if (respData.code !== 0 || !respData.data.existing) {
          syncRequest(
            shared.kongAddress + "/connector/createPrivateKey/v1",
            "POST",
            {
              apiKey: shared.apiKey,
              keyID: shared.doomWebKeyID,
            },
            undefined,
            (chunk: any) => {
              const respData = JSON.parse(chunk);
              if (respData.code !== 0) {
                setErrorToast("create new password fail");
                return;
              }
              if (!respData.data.publicKey) {
                setErrorToast(
                  "create new password fail: returned public key is empty"
                );
                return;
              }
              setPublicKey(
                Buffer.from(respData.data.publicKey, "base64").toString("hex")
              );
            }
          );
          return;
        }
        syncRequest(
          shared.kongAddress + "/connector/getPublicKey/v1",
          "POST",
          {
            apiKey: shared.apiKey,
            keyID: shared.doomWebKeyID,
          },
          undefined,
          (chunk: any) => {
            const respData = JSON.parse(chunk);
            if (respData.code !== 0) {
              setErrorToast("get public key fail");
              return;
            }
            if (!respData.data.publicKey) {
              setErrorToast(
                "get public key fail: returned public key is empty"
              );
              return;
            }
            setPublicKey(
              Buffer.from(respData.data.publicKey, "base64").toString("hex")
            );
          }
        );
      }
    );
  }, []);

  return (
    <main>
      <Stack marginX="200px" marginTop="50px" spacing={2}>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 1: Enter Your Plaintext
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="Plaintext"
            variant="outlined"
            fullWidth
            onChange={(e) => {
              setPlaintext(e.target.value);
            }}
          />
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 2: Commit Plaintext
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              doCommit();
            }}
          >
            Commit
          </Button>
        </Stack>
        {invalidPlaintext && (
          <>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <Typography variant="h6" gutterBottom>
                Step 3: Enter Three Questions With Answers
              </Typography>
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <TextField
                id="outlined-basic"
                label="Question One"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={question1}
                disabled
              />
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <TextField
                id="outlined-basic"
                label="Answer One"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                onChange={(e) => {
                  setAnswer1(e.target.value);
                }}
              />
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <TextField
                id="outlined-basic"
                label="Question Two"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={question2}
                disabled
              />
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <TextField
                id="outlined-basic"
                label="Answer Two"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                onChange={(e) => {
                  setAnswer2(e.target.value);
                }}
              />
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <TextField
                id="outlined-basic"
                label="Question Three"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={question3}
                disabled
              />
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <TextField
                id="outlined-basic"
                label="Answer Three"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                onChange={(e) => {
                  setAnswer3(e.target.value);
                }}
              />
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <Typography variant="h6" gutterBottom>
                Step 4: Confirm Decrypting
              </Typography>
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => {
                  doDecrypt();
                }}
              >
                Confirm
              </Button>
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <Typography variant="h6" gutterBottom>
                Step 5: Results
              </Typography>
            </Stack>
            <Stack direction="row" textAlign="center" justifyContent="left">
              <Typography variant="subtitle2" gutterBottom>
                Password: {userPassword}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
      <Snackbar
        open={errorToast !== ""}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setErrorToast("")}
      >
        <Alert
          onClose={() => setErrorToast("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorToast}
        </Alert>
      </Snackbar>
      <Snackbar
        open={toast !== ""}
        autoHideDuration={4500}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setToast("")}
      >
        <Alert
          onClose={() => setToast("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </main>
  );
}
