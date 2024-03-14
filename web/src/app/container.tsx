"use client";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import Link from "next/link";
import { StyledEngineProvider } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { usePathname, useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import shared from "./shared";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Snackbar, { SnackbarOrigin } from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const LINKS = [
  { text: "Encrypt", href: "/encrypt" },
  { text: "Decrypt", href: "/decrypt" },
  { text: "Simple Encrypt", href: "/simple-encrypt" },
];

function Container({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );
  const pathName = usePathname();

  const [value, setValue] = React.useState(pathName);

  // Save pathname on component mount into a REF
  const savedPathNameRef = React.useRef(pathName);

  React.useEffect(() => {
    // If REF has been changed, do the stuff
    if (savedPathNameRef.current !== pathName) {
      setValue(pathName);
      savedPathNameRef.current = pathName;
    }
  }, [pathName, setValue]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const [loading, setLoading] = React.useState(false);
  const [errorToast, setErrorToast] = React.useState("");

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [isAdmin, setIsAdmin] = React.useState(false);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Tabs value={value} onChange={handleChange} centered>
          {LINKS.map(({ text, href }) => {
            return (
              <Tab
                label={text}
                key={href}
                value={href}
                href={href}
                LinkComponent={Link}
              />
            );
          })}
        </Tabs>

        {children}
      </ThemeProvider>
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
    </StyledEngineProvider>
  );
}
// export default withRouter(Container);
export default Container;
