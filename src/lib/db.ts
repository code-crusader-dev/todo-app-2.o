// IndexedDB Database for Local-First Storage
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, TaskGroup, UserPreferences, DEFAULT_GROUPS } from '@/types/task';

interface TaskManagerDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-group': string;
      'by-date': string;
    };
  };
  groups: {
    key: string;
    value: TaskGroup;
    indexes: {
      'by-order': number;
    };
  };
  preferences: {
    key: string;
    value: UserPreferences;
  };
  tags: {
    key: string;
    value: { name: string; count: number };
  };
}

const DB_NAME = 'taskmanager';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<TaskManagerDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<TaskManagerDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TaskManagerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-group', 'group_id');
        taskStore.createIndex('by-date', 'start_date');
      }

      // Groups store
      if (!db.objectStoreNames.contains('groups')) {
        const groupStore = db.createObjectStore('groups', { keyPath: 'id' });
        groupStore.createIndex('by-order', 'order');
      }

      // Preferences store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences');
      }

      // Tags store
      if (!db.objectStoreNames.contains('tags')) {
        db.createObjectStore('tags', { keyPath: 'name' });
      }
    },
  });

  // Initialize default groups if empty
  const groups = await dbInstance.getAll('groups');
  if (groups.length === 0) {
    const tx = dbInstance.transaction('groups', 'readwrite');
    for (const group of DEFAULT_GROUPS) {
      await tx.store.put(group);
    }
    await tx.done;
  }

  return dbInstance;
}

// Task Operations
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function addTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
  
  // Update tag counts
  for (const tag of task.tags) {
    const existing = await db.get('tags', tag);
    await db.put('tags', { name: tag, count: (existing?.count || 0) + 1 });
  }
}

export async function updateTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', { ...task, updated_at: new Date().toISOString() });
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  const task = await db.get('tasks', id);
  
  if (task) {
    // Update tag counts
    for (const tag of task.tags) {
      const existing = await db.get('tags', tag);
      if (existing && existing.count > 1) {
        await db.put('tags', { name: tag, count: existing.count - 1 });
      } else {
        await db.delete('tags', tag);
      }
    }
  }
  
  await db.delete('tasks', id);
}

// Group Operations
export async function getAllGroups(): Promise<TaskGroup[]> {
  const db = await getDB();
  const groups = await db.getAllFromIndex('groups', 'by-order');
  return groups;
}

export async function addGroup(group: TaskGroup): Promise<void> {
  const db = await getDB();
  await db.put('groups', group);
}

export async function updateGroup(group: TaskGroup): Promise<void> {
  const db = await getDB();
  await db.put('groups', group);
}

export async function deleteGroup(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('groups', id);
}

// Preferences Operations
export async function getPreferences(): Promise<UserPreferences> {
  const db = await getDB();
  const prefs = await db.get('preferences', 'user');
  return prefs || {
    theme: 'system',
    defaultReminderMinutes: 15,
  };
}

export async function updatePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const db = await getDB();
  const current = await getPreferences();
  await db.put('preferences', { ...current, ...prefs }, 'user');
}

// Tags Operations
export async function getAllTags(): Promise<string[]> {
  const db = await getDB();
  const tags = await db.getAll('tags');
  return tags.sort((a, b) => b.count - a.count).map(t => t.name);
}
