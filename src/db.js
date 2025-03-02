import { openDB } from 'idb';

const DB_NAME = "TradingApp";
const DB_VERSION = 5; // Increment to update schema
const SESSION_STORE = "sessions";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(SESSION_STORE)) {
      db.createObjectStore(SESSION_STORE, { keyPath: "id", autoIncrement: true });
    }
  },
});

// Create a new session (ensures start & current date are stored)
export const createSession = async (session) => {
  const db = await dbPromise;
  return await db.add(SESSION_STORE, session);
};

// Get all saved sessions
export const getAllSessions = async () => {
  const db = await dbPromise;
  return await db.getAll(SESSION_STORE);
};

// Get a specific session by ID
export const getSession = async (sessionId) => {
  const db = await dbPromise;
  return await db.get(SESSION_STORE, sessionId);
};

// Update a session (now includes currentDate for tracking trading days)
export const updateSession = async (sessionId, updatedSession) => {
  const db = await dbPromise;
  await db.put(SESSION_STORE, { ...updatedSession, id: sessionId });
};

// Delete a session
export const deleteSession = async (sessionId) => {
  const db = await dbPromise;
  await db.delete(SESSION_STORE, sessionId);
};
