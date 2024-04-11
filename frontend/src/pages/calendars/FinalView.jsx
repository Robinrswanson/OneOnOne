import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import './FinalView.css';
import { useAuth } from "../../hooks/AuthProvider";


const FinalView = ({ calendar, token, isOwner }) => {
    const navigate = useNavigate();
    const backendUrl = 'http://ec2-3-95-237-137.compute-1.amazonaws.com';
    const [contacts, setContacts] = useState([]);
    const [finalizedTimeslot, setFinalizedTimeslot] = useState(null);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse
    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
    const auth = useAuth();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { timeZone: userTimeZone });
    };

    // const formatDateTime = (dateString) => {
    //     const date = new Date(dateString);
    //     const year = date.getFullYear();
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const day = date.getDate().toString().padStart(2, '0');
    //     const hours = date.getHours().toString().padStart(2, '0');
    //     const minutes = date.getMinutes().toString().padStart(2, '0');

    //     return `${year}-${month}-${day} ${hours}:${minutes}`;
    // };
    // This is the Old formatDateTime, Here just incase bugs arise from the above implementation

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchFinalizedTimeslot = async () => {
        try {
            // This URL is an example; adjust it as needed to match your API endpoint for fetching the finalized timeslot
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/finalization/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFinalizedTimeslot(response.data.finalized_timeslot);
        } catch (error) {
            console.error('Error fetching finalized timeslot:', error);
        }
    };

    const handleDeleteCalendar = async () => {
        try {
            await axios.delete(`${backendUrl}/calendars/${calendar.id}/`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate("/calendars"); 
        } catch (error) {
            console.error('Error deleting calendar:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
        fetchFinalizedTimeslot();
    }, [calendar.id, token]);

const createGoogleCalendarLink = (timeslot) => {
        const start = new Date(timeslot.start_date_time).toISOString();
        const end = new Date(new Date(timeslot.start_date_time).getTime() + timeslot.duration * 60000).toISOString();
        return `http://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendar.name)}&dates=${start.replace(/-|:|\.\d{3}/g, '')}/${end.replace(/-|:|\.\d{3}/g, '')}&details=${encodeURIComponent(calendar.comment || '')}&ctz=${userTimeZone}`;
    };

    const createOutlookCalendarLink = (timeslot) => {
        const start = new Date(timeslot.start_date_time).toISOString();
        const end = new Date(new Date(timeslot.start_date_time).getTime() + timeslot.duration * 60000).toISOString();
        return `http://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${encodeURIComponent(start)}&enddt=${encodeURIComponent(end)}&subject=${encodeURIComponent(calendar.name)}&body=${encodeURIComponent(calendar.comment || '')}`;
    };

    const onAddToGoogleCalendar = () => {
        if (finalizedTimeslot) {
            const googleCalendarUrl = createGoogleCalendarLink(finalizedTimeslot);
            window.open(googleCalendarUrl, '_blank');
        }
    };

    const onAddToOutlookCalendar = () => {
        if (finalizedTimeslot) {
            const outlookCalendarUrl = createOutlookCalendarLink(finalizedTimeslot);
            window.open(outlookCalendarUrl, '_blank');
        }
    };
      
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
                    <li className="nav-item"><Link className="nav-link" to="/calendars/">Calendars</Link></li>
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
        <div className="owner-container">
            <h2> Finalized Calendar: {calendar.name}</h2>
            {calendar.comment && <h5>Comment: {calendar.comment}</h5>}

            <h3>Contacts :</h3>
          <ul>
            {contacts.map(contact => (
              <li key={contact.id} className="owner-contact-item">
                {contact.username}
              </li>
            ))}
          </ul>

            {finalizedTimeslot && (
                <>
                <h3>Finalized Timeslot:</h3>
                <ul>
                <li>
                <div className="owner-timeslot-details">
                    <span>Timeslot: {formatDateTime(finalizedTimeslot.start_date_time)}, Duration: {finalizedTimeslot.duration} minutes</span>
                </div>
                </li>
                </ul>
                </>
            )}
            {finalizedTimeslot && (
                <>
                    <button onClick={onAddToGoogleCalendar} className="owner-button btn">Add to Google Calendar</button>
                    <button onClick={onAddToOutlookCalendar} className="owner-button btn">Add to Outlook Calendar</button>
                </>
            )}
            {isOwner && <button className="owner-button btn-delete" onClick={handleDeleteCalendar}>Delete Calendar</button>}
        </div>
        <footer className="footer text-center align-items-center">
            <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
        </footer>
        </>
    );
};

export default FinalView;