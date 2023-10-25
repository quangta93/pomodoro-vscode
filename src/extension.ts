import * as vscode from "vscode";
import { Pomodoro } from "./pomodoro";

export function activate(context: vscode.ExtensionContext) {
  const timer = new Pomodoro();

  console.log("pomodoro activated!");

  const startDisposable = vscode.commands.registerCommand(
    "pomodoro-vscode.start",
    () => {
      timer.start();
      vscode.window.showInformationMessage("Start");
    }
  );

  const stopDisposable = vscode.commands.registerCommand(
    "pomodoro-vscode.stop",
    () => {
      timer.stop();
      vscode.window.showInformationMessage("Stop");
    }
  );

  const skipDisposable = vscode.commands.registerCommand(
    "pomodoro-vscode.skip",
    () => {
      timer.skip();
      vscode.window.showInformationMessage("Skip");
    }
  );

  const consoleDisposable = vscode.commands.registerCommand(
    "pomodoro-vscode.console",
    () => {
      vscode.window.showInformationMessage(timer.toString());
    }
  );

  context.subscriptions.push(startDisposable, stopDisposable, skipDisposable);
}

export function deactivate() {}
