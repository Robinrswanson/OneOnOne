import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css'; // Ensure the correct CSS file is imported

const localizer = momentLocalizer(moment);

const CalendarView = ({ events, onSelectSlot, allowEventCreation }) => {
    const [tempEvent, setTempEvent] = useState(null);
    const [currentView, setCurrentView] = useState('week'); // Track the current view

    const handleSelect = ({ start, end }) => {
        if (allowEventCreation && (currentView === 'week' || currentView === 'day')) {
            setTempEvent({ start, end, title: '' });
        }
    };

    const handleInputChange = (e) => {
        setTempEvent({ ...tempEvent, title: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tempEvent && tempEvent.title) {
            onSelectSlot(tempEvent);
            setTempEvent(null);
        }
    };

    const combinedEvents = tempEvent ? [...events, tempEvent] : events;

    return (
        <div className="container">
            <div className="calendar-wrapper">
                <Calendar
                    localizer={localizer}
                    events={combinedEvents}
                    selectable={allowEventCreation && (currentView === 'week' || currentView === 'day')} // Enable selectable only for 'week' and 'day' views when event creation is allowed
                    onSelectSlot={handleSelect}
                    defaultView="week"
                    views={['month', 'week', 'day']}
                    step={30}
                    showMultiDayTimes
                    defaultDate={new Date()}
                    onView={(view) => setCurrentView(view)} // Update the current view
                />
            </div>
            {tempEvent && (
                <form onSubmit={handleSubmit} className="calendar-form">
                    <input
                        type="text"
                        value={tempEvent.title}
                        onChange={handleInputChange}
                        placeholder="Timeslot"
                        required
                    />
                    <button type="submit">Add Timeslot</button>
                </form>
            )}
        </div>
    );
};

export default CalendarView;
