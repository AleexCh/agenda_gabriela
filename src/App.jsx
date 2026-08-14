import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  User, 
  Clock, 
  FileText
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
];

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const TIME_SLOTS = [
  '08:00 am', '09:00 am', '10:00 am', '11:00 am', 
  '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', 
  '04:00 pm', '05:00 pm', '06:00 pm'
];

export default function App() {
  const [showCover, setShowCover] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeModalSlot, setActiveModalSlot] = useState(null);
  const [clientInput, setClientInput] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [activeNav, setActiveNav] = useState('calendar');
  const datePickerRef = useRef(null);

  // Format date to ISO format YYYY-MM-DD for IndexedDB indexing
  const dateString = selectedDate.toISOString().split('T')[0];

  // Reactive IndexedDB Queries
  const appointments = useLiveQuery(
    () => db.appointments.where('date').equals(dateString).toArray(),
    [dateString]
  ) || [];

  const dailyNoteRecord = useLiveQuery(
    () => db.dailyNotes.get(dateString),
    [dateString]
  );

  // Date Controls
  const changeDate = (days) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const changeWeek = (weeks) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + (weeks * 7));
    setSelectedDate(nextDate);
  };

  // Database Mutations
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!clientInput.trim()) return;

    if (editingAppointment) {
      await db.appointments.update(editingAppointment.id, {
        clientName: clientInput.trim()
      });
      setEditingAppointment(null);
    } else {
      await db.appointments.put({
        date: dateString,
        timeSlot: activeModalSlot,
        clientName: clientInput.trim()
      });
    }

    setClientInput('');
    setActiveModalSlot(null);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setActiveModalSlot(appointment.timeSlot);
    setClientInput(appointment.clientName);
  };

  const handleDeleteAppointment = async (id) => {
    await db.appointments.delete(id);
  };

  const handleNotesChange = async (val) => {
    await db.dailyNotes.put({
      date: dateString,
      notes: val
    });
  };

  const handleDatePick = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  // Get week dates for navigation widget
  const getWeekDates = () => {
    const week = [];
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const formattedDateHeader = selectedDate.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).toUpperCase();

  const currentMonth = selectedDate.getMonth();

  const weekDates = getWeekDates();

  // Cover Page
  if (showCover) {
    return (
      <div className="min-h-screen bg-planner-bg flex flex-col justify-center items-center p-8">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="absolute -top-8 -left-8 text-6xl opacity-20">🌸</div>
            <div className="absolute -top-4 -right-8 text-5xl opacity-20">🌷</div>
            <h1 className="font-serif text-7xl md:text-9xl font-bold text-planner-text tracking-wider relative z-10">
              GABRIELA
            </h1>
            <div className="absolute -bottom-6 -left-12 text-5xl opacity-20">🌺</div>
 <div className="absolute -bottom-4 -right-12 text-6xl opacity-20">🪻</div>
          </div>
          <p className="font-serif text-2xl text-planner-muted tracking-wide">
            Nail Studio
          </p>
          <p className="text-planner-muted text-lg">
            Agenda Digital
          </p>
          <button
            onClick={() => setShowCover(false)}
            className="mt-12 px-12 py-4 bg-planner-accent hover:bg-planner-active text-white font-semibold text-xl rounded-2xl shadow-lg transition-all min-h-[56px]"
          >
            Comenzar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-planner-bg p-4 md:p-6 flex justify-center items-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden border border-planner-border flex flex-col md:flex-row min-h-[800px]">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-64 bg-planner-bg/60 p-5 border-r border-planner-border flex flex-col justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-planner-text tracking-wide mb-1">
              GABRIELA
            </h1>
            <p className="text-xs text-planner-muted uppercase tracking-widest mb-6">AGENDA</p>
            
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition min-h-[44px] ${
                      activeNav === item.id
                        ? 'bg-planner-active text-white font-medium shadow-sm'
                        : 'text-planner-muted hover:bg-planner-bg/50'
                    }`}
                    onClick={() => setActiveNav(item.id)}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 text-xs text-planner-muted text-center border-t border-planner-border pt-4 relative">
            <div className="text-4xl opacity-20">🌸</div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-6 md:p-8 flex flex-col bg-white">
          <div>
            {/* HEADER & DATE SELECTOR */}
            <div className="mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold capitalize text-planner-text mb-4">
                {formattedDateHeader}
              </h2>

            {/* WEEK NAVIGATION */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => changeWeek(-1)}
                    className="p-2 rounded-xl bg-planner-bg hover:bg-planner-light text-planner-text transition min-w-[40px] min-h-[40px]"
                    aria-label="Previous Week"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedDate(new Date())}
                    className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md transition flex items-center space-x-2"
                    style={{ backgroundColor: '#E91E63' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D81B60'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E91E63'}
                  >
                    <CalendarIcon size={16} />
                    <span>IR A HOY</span>
                  </button>
                  <div className="relative">
  <button 
    onClick={() => {
      // Fallback for browsers that require standard .click() or .focus()
      if (datePickerRef.current?.showPicker) {
        datePickerRef.current.showPicker();
      } else {
        datePickerRef.current?.focus();
      }
    }}
    className="p-2 rounded-xl bg-planner-bg hover:bg-planner-light text-planner-text transition min-w-[40px] min-h-[40px]"
    aria-label="Pick Date"
  >
    <CalendarIcon size={20} />
  </button>
  <input
    ref={datePickerRef}
    type="date"
    value={dateString}
    onChange={handleDatePick}
    className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
  />
</div>
                </div>
                <span className="text-sm font-semibold text-planner-muted">
                  {weekDates[0].toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }).toUpperCase()} - {weekDates[6].toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </span>
                <button 
                  onClick={() => changeWeek(1)}
                  className="p-2 rounded-xl bg-planner-bg hover:bg-planner-light text-planner-text transition min-w-[40px] min-h-[40px]"
                  aria-label="Next Week"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="flex justify-center space-x-2">
                {weekDates.map((date, index) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dateStringForQuery = date.toISOString().split('T')[0];
                  const hasAppointment = appointments.some(a => a.date === dateStringForQuery);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[48px] transition relative ${
                        isSelected
                          ? 'bg-planner-active text-white ring-2 ring-planner-accent ring-offset-2'
                          : 'bg-planner-bg/50 text-planner-muted hover:bg-planner-bg'
                      }`}
                      style={isToday && !isSelected ? { backgroundColor: '#E91E63', color: 'white' } : {}}
                    >
                      <span className="text-xs font-medium">{WEEK_DAYS[index]}</span>
                      <span className="text-sm font-semibold">{date.getDate()}</span>
                      {hasAppointment && (
                        <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            </div>

            {/* TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TIMELINE */}
              <div className="space-y-2">
                <h3 className="font-serif text-sm font-semibold text-planner-text mb-3">HORARIOS</h3>
                {TIME_SLOTS.map((slot) => {
                  const appointment = appointments.find(a => a.timeSlot === slot);

                  return (
                    <div 
                      key={slot}
                      className="flex items-center space-x-3 py-2 border-b border-dashed border-planner-border"
                    >
                      <span className="w-20 text-xs font-semibold text-planner-muted flex items-center">
                        <Clock size={12} className="inline mr-1" />
                        {slot}
                      </span>

                      <div className="flex-1">
                        {appointment ? (
                          <div 
                            onClick={() => handleEditAppointment(appointment)}
                            className="flex items-center justify-between bg-planner-light/50 px-3 py-2 rounded-lg border border-planner-border cursor-pointer hover:bg-planner-light/70 transition"
                          >
                            <span className="font-medium text-planner-text text-sm flex items-center space-x-2">
                              <User size={14} className="text-planner-accent" />
                              <span>{appointment.clientName}</span>
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAppointment(appointment.id);
                              }}
                              className="text-planner-muted hover:text-red-500 transition p-1 min-w-[36px] min-h-[36px]"
                              aria-label="Delete Appointment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveModalSlot(slot);
                              setClientInput('');
                            }}
                            className="w-full text-left py-2 px-3 text-xs text-planner-muted hover:bg-planner-bg/40 rounded-lg transition flex items-center space-x-1 min-h-[40px]"
                          >
                            <Plus size={14} />
                            <span>CLIENTA</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NOTES PANEL */}
              <div className="space-y-4">
                <div className="bg-planner-bg/30 p-4 rounded-2xl border border-planner-border relative">
                  <h3 className="font-serif text-xs font-semibold text-planner-text mb-2 flex items-center space-x-2">
                    <FileText size={14} className="text-planner-accent" />
                    <span>NOTAS DEL DÍA</span>
                  </h3>
                  <textarea
                    rows={15}
                    value={dailyNoteRecord?.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Recordatorios o notas para hoy..."
                    className="w-full bg-transparent text-xs text-planner-text resize-none focus:outline-none leading-relaxed"
                    style={{ backgroundImage: 'radial-gradient(circle, #e8e2ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />
                  <div className="absolute bottom-2 right-2 text-3xl opacity-20">🌸</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - MONTH NAVIGATION (BOOKMARK STYLE) */}
        <div className="w-16 bg-planner-bg/40 border-l border-planner-border flex flex-col items-center py-4 gap-1">
          {MONTHS.map((month, index) => {
            const isSelected = index === currentMonth;
            return (
              <button
                key={month}
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  const isCurrentMonth = index === new Date().getMonth() && newDate.getFullYear() === new Date().getFullYear();
                  newDate.setMonth(index);
                  if (!isCurrentMonth) {
                    newDate.setDate(1);
                  }
                  setSelectedDate(newDate);
                }}
                className={`w-12 py-3 text-xs font-bold transition relative ${
                  isSelected
                    ? 'bg-planner-active text-white shadow-lg'
                    : 'text-planner-muted hover:text-planner-text hover:bg-planner-bg/60'
                } ${
                  isSelected ? 'rounded-r-lg -ml-2' : 'rounded-r-lg'
                }`}
                style={{
                  clipPath: isSelected 
                    ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 70%, 8px 50%, 0 30%)'
                    : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 70%, 6px 50%, 0 30%)'
                }}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>

      {/* APPOINTMENT MODAL */}
      {activeModalSlot && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-planner-border">
            <h3 className="font-serif text-2xl font-bold text-planner-text mb-2">
              {editingAppointment ? 'Editar Cita' : 'Agendar Cita'}
            </h3>
            <p className="text-sm text-planner-muted mb-6">
              Hora: <span className="font-semibold text-planner-text">{activeModalSlot}</span>
            </p>

            <form onSubmit={handleSaveAppointment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-planner-muted mb-2">
                  Nombre de la Clienta
                </label>
                <input 
                  type="text"
                  autoFocus
                  required
                  value={clientInput}
                  onChange={(e) => setClientInput(e.target.value)}
                  placeholder="Ej. Maria Lopez"
                  className="w-full px-5 py-4 rounded-xl bg-planner-bg border border-planner-border text-base text-planner-text focus:outline-none focus:ring-2 focus:ring-planner-accent min-h-[48px]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalSlot(null)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-planner-muted hover:bg-planner-bg min-h-[48px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl text-sm font-semibold bg-planner-active text-white shadow-md hover:bg-planner-accent transition min-h-[48px]"
                >
                  {editingAppointment ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
