"use client";
import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { request, IncomingMessage, RequestOptions } from "http";
import { decrypt } from "doom-cipher";
import * as clipboard from "clipboard-polyfill";

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

  const copyToClipboard = (text: string) => {
    clipboard.writeText(text);
  };

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
    setValidPlaintext(true);
    setQuestion1(plaintextObj.question1);
    setQuestion2(plaintextObj.question2);
    setQuestion3(plaintextObj.question3);
  };

  const [validPlaintext, setValidPlaintext] = React.useState(false);

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
    try {
      // doom-cipher encrypt
      setUserPassword(
        decrypt(
          answer1.toLowerCase() + answer2.toLowerCase() + answer3.toLowerCase(),
          plaintext
        )
      );
    } catch (err) {
      setErrorToast((err as Error).message);
      return;
    }
  };

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
        {validPlaintext && (
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
              <TextField
                id="outlined-basic"
                label="Password"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={userPassword}
                disabled
              />
              <Button
                variant="contained"
                size="large"
                sx={{ marginLeft: "20px" }}
                onClick={() => {
                  copyToClipboard(userPassword);
                }}
              >
                Copy
              </Button>
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
