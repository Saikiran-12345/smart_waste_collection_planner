import { setItem, getItem } from '@/utils/localStorageHelper';

export const REPO_KEY = 'smart-waste-data';

export type EntityMap = Record<string, any>;

export function loadRepo(): EntityMap {
  const raw = getItem<Record<string, any>>(REPO_KEY);
  return raw ?? {};
}

export function saveRepo(data: EntityMap): void {
  setItem(REPO_KEY, data);
}

export function create<Entity extends { id?: string }>(typeName: string, entity: Omit<Entity, 'id'> & { id?: string }): Entity {
  const repo = loadRepo();
  const collection = repo[typeName] ?? {};
  const id = entity.id || `${typeName.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
  const finalEntity = { ...entity, id } as unknown as Entity;
  collection[id] = finalEntity;
  repo[typeName] = collection;
  saveRepo(repo);
  return finalEntity;
}

export function readAll<Entity>(typeName: string): Entity[] {
  const repo = loadRepo();
  const collection = repo[typeName] ?? {};
  return Object.values(collection) as Entity[];
}

export function readOne<Entity>(typeName: string, id: string): Entity | undefined {
  const repo = loadRepo();
  const collection = repo[typeName] ?? {};
  return collection[id] as Entity | undefined;
}

export function update<Entity extends { id: string }>(typeName: string, id: string, updates: Partial<Omit<Entity, 'id'>>): Entity {
  const repo = loadRepo();
  const collection = repo[typeName] ?? {};
  const existing = collection[id];
  if (!existing) {
    throw new Error(`${typeName} with id ${id} does not exist`);
  }
  const updatedEntity = { ...existing, ...updates };
  collection[id] = updatedEntity;
  repo[typeName] = collection;
  saveRepo(repo);
  return updatedEntity;
}

export function remove(typeName: string, id: string): void {
  const repo = loadRepo();
  const collection = repo[typeName] ?? {};
  delete collection[id];
  repo[typeName] = collection;
  saveRepo(repo);
}
