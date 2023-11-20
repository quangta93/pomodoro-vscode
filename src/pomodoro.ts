import { EventEmitter } from "vscode";
import { BehaviorSubject } from "rxjs";

const MINUTE_1 = 6e4;

// unit == minute
export type Options = Partial<{
  focus: number;
  shortBreak: number;
  longBreak: number;
}>;

export type State = {
  isRunning: boolean;
  sessionCount: number;
  remainingMs: number;
  currentSession: "focus" | "short_break" | "long_break";
};

const CYCLE_LEN = 4; // focus + short_break + focus + long_break

export class Pomodoro {
  private _focusMs: number;
  private _shortBreakMs: number;
  private _longBreakMs: number;

  private _timerId: NodeJS.Timeout | undefined;

  private _state$: BehaviorSubject<State>;
  private _state: State;

  constructor(public opts?: Options) {
    this._focusMs = (this.opts?.focus ?? 25) * MINUTE_1;
    this._shortBreakMs = (this.opts?.shortBreak ?? 5) * MINUTE_1;
    this._longBreakMs = (this.opts?.longBreak ?? 20) * MINUTE_1;

    this._state = {
      isRunning: false,
      sessionCount: 1,
      remainingMs: this._focusMs,
      currentSession: "focus",
    };
    this._state$ = new BehaviorSubject(this._state);
  }

  public get isShortBreak() {
    const idx = this._state.sessionCount % CYCLE_LEN;
    return idx % 2 === 0 && idx !== 0;
  }

  public get isLongBreak() {
    return this._state.sessionCount % CYCLE_LEN === 0;
  }

  private setupNewSession() {
    this._state.sessionCount += 1;
    this._state.isRunning = false;

    if (this.isShortBreak) {
      this._state.currentSession = "short_break";
      this._state.remainingMs = this._shortBreakMs;
    } else if (this.isLongBreak) {
      this._state.currentSession = "long_break";
      this._state.remainingMs = this._longBreakMs;
    } else {
      this._state.currentSession = "focus";
      this._state.remainingMs = this._focusMs;
    }
  }

  public start() {
    this._state.isRunning = true;
    this.notify();

    this._timerId = setInterval(() => {
      if (this._state.remainingMs === 0) {
        clearInterval(this._timerId);
        this.setupNewSession();
      } else {
        this._state.remainingMs -= 1000;
      }

      this.notify();
    }, 1000);
  }

  public stop() {
    clearInterval(this._timerId);
    this._state.isRunning = false;
    this.notify();
  }

  public skip() {
    clearInterval(this._timerId);
    this.setupNewSession();
    this.notify();
  }

  private notify() {
    this._state$.next(this._state);
  }

  public onStateChange() {
    return this._state$.asObservable();
  }

  public toString() {
    const mins = `${Math.floor(this._state.remainingMs / MINUTE_1)}`.padStart(
      2,
      "0"
    );
    const secs = `${Math.floor(
      (this._state.remainingMs % MINUTE_1) / 1000
    )}`.padStart(2, "0");

    return `${mins}:${secs} (${this._state.currentSession})`;
  }
}
