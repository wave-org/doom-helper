'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { request, IncomingMessage, RequestOptions } from 'http';
import { encrypt } from 'eciesjs';

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
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        };
      }
      const req = request(reqOpts, (res) => {
        res.setEncoding('utf8');
        if (respDataHandle) {
          res.on('data', respDataHandle);
        }
        res.on('end', () => {
          resolve();
        });
      });
      if (respHandle) {
        req.on('response', respHandle);
      }
      req.on('error', (e) => {
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

  const [publickKey, setPublicKey] = React.useState(
    '04f79adeb44446b0a5c4cd82d97d23ce2682abe776bc2236c56607233d068c338833a2b35e4fdcb4018ce474604a1bea123d5aa56125ed1727fba6b4ef0e81914c'
  );

  const [toast, setToast] = React.useState('');
  const [errorToast, setErrorToast] = React.useState('');

  const [plaintext, setPlaintext] = React.useState('');
  const [ciphertext, setCiphertext] = React.useState('');

  const doEncrypt = () => {
    let ciphertext = encrypt(
      publickKey,
      Buffer.from(Buffer.from(plaintext, 'utf-8').toString('base64'))
    ).toString('base64');
    setCiphertext(ciphertext);
  };

  return (
    <main>
      <Stack marginX="200px" marginTop="50px" spacing={2}>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 1: Enter Something
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
            Step 2: Confirm Encrypting
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              doEncrypt();
            }}
          >
            Confirm
          </Button>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 3: Results
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
        </Stack>
      </Stack>
      <Snackbar
        open={errorToast !== ''}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setErrorToast('')}
      >
        <Alert
          onClose={() => setErrorToast('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorToast}
        </Alert>
      </Snackbar>
      <Snackbar
        open={toast !== ''}
        autoHideDuration={4500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setToast('')}
      >
        <Alert
          onClose={() => setToast('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </main>
  );
}
