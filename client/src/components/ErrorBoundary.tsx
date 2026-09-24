import { Component, type ErrorInfo, type ReactNode } from "react";
import { ArrowClockwise, WarningOctagon } from "@phosphor-icons/react";
import Button from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" className="flex min-h-dvh items-center justify-center bg-background p-4">
          <div className="flex max-w-md flex-col items-center gap-sm rounded-xl border border-border bg-card p-xl text-center">
            <span className="mb-xs flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
              <WarningOctagon size={30} weight="duotone" aria-hidden />
            </span>
            <h1 className="text-display-md text-foreground">Something went wrong</h1>
            <p className="text-caption text-muted-foreground">
              We hit an unexpected problem displaying this page. Reload to try again.
            </p>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              startIcon={<ArrowClockwise size={18} />}
              className="!mt-xs"
            >
              Reload page
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
