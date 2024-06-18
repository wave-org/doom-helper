"use client";
import React, { useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import shared from "../shared";
import { request, IncomingMessage, RequestOptions } from "http";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import moment from "moment";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { debounce } from 'lodash';

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
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "token", label: "Token", minWidth: 100 },
  { id: "amount", label: "Amount", minWidth: 100 },
  { id: "price", label: "Price", minWidth: 100 },
  { id: "value", label: "Value", minWidth: 100 },
];

export default function Home() {
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [errorToast, setErrorToast] = React.useState("");

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
        method: "POST",
      };
      if (postData) {
        reqOpts.headers = {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        };
      } else {
        reqOpts.headers = {
          "Content-Type": "application/json",
        };
      }
      const req = request(reqOpts, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const respData = JSON.parse(chunk);
          if (respData.code !== 0) {
            setErrorToast(respData.debugMessage);
            return;
          }
          if (successAction) {
            successAction(respData);
          }
          setToast("success");
        });
      });
      req.on("error", (e) => {
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
  const baseCoinList = ["ethereum"]
  const [address, setAddress] = React.useState('');
  const list = React.useRef<any[]>([]);
  const [totalValue, setTotalValue] = React.useState('');

  const doSearch = async () => {
    post(
      '/doom/getAssets/v1', 
      {
        address:address,
        chain: chain,
      },
      (respData)=>{
        if (respData.code != 0) {
          setErrorToast(respData.message);
          return
        }
        list.current = respData.data.assets;
        setTotalValue(respData.data.totalValue);
      }
    )
  };

  return (
    <main>
      <Stack
        spacing={5}
        direction="column"
        alignItems="center"
        sx={{
          padding: "1rem",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            padding: "1rem",
            width: "100%",
          }}
          direction="row"
        >
          <Button
            variant="contained"
            sx={{ height: "50px", width: "100px", margin: "5px" }}
            onClick={debounce(doSearch, 10000, {'leading': true, 'trailing': false})}
          >
            Refresh
          </Button>
          <FormControl 
            sx={{
              width: "15%",
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
              {baseCoinList && baseCoinList.map((item)=>(
                <MenuItem value={item} key={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl 
            sx={{
              width: "15%",
            }}
          >
            <TextField id="outlined-basic" label="Address" variant="outlined" onChange={(e)=>{setAddress(e.target.value)}} />
          </FormControl>
          <FormControl 
            sx={{
              width: "15%",
            }}
          >
             <Typography variant="h6" gutterBottom>
              Total Value: ${totalValue}
            </Typography>
          </FormControl>
        </Stack>
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            padding: "1rem",
            width: "100%",
          }}
          direction="row"
        >
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
              {list &&
                list.current.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const value:any = row[column.id];
                        if (column.id == "createdAt") {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {moment(value)
                                .local()
                                .format("YYYY-MM-DD HH:mm:ss")}
                            </TableCell>
                          );
                        } else if (column.id == "price" || column.id == "value") {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              ${value}
                            </TableCell>
                          );
                        } else {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.format !== undefined &&
                              typeof value === "number"
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
          </TableContainer>
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </main>
  );
}
