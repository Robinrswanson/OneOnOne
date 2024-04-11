import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";
import './Calendars.css';

const CalendarPage = () => {
  const auth = useAuth();
  const { token } = useAuth();
  const [primaryCalendars, setPrimaryCalendars] = useState([]);
  const [secondaryCalendars, setSecondaryCalendars] = useState([]);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse

  const backendUrl = 'https://ec2-3-95-237-137.compute-1.amazonaws.com';
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarComment, setNewCalendarComment] = useState('');


  // Function to toggle navbar collapse state
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    // ... (existing useEffect for fetching calendars)

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
            setPrimaryCalendars([...primaryCalendars, newCalendar]);
            setNewCalendarName('');  
        } catch (error) {
            console.error('Error creating calendar:', error);
        }
    };

    useEffect(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // Fetching Primary Calendars
        axios.get(`${backendUrl}/calendars/primary/`, config)
            .then(response => {
                setPrimaryCalendars(response.data);
            })
            .catch(error => console.error('Error fetching primary calendars:', error));

        // Fetching Secondary Calendars
        axios.get(`${backendUrl}/calendars/secondary/`, config)
            .then(response => {
                setSecondaryCalendars(response.data);
            })
            .catch(error => console.error('Error fetching secondary calendars:', error));
    }, [token]);

  const finalizedCalendars = primaryCalendars.filter(calendar => calendar.status === 'finalized');
  const submittedCalendars = primaryCalendars.filter(calendar => calendar.status === 'submitted');
  const inProgressCalendars = primaryCalendars.filter(calendar => calendar.status === 'created');

  const contactFinalizedCalendars = secondaryCalendars.filter(calendar => calendar.contact_status === 'finalized');
  const contactSubmittedCalendars = secondaryCalendars.filter(calendar => calendar.contact_status === 'submitted');
  const contactInProgressCalendars = secondaryCalendars.filter(calendar => calendar.contact_status === 'not_submitted');

  return (
    <>
    <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">1on1</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded={!isNavCollapsed} 
                    aria-label="Toggle navigation" onClick={handleNavCollapse}>
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
                <ul className="navbar-nav me-auto mb-lg-0">
                    <li className="nav-item"><Link className="nav-link" to="/dashboard/">Dashboard</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/contacts/">Contacts</Link></li>
                    <li className="nav-item"><Link className="nav-link current" to="/calendars/">Calendars</Link></li>
                </ul>
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item"><Link className="nav-link" to="/accounts/">Account</Link></li>
                    <li className="nav-item">
                        <a className="nav-link" href="#!" onClick={(e) => {
                            e.preventDefault();
                            auth.logOut();
                        }}>Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
        
  <main>
  <div className="container-sm">
    <h2 className="text-center my-4 gold">Create a Calendar</h2>
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
      placeholder="Enter a Calendar Comment (Optional)" 
    />
    <button type="submit" className="btn btn-primary">Create Calendar</button>
    </form>
    
    </div>
    <h2 className="text-center my-4 gold">Primary Calendars</h2>
          <div className="row">
            {/* Finalized Calendars */}
            <div className="col-md-4">
              <h2 className="green">Finalized Calendars</h2>
              <div className="list-group">
                {finalizedCalendars.map(calendar => (
                  <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                  {calendar.name}
                </Link>
                ))}
              </div>
            </div>

            {/* Submitted Calendars */}
            <div className="col-md-4">
              <h2 className="green">Submitted Calendars</h2>
              <div className="list-group">
                {submittedCalendars.map(calendar => (
                  <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                  {calendar.name}
                </Link>
                ))}
              </div>
            </div>

            {/* In Progress Calendars */}
            <div className="col-md-4">
              <h2 className="green">In Progress Calendars</h2>
              <div className="list-group">
                {inProgressCalendars.map(calendar => (
                  <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                  {calendar.name}
                </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container-sm">
    <h2 className="text-center my-4 gold">Secondary Calendars</h2>
     
          <div className="row">
            {/* Finalized Calendars */}
            <div className="col-md-4">
              <h2 className="green">Finalized Calendars</h2>
              <div className="list-group">
                {contactFinalizedCalendars.map(calendar => (
                  <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                  {calendar.name}
                </Link>
                ))}
              </div>
            </div>

            {/* Submitted Calendars */}
            <div className="col-md-4">
              <h2 className="green">Submitted Calendars</h2>
              <div className="list-group">
                {contactSubmittedCalendars.map(calendar => (
                  <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                  {calendar.name}
                </Link>
                ))}
              </div>
            </div>

            {/* In Progress Calendars */}
            <div className="col-md-4">
              <h2 className="green">In Progress Calendars</h2>
              <div className="list-group">
                {contactInProgressCalendars.map(calendar => (
                  <Link to={`/calendars/${calendar.id}`} className="list-group-item list-group-item-action" key={calendar.id}>
                  {calendar.name}
                </Link>
                ))}
              </div>
            </div>
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
