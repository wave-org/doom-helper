'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { encode } from '@doomjs/animated-qrcode';
import QRCode from 'qrcode';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

let timer: NodeJS.Timer;

export default function Home() {
  const [toast, setToast] = React.useState('');
  const [errorToast, setErrorToast] = React.useState('');
  const [abiJson, setAbiJson] = React.useState('');

  const [showInterval, setShowInterval] = React.useState(0.8 * 1000);

  const doGenerate = async () => {
    if (abiJson.length <= 0) {
      return;
    }
    let json: any[] = [];
    JSON.parse(abiJson).forEach((abi: any) => {
      if (
        abi.type === 'function' &&
        abi.stateMutability !== 'view' &&
        abi.stateMutability !== 'pure'
      ) {
        // abi.outputs = [];
        json.push(abi);
      }
    });
    if (json.length == 0) {
      setErrorToast('abi json array length is empty');
      return;
    }

    const fragments = encode(JSON.stringify(json), 320, 40);
    if (timer) clearInterval(timer);
    let canvas = document.getElementById('qrcode');
    let a = 0;
    let b = fragments.length;
    timer = setInterval(() => {
      if (a == b) {
        a = 0;
      }
      QRCode.toCanvas(canvas, fragments[a], { width: 600 }, (err: any) => {
        if (err) setErrorToast(err);
      });
      a++;
    }, showInterval);
  };

  return (
    <main>
      <Stack marginX="200px" marginTop="50px" spacing={2}>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 1: Enter ABI Json Object
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="ABI Json"
            variant="outlined"
            fullWidth
            multiline
            rows={10}
            onChange={(e) => {
              setAbiJson(e.target.value);
            }}
          />
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 2: Confirm To Generate QRCodes
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              doGenerate();
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
        <Stack direction="row" justifyContent="center" padding="40px">
          <canvas id="qrcode"></canvas>
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
