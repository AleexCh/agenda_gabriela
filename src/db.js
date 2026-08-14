import Dexie from 'dexie';

export const db = new Dexie('PastelAgendaDB');

// Version 1 Schema Definition
db.version(1).stores({
  // Indexed by primary key (id) and composite query field (date)
  appointments: '++id, date, timeSlot, clientName', 
  // Keyed directly by date ISO string (YYYY-MM-DD)
  dailyNotes: 'date, notes' 
});
