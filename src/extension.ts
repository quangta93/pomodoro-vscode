import {
  StatusBarAlignment,
  commands,
  window,
  type ExtensionContext,
} from "vscode";
import { Pomodoro } from "./pomodoro";

enum TimerCommand {
  start = "pomodoro-vscode.start",
  stop = "pomodoro-vscode.stop",
  skip = "pomodoro-vscode.skip",
}

const registerCommands = (
  { subscriptions }: ExtensionContext,
  timer: Pomodoro
) => {
  subscriptions.push(
    commands.registerCommand(TimerCommand.start, () => {
      timer.start();
      window.showInformationMessage("Start");
    })
  );

  subscriptions.push(
    commands.registerCommand(TimerCommand.stop, () => {
      timer.stop();
      window.showInformationMessage("Stop");
    })
  );

  subscriptions.push(
    commands.registerCommand(TimerCommand.skip, () => {
      timer.skip();
      window.showInformationMessage("Skip");
    })
  );
};

const renderStatusBarItems = (context: ExtensionContext, timer: Pomodoro) => {
  const skipBtn = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  skipBtn.command = TimerCommand.start;
  skipBtn.text = "$(debug-step-over)";
  skipBtn.tooltip = "Skip pomodoro period";
  skipBtn.show();

  const startBtn = window.createStatusBarItem(StatusBarAlignment.Right, 101);
  startBtn.command = TimerCommand.skip;
  startBtn.text = "$(play)";
  startBtn.tooltip = "Start pomodoro timer";
  startBtn.show();

  const timerText = window.createStatusBarItem(StatusBarAlignment.Right, 102);
  timerText.text = "00:00";
  timerText.tooltip = "Pomodoro";
  timerText.show();
};

export function activate(context: ExtensionContext) {
  console.log("pomodoro activated!");

  const timer = new Pomodoro();

  registerCommands(context, timer);
  renderStatusBarItems(context, timer);
}

export function deactivate() {}
