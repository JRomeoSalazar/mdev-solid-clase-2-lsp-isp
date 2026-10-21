import {
  isFaxSender,
  isPrinter,
  isScanner,
  isStapler,
  isTonerRefillable,
  type OfficeDevice,
} from './devices/office-device.ts'
import type { FaxReceipt, OfficeDocument, PrintJob } from './types.ts'

const CAPABILITY_LABELS: [(device: OfficeDevice) => boolean, string][] = [
  [isPrinter, 'imprime'],
  [isScanner, 'escanea'],
  [isFaxSender, 'faxea'],
  [isStapler, 'grapa'],
  [isTonerRefillable, 'tóner'],
]

/**
 * Coordina el parque de aparatos de la oficina: reparte cada tarea entre los
 * dispositivos disponibles.
 */
export class OfficeWorkflow {
  constructor(private readonly devices: OfficeDevice[]) {}

  printDocument(document: OfficeDocument, copies: number): PrintJob {
    const printer = this.readyDevices().find(isPrinter)
    if (!printer) throw new Error('No hay ningún dispositivo disponible capaz de imprimir')
    return printer.print(document, copies)
  }

  digitize(pages: number): OfficeDocument {
    const scanner = this.readyDevices().find(isScanner)
    if (!scanner) throw new Error('No hay ningún dispositivo disponible capaz de escanear')
    return scanner.scan(pages)
  }

  sendFax(document: OfficeDocument, number: string): FaxReceipt {
    const faxSender = this.readyDevices().find(isFaxSender)
    if (!faxSender) throw new Error('No hay ningún dispositivo disponible capaz de enviar faxes')
    return faxSender.fax(document, number)
  }

  printAndStaple(document: OfficeDocument, copies: number): PrintJob {
    const job = this.printDocument(document, copies)
    const device = this.devices.find((candidate) => candidate.id === job.deviceId)
    if (device && isStapler(device)) device.staple(job.jobId)
    return job
  }

  /**
   * Inventario de capacidades para el informe de mantenimiento.
   */
  capabilitiesReport(): string[] {
    return this.devices.map((device) => {
      const labels = CAPABILITY_LABELS.filter(([has]) => has(device)).map(([, label]) => label)
      return `${device.id} (${device.model}): ${labels.join(', ') || 'desconocido'}`
    })
  }

  private readyDevices(): OfficeDevice[] {
    return this.devices.filter((device) => device.getStatus() === 'ready')
  }
}
