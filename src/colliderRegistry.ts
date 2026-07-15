/**
 * Collider Registry
 * 
 * Maps Rapier collider handles (numbers) to entity type strings.
 * This bypasses the unreliable parent().userData approach by maintaining
 * our own lookup table that components register into on mount.
 */

const registry = new Map<number, string>();

export function registerCollider(handle: number, type: string): void {
  registry.set(handle, type);
}

export function unregisterCollider(handle: number): void {
  registry.delete(handle);
}

export function getColliderType(handle: number): string | undefined {
  return registry.get(handle);
}
