"use client";
import React, { useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { request, IncomingMessage, RequestOptions } from "http";
import { encrypt, secure_encrypt, generateRandomPassword } from "doom-cipher";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
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

  const copyToClipboard = (text: string) => {
    clipboard.writeText(text);
  };

  const [publickKey, setPublicKey] = React.useState(
    "BCVWGZ0Uqvfj+jHiD4ZExi79BBq523HyUu6+y2xNiKHHi4Xp/A5SM5Dldi3cvT3lONmoOIgb6mtGchEX/CkdZL8="
  );

  const [toast, setToast] = React.useState("");
  const [errorToast, setErrorToast] = React.useState("");

  const [privateKey, setPrivateKey] = React.useState("");
  const [privKeyInputError, setPrivKeyInputError] = React.useState(false);
  const [privKeyInputHelperText, setPrivKeyInputHelperText] =
    React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordInputError, setPasswordInputError] = React.useState(false);
  const [passwordInputHelperText, setPasswordInputHelperText] =
    React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const [plaintext, setPlaintext] = React.useState("");
  const [ciphertext, setCiphertext] = React.useState("");

  const doBackup = () => {
    if (!privateKey || !password) {
      setErrorToast("private key and password must not be empty");
      return;
    } else {
      if (privateKey.length != 64) {
        setErrorToast(
          "private key must be base 16 with lower-case letters, and its length must be 64 ( now is " +
            privateKey.length +
            ")"
        );
        return;
      } else if (password.length < 8 || password.length > 64) {
        setErrorToast(
          "password length must between 8 and 64 ( now is " +
            password.length +
            ")"
        );
        return;
      }
    }
    try {
      // doom-cipher encrypt
      let plaintext = encrypt(password, privateKey, null);
      setPlaintext(plaintext);
      // doom-cipher secure_encrypt using doom-001 public key
      setCiphertext(secure_encrypt(plaintext, publickKey));
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
            Step 1: Enter Private Key
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="Private Key"
            variant="outlined"
            error={privKeyInputError}
            helperText={privKeyInputHelperText}
            fullWidth
            value={privateKey}
            onChange={(e) => {
              setPrivateKey(e.target.value);
              if (e.target.value.length != 64) {
                setPrivKeyInputError(true);
                setPrivKeyInputHelperText(
                  "private key must be base 16 with lower-case letters, and its length must be 64 ( now is " +
                    e.target.value.length +
                    ")"
                );
              } else {
                setPrivKeyInputError(false);
                setPrivKeyInputHelperText("");
              }
            }}
          />
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 2: Enter Password
          </Typography>
          <Button
            variant="contained"
            size="medium"
            sx={{ marginLeft: "20px" }}
            onClick={() => {
              setPassword(generateRandomPassword());
              setPasswordInputError(false);
              setPasswordInputHelperText("");
            }}
          >
            Generate A Random Password
          </Button>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <FormControl fullWidth sx={{ m: 1 }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              error={passwordInputError}
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length < 8 || e.target.value.length > 64) {
                  setPasswordInputError(true);
                  setPasswordInputHelperText(
                    "password length must between 8 and 64 ( now is " +
                      e.target.value.length +
                      ")"
                  );
                } else {
                  setPasswordInputError(false);
                  setPasswordInputHelperText("");
                }
              }}
            />
            <FormHelperText id="password-error-text">
              {passwordInputHelperText}
            </FormHelperText>
          </FormControl>
          <Button
            variant="contained"
            size="large"
            sx={{ marginLeft: "20px" }}
            onClick={() => {
              copyToClipboard(password);
            }}
          >
            Copy
          </Button>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 3: Confirm Backup
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              doBackup();
            }}
          >
            Confirm
          </Button>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 4: Results
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="subtitle2" gutterBottom>
            Plaintext:
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="Plaintext"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={plaintext}
            disabled
          />
          <Button
            variant="contained"
            size="large"
            sx={{ marginLeft: "20px" }}
            onClick={() => {
              copyToClipboard(plaintext);
            }}
          >
            Copy
          </Button>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="subtitle2" gutterBottom>
            CipherText:
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="CipherText"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={ciphertext}
            disabled
          />
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              copyToClipboard(ciphertext);
            }}
            sx={{ marginLeft: "20px" }}
          >
            Copy
          </Button>
        </Stack>
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
