import type { OfficeDocument } from '../types.ts'
import { DocumentStorage } from './document-storage.ts'

const MAX_KEY_LENGTH = 60

/** Almacén en el bucket de objetos del proveedor cloud. */
export class ObjectBucketStorage extends DocumentStorage {
  readonly name = 'bucket-cloud'
  private readonly objects = new Map<string, OfficeDocument>()

  save(document: OfficeDocument): string {
    // El proveedor rechaza las claves con espacios o de más de 60 caracteres,
    // así que la clave se normaliza aquí en lugar de exigírselo al cliente.
    const key = document.name.replace(/\s+/g, '_').slice(0, MAX_KEY_LENGTH)
    this.objects.set(document.id, { ...document, name: key })
    return `s3://oficina/${key}`
  }

  load(id: string): OfficeDocument | null {
    return this.objects.get(id) ?? null
  }

  remove(id: string): boolean {
    return this.objects.delete(id)
  }

  listIds(): string[] {
    return [...this.objects.keys()]
  }
}
