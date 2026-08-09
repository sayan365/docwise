import type { DocumentItem } from '../types';

const DATABASE_NAME = 'jargonbuster-cache';
const STORE_NAME = 'app-data';
const DOCUMENTS_KEY = 'documents';
let writeQueue: Promise<void> = Promise.resolve();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadStoredDocuments(): Promise<DocumentItem[] | null> {
  if (!('indexedDB' in window)) return null;
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(DOCUMENTS_KEY);
    request.onsuccess = () => resolve(request.result?.value ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeDocuments(documents: DocumentItem[]): Promise<void> {
  if (!('indexedDB' in window)) return;
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ key: DOCUMENTS_KEY, value: documents });
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export function storeDocuments(documents: DocumentItem[]): Promise<void> {
  // Keep large file-backed writes ordered so a slower, older chat state can
  // never finish after a newer one and overwrite it.
  writeQueue = writeQueue.catch(() => undefined).then(() => writeDocuments(documents));
  return writeQueue;
}
