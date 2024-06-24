'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import QRCode from 'qrcode';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Home() {
  const [toast, setToast] = React.useState('');
  const [errorToast, setErrorToast] = React.useState('');
  const [abiJson, setAbiJson] = React.useState('');

  const [qrDataLen, setQrDataLen] = React.useState(400);
  const [showInterval, setShowInterval] = React.useState(0.4 * 1000);
  const [b64Data, setB64Data] = React.useState('');
  const [qrData, setQrData] = React.useState('');
  const timerRef = React.useRef<NodeJS.Timer | null>(null);

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
        abi.outputs = [];
        json.push(abi);
      }
    });
    if (json.length == 0) {
      setErrorToast('abi json array length is empty');
      return;
    }
    let b64data = btoa(JSON.stringify(json));
    console.log('b64data.length ==>', b64data.length);
    setB64Data(b64data);
    let arr: string[] = [];
    for (let f = 0; f < b64data.length; ) {
      let l = f + qrDataLen;
      if (l > b64data.length) {
        l = b64data.length;
      }
      arr.push(b64data.slice(f, l));
      f = l;
    }
    // clear previous interval timer
    clearInterval(timerRef.current as NodeJS.Timer);
    timerRef.current = null;
    // set new interval timer
    let canvas = document.getElementById('qrcode');
    let a = 0;
    let b = arr.length;
    timerRef.current = setInterval(() => {
      if (a == b) {
        a = 0;
      }
      let prefix = 'DOOM|AQR|' + a + '/' + b + '|';
      setQrData(prefix + arr[a]);
      console.log('prefix ==>', prefix);
      QRCode.toCanvas(canvas, prefix + arr[a], { width: 300 }, (err: any) => {
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
        {/* <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="b64Data"
            variant="outlined"
            fullWidth
            multiline
            rows={10}
            disabled
            value={b64Data}
          />
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TextField
            id="outlined-basic"
            label="qrData"
            variant="outlined"
            fullWidth
            multiline
            rows={10}
            disabled
            value={qrData}
          />
        </Stack> */}
        <Stack direction="row" textAlign="center" justifyContent="left">
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
