import {
  isWritableStorage,
  type ReadableStorage,
  type WritableStorage,
} from './storage/document-storage.ts'
import type { OfficeDocument } from './types.ts'

export interface ArchiveResult {
  savedIn: string[]
  skipped: string[]
}

/**
 * Replica cada documento en todos los almacenes escribibles y se encarga de
 * las purgas por retención de datos. Los almacenes de solo lectura se
 * consultan, pero nunca se modifican.
 */
export class ArchiveService {
  constructor(private readonly storages: ReadableStorage[]) {}

  archive(document: OfficeDocument): ArchiveResult {
    const savedIn: string[] = []
    const skipped: string[] = []

    for (const storage of this.storages) {
      if (!isWritableStorage(storage)) {
        skipped.push(storage.name)
        continue
      }

      try {
        storage.save(document)
        savedIn.push(storage.name)
      } catch {
        skipped.push(storage.name)
      }
    }

    return { savedIn, skipped }
  }

  purge(id: string): string[] {
    return this.writableStorages()
      .filter((storage) => storage.remove(id))
      .map((storage) => storage.name)
  }

  findDocument(id: string): OfficeDocument | null {
    for (const storage of this.storages) {
      const found = storage.load(id)
      if (found !== null) return found
    }
    return null
  }

  private writableStorages(): WritableStorage[] {
    return this.storages.filter(isWritableStorage)
  }
}
