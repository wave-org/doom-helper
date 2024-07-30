'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Select, Option } from './Select';
import { encode } from '@doomjs/animated-qrcode';
import { constructEthLegacyRequest } from '@doomjs/evm-sign-request';
import QRCode from 'qrcode';
import { ethers } from 'ethers';

let contract: ethers.Interface;
let timer: NodeJS.Timer;

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

  const [functions, setFunctions] = React.useState<
    Map<string, ethers.FunctionFragment>
  >(new Map());
  const [selectedFunctionName, setSelectedFunctionName] = React.useState<
    string | null
  >(null);
  const [paramData, setParamData] = React.useState('');
  const [address, setAddress] = React.useState(
    '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97'
  );
  const [derivationPath, setDerivationPath] =
    React.useState("m/44'/60'/0'/0/0");
  const [contractAddress, setContractAddress] = React.useState(
    '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97'
  );
  const [nounce, setNounce] = React.useState('0');
  const [gasPrice, setGasPrice] = React.useState('1000000000');
  const [gasLimit, setGasLimit] = React.useState('21000');

  const handleABI = async (abi: string) => {
    contract = new ethers.Interface(abiJson);
    const functions = new Map<string, ethers.FunctionFragment>();
    contract.forEachFunction((fn) => {
      const name = fn.format('minimal');
      functions.set(name, fn);
    });
    setFunctions(functions);
    setSelectedFunctionName(null);
  };

  const confirm = async () => {
    try {
      if (selectedFunctionName === null) {
        setErrorToast('Please select a function');
        return;
      }

      const fn = functions.get(selectedFunctionName);
      if (fn === undefined) {
        setErrorToast('Function not found');
        return;
      }
      const params = paramData.trim().split(',');
      const data = contract.encodeFunctionData(fn, params);
      // console.log(data);

      const request = constructEthLegacyRequest(
        {
          to: contractAddress.trim(),
          data,
          nonce: parseInt(nounce.trim()),
          gasPrice: parseInt(gasPrice.trim()),
          gasLimit: parseInt(gasLimit.trim()),
        },
        derivationPath.trim(),
        address.trim()
      );

      if (timer !== null) {
        clearInterval(timer);
      }
      // set new interval timer
      let canvas = document.getElementById('qrcode');
      const encoder = request.toUREncoder(400, 0, 10);
      if (encoder.fragments.length > 1) {
        timer = setInterval(() => {
          const nextPart = encoder.nextPart();
          QRCode.toCanvas(canvas, nextPart, { width: 500 }, (err: any) => {
            if (err) setErrorToast(err);
          });
        }, 800);
      } else {
        QRCode.toCanvas(
          canvas,
          encoder.nextPart(),
          { width: 500 },
          (err: any) => {
            if (err) setErrorToast(err);
          }
        );
      }
    } catch (err) {
      setErrorToast((err as Error).message);
    }
  };

  return (
    <main>
      <Stack marginX="200px" marginTop="50px" spacing={2}>
        <Stack
          direction="column"
          textAlign="left"
          justifyContent="left"
          spacing={1}
        >
          <Typography variant="h6" gutterBottom>
            Step 0: Account information
          </Typography>
          <TextField
            id="outlined-basic"
            label="Address: "
            variant="outlined"
            fullWidth
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
            }}
          />
          <TextField
            id="outlined-basic"
            label="Derivation Path: "
            variant="outlined"
            fullWidth
            value={derivationPath}
            onChange={(e) => {
              setDerivationPath(e.target.value);
            }}
          />
          <TextField
            id="outlined-basic"
            label="Contract Address: "
            variant="outlined"
            fullWidth
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value);
            }}
          />

          <TextField
            id="outlined-basic"
            label="Nounce : "
            variant="outlined"
            fullWidth
            value={nounce}
            onChange={(e) => {
              setNounce(e.target.value);
            }}
          />

          <TextField
            id="outlined-basic"
            label="Gas price : "
            variant="outlined"
            fullWidth
            value={gasPrice}
            onChange={(e) => {
              setGasPrice(e.target.value);
            }}
          />

          <TextField
            id="outlined-basic"
            label="Gas Limit : "
            variant="outlined"
            fullWidth
            value={gasLimit}
            onChange={(e) => {
              setGasLimit(e.target.value);
            }}
          />
        </Stack>

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
            rows={6}
            onChange={(e) => {
              setAbiJson(e.target.value);
            }}
          />
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Typography variant="h6" gutterBottom>
            Step 2: Check and parse ABI Json Object
          </Typography>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              handleABI(abiJson);
            }}
          >
            Check ABI
          </Button>
        </Stack>
        <Stack
          direction="column"
          spacing={2}
          textAlign="center"
          justifyContent="left"
        >
          <Typography variant="h6" gutterBottom width="100%" textAlign="left">
            Step 3: Select function
          </Typography>
          {functions.size > 0 && (
            <Select
              placeholder="Select function: "
              value={selectedFunctionName}
              onChange={(_, newValue) => {
                setSelectedFunctionName(newValue);
              }}
            >
              {Array.from(functions.keys()).map((name, index) => (
                <Option key={index} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Stack>

        {selectedFunctionName !== null && (
          <Stack direction="column" textAlign="center" justifyContent="left">
            <Typography variant="h6" gutterBottom>
              Step 4: Input your data here (use , to separate)
            </Typography>
            <TextField
              id="outlined-basic"
              label="Parameters"
              helperText="Use , to separate. For example: 0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97,1000000000"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={paramData}
              onChange={(e) => {
                setParamData(e.target.value);
              }}
            />
          </Stack>
        )}

        {paramData !== '' && (
          <Stack direction="column" textAlign="center" justifyContent="left">
            <Typography variant="h6" gutterBottom>
              Step 5:
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                confirm();
              }}
            >
              Genereate Sign Request
            </Button>
          </Stack>
        )}
        <Stack direction="row" justifyContent="center" padding="50px">
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
