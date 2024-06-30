'use client';
import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import shared from '../shared';
import { request, IncomingMessage, RequestOptions } from 'http';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import moment from 'moment';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { debounce } from 'lodash';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface DappAssetType {
  name: string;
  isDebt: boolean;
  tokenAddress: string;
  totalValue: string;
  holdings: any[];
}

function Row(props: { row: DappAssetType }) {
  interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
  }

  const columns: readonly Column[] = [
    { id: 'token', label: 'Token', minWidth: 100 },
    { id: 'amount', label: 'Amount', minWidth: 100 },
    { id: 'price', label: 'Price', minWidth: 100 },
    { id: 'value', label: 'Value', minWidth: 100 },
  ];

  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell sx={row.isDebt ? { color: 'red' } : { color: 'green' }}>
          {row.isDebt ? 'Debt' : 'Supply'}
        </TableCell>
        <TableCell>{row.tokenAddress}</TableCell>
        <TableCell>${row.totalValue}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Holdings
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.holdings.map((item) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={item.token}
                      >
                        {columns.map((column) => {
                          const value: any = item[column.id];
                          if (column.id == 'createdAt') {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {moment(value)
                                  .local()
                                  .format('YYYY-MM-DD HH:mm:ss')}
                              </TableCell>
                            );
                          } else if (
                            column.id == 'price' ||
                            column.id == 'value'
                          ) {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                ${value}
                              </TableCell>
                            );
                          } else {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format !== undefined &&
                                typeof value === 'number'
                                  ? column.format(value)
                                  : value}
                              </TableCell>
                            );
                          }
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function Home() {
  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
  }

  const columns: readonly Column[] = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'isDebt', label: 'Type', minWidth: 100 },
    { id: 'tokenAddress', label: 'TokenAddress', minWidth: 100 },
    { id: 'totalValue', label: 'TotalValue', minWidth: 100 },
  ];

  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const [errorToast, setErrorToast] = React.useState('');

  const post = async (
    path: string,
    reqData?: any,
    successAction?: (respData: any) => void
  ) => {
    setLoading(true);

    let postData;
    if (reqData) {
      postData = JSON.stringify(reqData);
    }
    try {
      let reqOpts: RequestOptions = {
        path: shared.kongAddress + path,
        method: 'POST',
      };
      if (postData) {
        reqOpts.headers = {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        };
      } else {
        reqOpts.headers = {
          'Content-Type': 'application/json',
        };
      }
      const req = request(reqOpts, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          const respData = JSON.parse(chunk);
          if (respData.code !== 0) {
            setErrorToast(respData.debugMessage);
            return;
          }
          if (successAction) {
            successAction(respData);
          }
          setToast('success');
        });
      });
      req.on('error', (e) => {
        throw e;
      });
      if (postData) {
        req.write(postData);
      }
      req.end();

      setLoading(false);
    } catch (error) {
      const message = (error as Error).message;
      setLoading(false);
      setErrorToast(message);
    }
  };

  const [chain, setChain] = React.useState('ethereum');
  const handleChainChange = (event: SelectChangeEvent) => {
    setChain(event.target.value as string);
  };
  const baseCoinList = ['ethereum'];
  const [address, setAddress] = React.useState('');
  const [app, setApp] = React.useState('aave_v3');
  const handleAppChange = (event: SelectChangeEvent) => {
    setApp(event.target.value as string);
  };
  const appList = ['aave_v3', 'uniswap_v2'];
  const [list, setList] = React.useState<any[]>([]);

  const doSearch = async () => {
    post(
      '/doom/getDappAssets/v1',
      {
        address: address,
        chain: chain,
        app: app,
      },
      (respData) => {
        if (respData.code != 0) {
          setErrorToast(respData.message);
          return;
        }
        // handle assets list
        let ll: any[] = [];
        respData.data.assets.map((ele: any) => {
          ele.isDebt = false;
          ll.push(ele);
        });
        respData.data.debts.map((ele: any) => {
          ele.isDebt = true;
          ll.push(ele);
        });
        console.log(ll);
        setList(ll);
      }
    );
  };

  return (
    <main>
      <Stack
        spacing={5}
        direction="column"
        alignItems="center"
        sx={{
          padding: '1rem',
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            padding: '1rem',
            width: '100%',
          }}
          direction="row"
        >
          <Button
            variant="contained"
            sx={{ height: '50px', width: '100px', margin: '5px' }}
            onClick={debounce(doSearch, 10000, {
              leading: true,
              trailing: false,
            })}
          >
            Refresh
          </Button>
          <FormControl
            sx={{
              width: '15%',
            }}
          >
            <InputLabel id="demo-simple-select-label">App</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={app}
              label="App"
              onChange={handleAppChange}
            >
              {appList &&
                appList.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{
              width: '15%',
            }}
          >
            <InputLabel id="demo-simple-select-label">Chain</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={chain}
              label="Chain"
              onChange={handleChainChange}
            >
              {baseCoinList &&
                baseCoinList.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{
              width: '15%',
            }}
          >
            <TextField
              id="outlined-basic"
              label="Address"
              variant="outlined"
              onChange={(e) => {
                setAddress(e.target.value);
              }}
            />
          </FormControl>
        </Stack>
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            padding: '1rem',
            width: '100%',
          }}
          direction="row"
        >
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((item) => (
                  <Row key={item.name} row={item} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </main>
  );
}
