"use client";
import Backdrop from "@mui/material/Backdrop";
import React, { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import shared from "@/app/shared";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { request, RequestOptions } from "http";
import Stack from "@mui/material/Stack";
import moment from "moment";
import TablePagination from "@mui/material/TablePagination";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL;

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const secondly_columns: Column[] = [
  { id: "id", label: "ID", minWidth: 100 },
  { id: "symbol", label: "Symbol", minWidth: 100 },
  { id: "baseCoin", label: "BaseCoin", minWidth: 100 },
  { id: "price", label: "Price", minWidth: 100 },
  { id: "timestamp", label: "Timestamp", minWidth: 100 },
];

const hourly_columns: Column[] = [
  { id: "id", label: "ID", minWidth: 100 },
  { id: "symbol", label: "Symbol", minWidth: 100 },
  { id: "baseCoin", label: "BaseCoin", minWidth: 100 },
  { id: "price", label: "Price", minWidth: 100 },
  { id: "priceMin", label: "PriceMin", minWidth: 100 },
  { id: "priceMax", label: "PriceMax", minWidth: 100 },
  { id: "priceAvg", label: "PriceAvg", minWidth: 100 },
  { id: "timestamp", label: "Timestamp", minWidth: 100 },
];

const daily_columns: Column[] = [
  { id: "id", label: "ID", minWidth: 100 },
  { id: "symbol", label: "Symbol", minWidth: 100 },
  { id: "baseCoin", label: "BaseCoin", minWidth: 100 },
  { id: "priceMin", label: "PriceMin", minWidth: 100 },
  { id: "priceMax", label: "PriceMax", minWidth: 100 },
  { id: "priceAvg", label: "PriceAvg", minWidth: 100 },
  { id: "timestamp", label: "Timestamp", minWidth: 100 },
];

export default function Home() {
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [errorToast, setErrorToast] = React.useState("");

  const [columns, setColumns] = React.useState<Column[]>(secondly_columns);
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState<any[] | null>(null);
  const [beginMilli, setBeginMilli] = React.useState(0);
  const [endMilli, setEndMilli] = React.useState(0);
  const [baseCoin, setBaseCoin] = React.useState('USDT');
  const handleBaseCoinChange = (event: SelectChangeEvent) => {
    let val = event.target.value as string;
    setBaseCoin(val);
  };
  const baseCoinList = ["USD", "USDT"];
  const [symbol, setSymbol] = React.useState('');
  const [pageSize, setPageSize] = React.useState(20);
  const [pageNumber, setPageNumber] = React.useState(0);
  const [urlPath, setUrlPath] = React.useState('/doom/getSecondlyPrices/v1');
  const [priceType, setPriceType] = React.useState('Secondly');
  const handlePriceTypeChange = (event: SelectChangeEvent) => {
    let val = event.target.value as string;
    setPriceType(val);
    switch (val) {
      case "Secondly":
        setColumns(secondly_columns);
        setUrlPath('/doom/getSecondlyPrices/v1');
        break;
      case "Hourly":
        setColumns(hourly_columns);
        setUrlPath('/doom/getHourlyPrices/v1');
        break;
      case "Daily":
        setColumns(daily_columns);
        setUrlPath('/doom/getDailyPrices/v1');
        break;
    }
    setList([]);
  };
  const priceTypeList = ["Secondly", "Hourly", "Daily"]

  const getPriceList = async (pageSize:number, pageNumber:number) => {
    const reqData = {
      beginMilli: beginMilli,
      endMilli: endMilli,
      baseCoin: baseCoin,
      symbol: symbol,
      pageSize: pageSize,
      pageNumber: pageNumber,
    };
    post(urlPath, reqData, (respData) => {
      setTotal(respData.data.total);
      setList(respData.data.list);
    });
  };

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

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPageNumber(newPage);
    getPriceList(pageSize, newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let ps = parseInt(event.target.value, 10);
    setPageSize(ps);
    setPageNumber(0);
    getPriceList(ps, 0);
  };

  return (
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
          onClick={() => {
            getPriceList(pageSize, pageNumber);
          }}
          variant="contained"
          sx={{ height: "50px", width: "100px", margin: "5px" }}
        >
          Refresh
        </Button>
        <FormControl 
            sx={{
              width: "15%",
              height: "50px",
            }}
          >
          <InputLabel id="demo-simple-select-label">PriceType</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={priceType}
            label="Price Type"
            onChange={handlePriceTypeChange}
          >
            {priceTypeList && priceTypeList.map((item)=>(
              <MenuItem value={item} key={item}>{item}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl 
            sx={{
              width: "15%",
            }}
          >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker label="Timestamp Begin" onChange={(value:any)=>{
                setBeginMilli(new Date(value).getTime());
              }} />
            </DemoContainer>
          </LocalizationProvider>
        </FormControl>
        <FormControl 
            sx={{
              width: "15%",
            }}
          >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker label="Timestamp End" onChange={(value:any)=>{setEndMilli(new Date(value).getTime());}} />
            </DemoContainer>
          </LocalizationProvider>
        </FormControl>
        <FormControl 
            sx={{
              width: "15%",
            }}
          >
            <InputLabel id="demo-simple-select-label">Base Coin</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={baseCoin}
              label="Base Coin"
              onChange={handleBaseCoinChange}
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
            <TextField id="outlined-basic" label="Symbol" variant="outlined" onChange={(e)=>{setSymbol(e.target.value)}} />
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
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
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
                list.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        if (column.id == "timestamp") {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {moment(value)
                                .local()
                                .format("YYYY-MM-DD HH:mm:ss")}
                            </TableCell>
                          );
                        } else if (column.id == "price" || column.id == "priceMiin" || column.id == "priceMax" || column.id == "priceAvg") {
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
      <Stack
        spacing={2}
        alignItems="center"
        sx={{
          padding: "1rem",
        }}
        direction="row"
      >
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 30, 50, 100]}
          component="div"
          count={total}
          page={pageNumber}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Stack>
      {/* )} */}
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
    </Stack>
  );
}
