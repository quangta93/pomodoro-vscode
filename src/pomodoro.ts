const MINUTE_1 = 6e4;

// unit == minute
export type Options = Partial<{
  duration: number;
  shortBreak: number;
  longBreak: number;
  periodsPerSet: number;
}>;

export class Pomodoro {
  private durationMs: number;
  private shortBreakMs: number;
  private longBreakMs: number;
  private cycleLength: number;

  private remainingMs: number = 0;
  private timer: NodeJS.Timeout | undefined;

  /**
   * Total count of both working periods & breaks.
   *
   * E.g. for the default settings, here are the periods of a full cycle:
   * |work|short_break|work|short_break|work|short_break|work|long_break|
   *
   * Formula: periods_per_cycle = 2 * working_periods_per_set
   */
  private periodCount = 1;

  constructor(public opts?: Options) {
    this.durationMs = (this.opts?.duration ?? 25) * MINUTE_1;
    this.shortBreakMs = (this.opts?.shortBreak ?? 5) * MINUTE_1;
    this.longBreakMs = (this.opts?.longBreak ?? 20) * MINUTE_1;
    this.cycleLength = this.opts?.periodsPerSet ?? 4;
  }

  public get cycleCount() {
    return Math.floor(this.periodCount / this.cycleLength);
  }

  public get isShortBreak() {
    const idx = this.periodCount % this.cycleLength;
    return idx % 2 === 0 && idx !== 0;
  }

  public get isLongBreak() {
    return this.periodCount % this.cycleLength === 0;
  }

  private countdown() {
    this.timer = setInterval(() => {
      if (this.remainingMs === 0) {
        clearInterval(this.timer);
        this.periodCount += 1;
        // TODO sound/notif
        return;
      }

      this.remainingMs -= 1000;
    }, 1000);
  }

  public start() {
    if (this.remainingMs === 0) {
      this.remainingMs = this.isShortBreak
        ? this.shortBreakMs
        : this.isLongBreak
        ? this.longBreakMs
        : this.durationMs;
    }

    this.countdown();
  }

  public stop() {
    clearInterval(this.timer);
  }

  public skip() {
    clearInterval(this.timer);
    this.remainingMs = 0;
    this.periodCount += 1;
  }
}
