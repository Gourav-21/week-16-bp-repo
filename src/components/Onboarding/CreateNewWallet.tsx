import React, { useState, useMemo } from "react";
import {
  makeStyles,
  MobileStepper,
  Button,
  Checkbox,
  Typography,
} from "@material-ui/core";
import { MenuBook } from "@material-ui/icons";
import { TextField } from "../common";
import { HdKeyring, SolanaHdKeyringFactory } from "../../keyring";
import { getBackgroundClient } from "../../background/client";
import {
  BrowserRuntime,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "../../common";
import { DerivationPath } from "../../keyring/crypto";
import { OnboardButton } from "../common";
import { _NavBackButton, DummyButton } from "../Layout/Nav";

export const useStyles = makeStyles((theme: any) => ({
  stepper: {
    backgroundColor: theme.custom.colors.nav,
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "14px",
    paddingRight: "14px",
    position: "relative",
    height: "100%",
  },
  stepperDot: {
    background: theme.custom.colors.interactiveIconsHover,
  },
  stepperDotActive: {
    background: theme.custom.colors.tabIconSelected,
  },
  progressButton: {
    color: "#fff",
    padding: 0,
  },
  progressButtonLeftLabel: {
    background: "#333333",
    borderRadius: "20px",
  },
  progressButtonRightLabel: {
    background: "#333333",
    borderRadius: "20px",
  },
  buttonRoot: {
    minWidth: "5px",
  },
  withContinueContainer: {
    display: "flex",
    flexDirection: "column",
    color: theme.custom.colors.fontColor,
    paddingLeft: "14px",
    paddingRight: "14px",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  termsContainer: {
    display: "flex",
    marginTop: "8px",
  },
  passwordField: {
    background: "#333333",
  },
  checkBox: {
    padding: 0,
    color: theme.custom.colors.onboardButton,
  },
  checkBoxChecked: {
    color: `${theme.custom.colors.onboardButton} !important`,
  },
  subtext: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "20px",
    fontWeight: 500,
  },
  continueButtonContainer: {
    position: "absolute",
    marginBottom: "20px",
    marginRight: "20px",
    marginLeft: "20px",
    bottom: 0,
    left: 0,
    right: 0,
  },
  errorMsg: {
    color: "red",
    textAlign: "left",
    marginTop: "8px",
  },
  mnemonicDisplayContainer: {
    backgroundColor: theme.custom.colors.nav,
    borderRadius: "12px",
    marginBottom: "16px",
  },
  passwordHeader: {
    fontSize: "20px",
    lineHeight: "24px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
    marginBottom: "8px",
  },
  passwordSubheader: {
    fontWeight: 500,
    fontSize: "14px",
    lineHieght: "20px",
    color: theme.custom.colors.secondary,
  },
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "16px",
  },
  menuIcon: {
    color: theme.custom.colors.tabIconSelected,
    width: "26px",
    height: "26px",
    marginBottom: "8px",
  },
  mnemonicDisplayText: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "20px",
    padding: "16px",
  },
  mnemonicCopyButton: {
    padding: 0,
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    width: "100%",
    height: "36px",
  },
  mnemonicCopyButtonText: {
    textTransform: "none",
    color: theme.custom.colors.activeNavButton,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
  },
}));

const STEP_COUNT = 3;

export function CreateNewWallet() {
  const [activeStep, setActiveState] = useState(0);
  const hdKeyring = useMemo(() => {
    const factory = new SolanaHdKeyringFactory();
    return factory.generate();
  }, []);
  const [password, setPassword] = useState("");
  const derivationPath = DerivationPath.Bip44Change;
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  const handleDone = () => {
    console.log("clicked handle done");
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [hdKeyring.mnemonic, derivationPath, password],
      })
      .catch(console.error)
      .then((_) => BrowserRuntime.closeActiveTab());
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ height: "56px" }}>
        <Stepper
          activeStep={activeStep}
          handleBack={handleBack}
          stepCount={STEP_COUNT}
        />
      </div>
      <div
        style={{
          flex: 1,
        }}
      >
        {activeStep === 0 && (
          <CreatePassword
            next={(pw) => {
              setPassword(pw);
              handleNext();
            }}
          />
        )}
        {activeStep === 1 && (
          <ShowMnemonic keyring={hdKeyring} next={handleNext} />
        )}
        {activeStep === 2 && <Done done={handleDone} />}
      </div>
    </div>
  );
}

export function CreatePassword({ next }: { next: (password: string) => void }) {
  const classes = useStyles();
  const [checked, setChecked] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [error, setError] = useState<null | string>(null);
  const canContinue = checked && password !== "";
  const clickContinue = () => {
    if (password.length < 8) {
      setError("Password must be longer than 8 characters");
      return;
    } else if (password !== passwordDup) {
      setError(`Passwords don't match`);
      return;
    }
    next(password);
  };
  return (
    <WithContinue next={clickContinue} canContinue={canContinue}>
      <OnboardHeader
        text={"Create a password"}
        subtext={"You will use this to unlock your wallet"}
      />
      <div>
        <TextField
          placeholder="Enter your password..."
          type="password"
          value={password}
          setValue={setPassword}
          rootClass={classes.passwordFieldRoot}
        />
        <TextField
          placeholder="Confirm your password..."
          type="password"
          value={passwordDup}
          setValue={setPasswordDup}
          rootClass={classes.passwordFieldRoot}
        />
      </div>
      {error && <Typography className={classes.errorMsg}>{error}</Typography>}
      <CheckboxForm
        checked={checked}
        setChecked={setChecked}
        label={"I agree to the terms of service"}
      />
    </WithContinue>
  );
}

export function OnboardHeader({ text, subtext }: any) {
  const classes = useStyles();
  return (
    <div style={{ marginBottom: "42px" }}>
      <Symbol />
      <Typography className={classes.passwordHeader}>{text}</Typography>
      <Typography className={classes.passwordSubheader}>{subtext}</Typography>
    </div>
  );
}

function CheckboxForm({ checked, setChecked, label }: any) {
  const classes = useStyles();
  return (
    <div className={classes.termsContainer}>
      <Checkbox
        className={classes.checkBox}
        checked={checked}
        onChange={() => setChecked(!checked)}
        classes={{
          checked: classes.checkBoxChecked,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginLeft: "10px",
        }}
      >
        <Typography className={classes.subtext}>{label}</Typography>
      </div>
    </div>
  );
}

function ShowMnemonic({
  next,
  keyring,
}: {
  next: () => void;
  keyring: HdKeyring;
}) {
  const [checked, setChecked] = useState(true);
  const canContinue = checked;
  return (
    <WithContinue next={next} canContinue={canContinue}>
      <OnboardHeader
        text={"Secret Recovery Phrase"}
        subtext={
          "This phrase is the ONLY way to recover your wallet. Do not share it with anyone!"
        }
      />
      <MnemonicDisplay keyring={keyring} />
      <CheckboxForm
        checked={checked}
        setChecked={setChecked}
        label={"I saved my Secret Recovery Phrase"}
      />
    </WithContinue>
  );
}

function MnemonicDisplay({ keyring }: { keyring: HdKeyring }) {
  const classes = useStyles();
  const onClick = () => {
    navigator.clipboard.writeText(keyring.mnemonic);
  };
  return (
    <div className={classes.mnemonicDisplayContainer}>
      <Typography className={classes.mnemonicDisplayText}>
        {keyring.mnemonic}
      </Typography>
      <Button onClick={onClick} className={classes.mnemonicCopyButton}>
        <Typography className={classes.mnemonicCopyButtonText}>Copy</Typography>
      </Button>
    </div>
  );
}

export function Shortcut({ next }: { next: () => void }) {
  return (
    <WithContinue next={next} canContinue={true}>
      Shortcut here
    </WithContinue>
  );
}

export function Done({ done }: { done: () => void }) {
  return (
    <WithContinue next={() => done()} canContinue={true} buttonLabel={"Finish"}>
      <OnboardHeader
        text={`You're all done!`}
        subtext={"Click finish to complete onboarding"}
      />
    </WithContinue>
  );
}

export function WithContinue(props: any) {
  const classes = useStyles();
  return (
    <div className={classes.withContinueContainer}>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {props.children}
      </div>
      <div className={classes.continueButtonContainer}>
        <OnboardButton
          onClick={() => props.next()}
          label={props.buttonLabel ?? "Continue"}
        />
      </div>
    </div>
  );
}

export function Stepper({ activeStep, handleBack, stepCount }: any) {
  const classes = useStyles();
  return (
    <MobileStepper
      className={classes.stepper}
      classes={{
        dot: classes.stepperDot,
        dotActive: classes.stepperDotActive,
      }}
      variant="dots"
      steps={stepCount}
      position="static"
      activeStep={activeStep}
      nextButton={
        <Button
          style={{ width: "24px", visibility: "hidden" }}
          classes={{
            root: classes.buttonRoot,
          }}
        ></Button>
      }
      backButton={
        activeStep > 0 ? <_NavBackButton pop={handleBack} /> : <DummyButton />
      }
    />
  );
}

function Symbol() {
  const classes = useStyles();
  return <MenuBook className={classes.menuIcon} />;
}
