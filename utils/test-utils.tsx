import ReduxProvider from "@/lib/providers/ReduxProvider";
import { render, RenderOptions } from "@testing-library/react";
import { ReactNode } from "react";

const AllProviders = ({ children }: { children: ReactNode }) => {
  return <ReduxProvider>{children}</ReduxProvider>;
};

const customRender = (
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">
) => {
  render(ui, { wrapper: AllProviders, ...options });
};

export * from "@testing-library/react";

export { customRender as render };
