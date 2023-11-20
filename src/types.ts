import { type StatusBarItem } from "vscode";

export enum TimerCommand {
  start = "pomodoro-vscode.start",
  stop = "pomodoro-vscode.stop",
  skip = "pomodoro-vscode.skip",
}

export type StatusBarItemOptions = Partial<
  Omit<StatusBarItem, "show" | "hide" | "dispose">
>;
