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

  const currentYear = new Date().getFullYear();

  // Return to cover page (index)
  const handleGoToCover = () => {
    setShowCover(true);
    setActiveNav('calendar');
  };

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
    if (!e.target.value) return;
    const newDate = new Date(e.target.value + 'T00:00:00');
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
  });

  const currentMonth = selectedDate.getMonth();

  const weekDates = getWeekDates();

  // Cover Page (Index View)
  if (showCover) {
    return (
      <div className="min-h-screen bg-planner-bg flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-lg space-y-6">
          <div className="relative cursor-pointer group" onClick={() => setShowCover(false)}>
            <div className="absolute -top-8 -left-4 md:-left-8 text-4xl md:text-6xl opacity-20">🌸</div>
            <div className="absolute -top-4 -right-4 md:-right-8 text-3xl md:text-5xl opacity-20">🌷</div>
            <h1 className="font-script text-6xl sm:text-8xl md:text-9xl font-normal text-planner-text tracking-wider relative z-10 break-words transition group-hover:scale-105">
              Gabriela
            </h1>
            <div className="absolute -bottom-6 -left-8 text-3xl md:text-5xl opacity-20">🌺</div>
            <div className="absolute -bottom-4 -right-8 text-4xl md:text-6xl opacity-20">🪻</div>
          </div>
          <p className="font-serif text-xl md:text-2xl text-planner-muted tracking-wide">
            Nail Studio
          </p>
          <p className="text-planner-muted text-base md:text-lg">
            Agenda Digital {currentYear}
          </p>
          <button
            onClick={() => setShowCover(false)}
            className="mt-8 px-10 py-4 bg-planner-accent hover:bg-planner-active text-white font-semibold text-lg md:text-xl rounded-2xl shadow-lg transition-all min-h-[56px] w-full sm:w-auto"
          >
            Comenzar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-planner-bg p-2 sm:p-4 md:p-6 flex justify-center items-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-planner-border flex flex-col min-[700px]:flex-row h-full min-h-0 sm:min-h-[800px]">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full min-[700px]:w-64 bg-planner-bg/60 p-4 sm:p-5 border-b min-[700px]:border-b-0 min-[700px]:border-r border-planner-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between min-[700px]:block mb-4 min-[700px]:mb-6">
              
              {/* Clickable Brand / Title to go back to Cover Page */}
              <button 
                onClick={handleGoToCover}
                className="text-left group focus:outline-none transition-transform hover:opacity-80 active:scale-95"
                title="Volver a la Portada"
              >
                <h1 className="font-script text-4xl md:text-5xl font-normal text-planner-text tracking-wide mb-0.5 group-hover:text-planner-accent transition-colors">
                  Gabriela
                </h1>
                <p className="text-[10px] md:text-xs text-planner-muted uppercase tracking-widest mt-1">AGENDA {currentYear}</p>
              </button>

              <div className="text-2xl min-[700px]:hidden cursor-pointer" onClick={handleGoToCover}>🌸</div>
            </div>
            
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition min-h-[44px] ${
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

          <div 
            onClick={handleGoToCover}
            className="hidden min-[700px]:block mt-6 text-xs text-planner-muted text-center border-t border-planner-border pt-4 relative cursor-pointer hover:opacity-80 transition"
            title="Volver a la Portada"
          >
            <div className="text-4xl opacity-20">🌸</div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col bg-white overflow-hidden">
          <div>
            {/* HEADER & DATE SELECTOR */}
            <div className="mb-6">
              <h2 className="font-script text-4xl sm:text-5xl font-normal capitalize text-planner-text mb-4 leading-tight">
                {formattedDateHeader}
              </h2>

              {/* WEEK NAVIGATION BAR */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  
                  {/* Left Controls: Prev Week + Today + Date Picker */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button 
                      onClick={() => changeWeek(-1)}
                      className="p-2 rounded-xl bg-planner-bg hover:bg-planner-light text-planner-text transition shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                      aria-label="Previous Week"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <button 
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 sm:px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center space-x-1.5 whitespace-nowrap min-h-[38px] shrink-0"
                      style={{ backgroundColor: '#E91E63' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D81B60'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E91E63'}
                    >
                      <CalendarIcon size={14} />
                      <span>IR A HOY</span>
                    </button>

                    <div className="relative shrink-0">
                      <button 
                        onClick={() => {
                          if (datePickerRef.current?.showPicker) {
                            datePickerRef.current.showPicker();
                          } else {
                            datePickerRef.current?.focus();
                          }
                        }}
                        className="p-2 rounded-xl bg-planner-bg hover:bg-planner-light text-planner-text transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                        aria-label="Pick Date"
                      >
                        <CalendarIcon size={18} />
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

                  {/* Date Range Text + Next Week Button */}
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <span className="text-[11px] sm:text-sm font-semibold text-planner-muted truncate text-right">
                      {weekDates[0].toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }).toUpperCase()} - {weekDates[6].toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </span>

                    <button 
                      onClick={() => changeWeek(1)}
                      className="p-2 rounded-xl bg-planner-bg hover:bg-planner-light text-planner-text transition shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                      aria-label="Next Week"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                </div>
                
                {/* 7-DAY HORIZONTAL BAR */}
                <div className="flex overflow-x-auto py-1 space-x-1.5 sm:space-x-2 no-scrollbar">
                  {weekDates.map((date, index) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dateStringForQuery = date.toISOString().split('T')[0];
                    const hasAppointment = appointments.some(a => a.date === dateStringForQuery);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center flex-1 min-w-[42px] sm:min-w-[48px] py-2 px-1 rounded-xl transition relative ${
                          isSelected
                            ? 'bg-planner-active text-white ring-2 ring-planner-accent ring-offset-1'
                            : 'bg-planner-bg/50 text-planner-muted hover:bg-planner-bg'
                        }`}
                        style={isToday && !isSelected ? { backgroundColor: '#E91E63', color: 'white' } : {}}
                      >
                        <span className="text-[10px] sm:text-xs font-medium">{WEEK_DAYS[index]}</span>
                        <span className="text-xs sm:text-sm font-semibold">{date.getDate()}</span>
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
                <h3 className="font-serif text-xs sm:text-sm font-semibold text-planner-text mb-3">HORARIOS</h3>
                {TIME_SLOTS.map((slot) => {
                  const appointment = appointments.find(a => a.timeSlot === slot);

                  return (
                    <div 
                      key={slot}
                      className="flex items-center space-x-2 sm:space-x-3 py-1.5 border-b border-dashed border-planner-border"
                    >
                      <span className="w-16 sm:w-20 text-[11px] sm:text-xs font-semibold text-planner-muted flex items-center shrink-0">
                        <Clock size={11} className="inline mr-1" />
                        {slot}
                      </span>

                      <div className="flex-1 min-w-0">
                        {appointment ? (
                          <div 
                            onClick={() => handleEditAppointment(appointment)}
                            className="flex items-center justify-between bg-planner-light/50 px-3 py-1.5 rounded-lg border border-planner-border cursor-pointer hover:bg-planner-light/70 transition"
                          >
                            <span className="font-medium text-planner-text text-xs sm:text-sm flex items-center space-x-2 truncate">
                              <User size={13} className="text-planner-accent shrink-0" />
                              <span className="truncate">{appointment.clientName}</span>
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAppointment(appointment.id);
                              }}
                              className="text-planner-muted hover:text-red-500 transition p-1 shrink-0 ml-1"
                              aria-label="Delete Appointment"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveModalSlot(slot);
                              setClientInput('');
                            }}
                            className="w-full text-left py-1.5 px-3 text-xs text-planner-muted hover:bg-planner-bg/40 rounded-lg transition flex items-center space-x-1 min-h-[36px]"
                          >
                            <Plus size={13} />
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
                <div className="bg-planner-bg/30 p-4 rounded-2xl border border-planner-border relative min-h-[250px] md:min-h-full">
                  <h3 className="font-serif text-xs font-semibold text-planner-text mb-2 flex items-center space-x-2">
                    <FileText size={14} className="text-planner-accent" />
                    <span>NOTAS DEL DÍA</span>
                  </h3>
                  <textarea
                    rows={12}
                    value={dailyNoteRecord?.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Recordatorios o notas para hoy..."
                    className="w-full bg-transparent text-xs text-planner-text resize-none focus:outline-none leading-relaxed"
                    style={{ backgroundImage: 'radial-gradient(circle, #e8e2ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />
                  <div className="absolute bottom-2 right-2 text-2xl sm:text-3xl opacity-20">🌸</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - MONTH NAVIGATION */}
        <div className="w-full min-[700px]:w-16 bg-planner-bg/40 border-t min-[700px]:border-t-0 min-[700px]:border-l border-planner-border flex min-[700px]:flex-col items-center justify-between min-[700px]:justify-start p-2 min-[700px]:py-4 gap-1 overflow-x-auto min-[700px]:overflow-x-visible">
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
                className={`flex-1 min-[700px]:flex-none w-auto min-[700px]:w-12 py-2 min-[700px]:py-3 px-1 text-[10px] min-[700px]:text-xs font-bold transition relative ${
                  isSelected
                    ? 'bg-planner-active text-white shadow-lg'
                    : 'text-planner-muted hover:text-planner-text hover:bg-planner-bg/60'
                } ${
                  isSelected ? 'rounded-md min-[700px]:rounded-r-lg min-[700px]:-ml-2' : 'rounded-md min-[700px]:rounded-r-lg'
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
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-planner-border">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-planner-text mb-1">
              {editingAppointment ? 'Editar Cita' : 'Agendar Cita'}
            </h3>
            <p className="text-xs sm:text-sm text-planner-muted mb-6">
              Hora: <span className="font-semibold text-planner-text">{activeModalSlot}</span>
            </p>

            <form onSubmit={handleSaveAppointment} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-planner-muted mb-2">
                  Nombre de la Clienta
                </label>
                <input 
                  type="text"
                  autoFocus
                  required
                  value={clientInput}
                  onChange={(e) => setClientInput(e.target.value)}
                  placeholder="Ej. Maria Lopez"
                  className="w-full px-4 py-3 rounded-xl bg-planner-bg border border-planner-border text-sm sm:text-base text-planner-text focus:outline-none focus:ring-2 focus:ring-planner-accent min-h-[44px]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalSlot(null);
                    setEditingAppointment(null);
                  }}
                  className="px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-planner-muted hover:bg-planner-bg min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-planner-active text-white shadow-md hover:bg-planner-accent transition min-h-[44px]"
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