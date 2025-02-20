import { openDB } from 'idb';

const DB_NAME = 'QuizHistoryDB';
const STORE_NAME = 'attempts';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveAttempt(attempt) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add(attempt);
  await tx.done;
}

export async function getAllAttempts() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
