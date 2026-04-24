export type PrintTarget = 'browser' | 'qz-tray' | 'printnode';

export type PrintJob = {
  target?: PrintTarget;
  documentTitle?: string;
  onBeforePrint?: () => void;
};

export const printerService = {
  async printReceipt(job: PrintJob = {}) {
    if (job.target && job.target !== 'browser') {
      throw new Error(`${job.target} printing is not configured yet.`);
    }

    job.onBeforePrint?.();
    window.setTimeout(() => window.print(), 50);
  },
};
