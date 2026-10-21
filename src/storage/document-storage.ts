import type { OfficeDocument } from '../types.ts'

/**
 * Almacén del que se puede leer.
 *
 * CONTRATO:
 *  - load(id)    devuelve el documento, o null si no está.
 *  - listIds()   devuelve los ids de todo lo almacenado.
 */
export interface ReadableStorage {
  readonly name: string

  load(id: string): OfficeDocument | null
  listIds(): string[]
}

/**
 * Almacén en el que además se puede escribir.
 *
 * CONTRATO:
 *  - save(doc)   guarda el documento y devuelve la ruta donde ha quedado.
 *                Acepta cualquier documento válido: si el almacén tiene
 *                reglas propias (p. ej. formato de claves), las aplica él.
 *  - remove(id)  borra el documento y devuelve true solo si existía y se ha borrado.
 */
export interface WritableStorage extends ReadableStorage {
  save(document: OfficeDocument): string
  remove(id: string): boolean
}

export const isWritableStorage = (storage: ReadableStorage): storage is WritableStorage =>
  'save' in storage && 'remove' in storage

/** Base común de los almacenes escribibles. */
export abstract class DocumentStorage implements WritableStorage {
  abstract readonly name: string

  abstract save(document: OfficeDocument): string
  abstract load(id: string): OfficeDocument | null
  abstract remove(id: string): boolean
  abstract listIds(): string[]
}
