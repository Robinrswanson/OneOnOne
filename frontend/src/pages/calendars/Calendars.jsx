import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";
import './Calendars.css';
import 'react-tooltip/dist/react-tooltip.css';
import Navbar from '../../components/Navbar';

const CalendarPage = () => {
  const { token } = useAuth();
  const [allCalendars, setAllCalendars] = useState([]);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarComment, setNewCalendarComment] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortCriteria, setSortCriteria] = useState('name');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Function to add a new calendar
  const handleAddCalendar = async (event) => {
    event.preventDefault();
    const calendarData = {
      name: newCalendarName,
      comment: newCalendarComment
    };
    try {
      const response = await axios.post(`${backendUrl}/calendars/primary/`, calendarData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newCalendar = response.data;
      setAllCalendars([...allCalendars, { ...newCalendar, type: 'primary' }]);
      setNewCalendarName('');
      setNewCalendarComment('');
    } catch (error) {
      console.error('Error creating calendar:', error);
    }
  };

  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    const fetchCalendars = async () => {
      try {
        const [primaryResponse, secondaryResponse] = await Promise.all([
          axios.get(`${backendUrl}/calendars/primary/`, config),
          axios.get(`${backendUrl}/calendars/secondary/`, config)
        ]);

        const combinedCalendars = [
          ...primaryResponse.data.map(calendar => ({ ...calendar, type: 'primary' })),
          ...secondaryResponse.data.map(calendar => ({ ...calendar, type: 'secondary' }))
        ];

        console.log('Combined calendars:', combinedCalendars)

        setAllCalendars(combinedCalendars);
      } catch (error) {
        console.error('Error fetching calendars:', error);
      }
    };

    fetchCalendars();
  }, [token, backendUrl]);

  const filteredCalendars = allCalendars.filter(calendar => {
    if (filter === 'all') return true;
    if (filter === 'primary' && calendar.type === 'primary') return true;
    if (filter === 'secondary' && calendar.type === 'secondary') return true;
    if (filter === 'finalized' && calendar.status === 'finalized') return true;
    if (filter === 'submitted' && calendar.status === 'submitted') return true;
    if (filter === 'created' && calendar.status === 'created') return true;
    return false;
  });

  const sortedCalendars = filteredCalendars.sort((a, b) => {
    if (sortCriteria === 'name') return a.name.localeCompare(b.name);
    if (sortCriteria === 'status') return a.status.localeCompare(b.status);
    // Add more sorting criteria as needed
    return 0;
  });

  return (
    <>
      <Navbar activePage='calendars'/>
      <main>
        <div className="container-sm">
          {/* Create a calendar*/}
          <h2 className="text-center my-4 gold">Create a New Calendar</h2>
          <div className="add-calendar-form">
            <form onSubmit={handleAddCalendar} className="calendar-form">
              <input 
                className="calendar-input"
                type="text" 
                value={newCalendarName} 
                onChange={(e) => setNewCalendarName(e.target.value)} 
                placeholder="Enter a Calendar Name" 
                required 
              />
              <input 
                className="calendar-input"
                type="text" 
                value={newCalendarComment} 
                onChange={(e) => setNewCalendarComment(e.target.value)} 
                placeholder="Enter a Description (Optional)" 
              />
              <button type="submit" className="btn btn-primary">Create Calendar</button>
            </form>
          </div>

          {/* List of calendar*/}
          <h2 className="text-center my-4 gold">My Calendars</h2>
          <div className="filters">
            <h4>Filters:</h4>
            <select className="form-select" onChange={(e) => setFilter(e.target.value)} value={filter}>
              <option value="all">All</option>
              <option value="primary">Organizer</option>
              <option value="secondary">Attendee</option>
              <option value="finalized">Finalized</option>
              <option value="submitted">Submitted</option>
              <option value="created">Created</option>
            </select>
            <h4>Sort:</h4>
            <select className="form-select" onChange={(e) => setSortCriteria(e.target.value)} value={sortCriteria}>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="list-group">
            {sortedCalendars.map(calendar => (
              <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                {calendar.name} ({calendar.status}) Organizer: {calendar.owner_username}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer text-center py-3">
        <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
      </footer>
    </>
  );
};

export default CalendarPage;
