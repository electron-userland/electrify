declare module "deep-diff" {
  interface IDiff {
    kind: string;
    path: string[];
    lhs: any;
    rhs: any;
    index?: number;
    item?: IDiff;
  }

  interface IAccumulator {
    push(diff: IDiff): void;

    length: number;
  }

  interface IPrefilter {
    (path: string[], key: string): boolean;
  }

  function diff(lhs: Object, rhs: Object, prefilter?: IPrefilter, acc?: IAccumulator): IDiff[];

  function observableDiff(lhs: Object, rhs: Object, changes: Function, prefilter?: IPrefilter, path?: string[], key?: string, stack?: Object[]): void;

  function applyDiff(target: Object, source: Object, filter: Function): void;

  function applyChange(target: Object, source: Object, change: IDiff): void;

  function revertChange(target: Object, source: Object, change: IDiff): void;
}