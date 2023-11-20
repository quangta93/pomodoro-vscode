import { distinctUntilChanged, map } from "rxjs";
import {
  Disposable,
  StatusBarAlignment,
  commands,
  window,
  type ExtensionContext,
} from "vscode";
import { Pomodoro } from "./pomodoro";
import { StatusBarItemOptions, TimerCommand } from "./types";

const registerCommands = (
  { subscriptions }: ExtensionContext,
  timer: Pomodoro
) => {
  subscriptions.push(
    commands.registerCommand(TimerCommand.start, () => timer.start())
  );
  subscriptions.push(
    commands.registerCommand(TimerCommand.stop, () => timer.stop())
  );
  subscriptions.push(
    commands.registerCommand(TimerCommand.skip, () => timer.skip())
  );
};

const createStatusBarItem = ({
  id,
  alignment,
  priority,
  ...options
}: StatusBarItemOptions) => {
  const item = id
    ? window.createStatusBarItem(id, alignment, priority)
    : window.createStatusBarItem(alignment, priority);

  type Key = keyof typeof options;

  for (const key in options) {
    // TODO fix types
    item[key as Key] = options[key as Key] as any;
  }

  return item;
};

const renderStatusBarItems = (
  { subscriptions }: ExtensionContext,
  timer: Pomodoro
) => {
  const skipButton = createStatusBarItem({
    alignment: StatusBarAlignment.Right,
    priority: 100,
    command: TimerCommand.skip,
    text: "$(debug-step-over)",
    tooltip: "Skip Pomodoro Period",
  });
  skipButton.show();

  const startButton = createStatusBarItem({
    alignment: StatusBarAlignment.Right,
    priority: 101,
    command: TimerCommand.start,
    text: "$(play)",
    tooltip: "Start Pomodoro Timer",
  });
  startButton.show();

  const stopButton = createStatusBarItem({
    alignment: StatusBarAlignment.Right,
    priority: 101,
    command: TimerCommand.stop,
    text: "$(debug-pause)",
    tooltip: "Stop Pomodoro Timer",
  });

  const clock = createStatusBarItem({
    alignment: StatusBarAlignment.Right,
    priority: 102,
    text: "00:00",
    tooltip: "Pomodoro Timer",
  });
  clock.show();

  const buttonSub = timer
    .onStateChange()
    .pipe(
      map((s) => s.isRunning),
      distinctUntilChanged()
    )
    .subscribe((isRunning) => {
      if (isRunning) {
        stopButton.show();
        startButton.hide();
      } else {
        stopButton.hide();
        startButton.show();
      }
    });

  const clockSub = timer.onStateChange().subscribe(() => {
    clock.text = timer.toString();
  });

  const buttonDisposable = new Disposable(buttonSub.unsubscribe);
  const clockDisposable = new Disposable(clockSub.unsubscribe);

  subscriptions.push(
    skipButton,
    startButton,
    stopButton,
    clock,
    buttonDisposable,
    clockDisposable
  );
};

export function activate(context: ExtensionContext) {
  console.log("pomodoro activated!");

  const timer = new Pomodoro();

  registerCommands(context, timer);
  renderStatusBarItems(context, timer);
}

export function deactivate() {}
