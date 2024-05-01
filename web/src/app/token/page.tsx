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

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Home() {
  const [toast, setToast] = React.useState("");
  const [errorToast, setErrorToast] = React.useState("");
  const baseURL = "https://api.binance.com";

  const [tokens, setTokens] = React.useState<string[]>([
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
  ]);
  const [avgPrice, setAvgPrice] = React.useState<any | null>(null);

  // get symbol info list: curl https://api.binance.com/api/v3/exchangeInfo
  const doRefresh = async () => {
    let avgPrices: any = {};
    for (let i = 0; i < tokens.length; i++) {
      const res = await fetch(
        `${baseURL}/api/v3/avgPrice?` +
          new URLSearchParams({ symbol: tokens[i] }).toString()
      );
      const data = await res.json();
      avgPrices[tokens[i]] = data;
    }
    setAvgPrice(avgPrices);
  };

  return (
    <main>
      <Stack marginX="200px" marginTop="50px" spacing={2}>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => {
              doRefresh();
            }}
          >
            Refresh
          </Button>
        </Stack>
        <Stack direction="row" textAlign="center" justifyContent="left">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell align="right">Mins</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">CloseTime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens &&
                  avgPrice &&
                  tokens.map((row) => (
                    <TableRow
                      key={row}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row}
                      </TableCell>
                      <TableCell align="right">{avgPrice[row].mins}</TableCell>
                      <TableCell align="right">
                        ${avgPrice[row].price}
                      </TableCell>
                      <TableCell align="right">
                        {new Date(avgPrice[row].closeTime).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
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
    </main>
  );
}
