import type { DeviceStatus, FaxReceipt, OfficeDocument, PrintJob } from '../types.ts'

/** Lo mínimo que tiene cualquier aparato de la oficina. */
export interface OfficeDevice {
  readonly id: string
  readonly model: string

  getStatus(): DeviceStatus
}

export interface Printer extends OfficeDevice {
  print(document: OfficeDocument, copies: number): PrintJob
}

export interface Scanner extends OfficeDevice {
  scan(pages: number): OfficeDocument
}

export interface FaxSender extends OfficeDevice {
  fax(document: OfficeDocument, number: string): FaxReceipt
}

export interface Stapler extends OfficeDevice {
  staple(jobId: string): void
}

export interface TonerRefillable extends OfficeDevice {
  refillToner(grams: number): number
}

export const isPrinter = (device: OfficeDevice): device is Printer => 'print' in device
export const isScanner = (device: OfficeDevice): device is Scanner => 'scan' in device
export const isFaxSender = (device: OfficeDevice): device is FaxSender => 'fax' in device
export const isStapler = (device: OfficeDevice): device is Stapler => 'staple' in device
export const isTonerRefillable = (device: OfficeDevice): device is TonerRefillable =>
  'refillToner' in device
