import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './FinalView.css';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import CalendarView from '../../components/CalendarView'; // Import the CalendarView component

const FinalView = ({ calendar, token, isOwner }) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [contacts, setContacts] = useState([]);
    const [finalizedTimeslot, setFinalizedTimeslot] = useState(null); // State for finalized timeslot

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { timeZone: userTimeZone });
    };

    const fetchContacts = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }, [backendUrl, calendar.id, token]);

    const fetchFinalization = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/finalization/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const finalizedTimeslot = response.data.finalized_timeslot;

            setFinalizedTimeslot(finalizedTimeslot);
        } catch (error) {
            console.error('Error fetching finalized timeslot:', error);
        }
    }, [backendUrl, calendar.id, token]);

    useEffect(() => {
        if (calendar && token) {
            fetchContacts();
            fetchFinalization();
        }
    }, [calendar, token, fetchContacts, fetchFinalization]);

    if (!calendar) return <p>Loading...</p>;

    const convertTimeslotToEvent = (timeslot) => {
        return {
            start: new Date(timeslot.start_date_time),
            end: new Date(new Date(timeslot.start_date_time).getTime() + timeslot.duration * 60000),
            title: timeslot.comment || 'No Title',
        };
    };

    return (
        <>
            <Navbar activePage='calendars'/>
            <div className="container owner-container">
                <h2>Calendar: {calendar.name}</h2>
                {calendar.comment && <h5>Comment: {calendar.comment}</h5>}
                <h3>Owner: {calendar.owner_username}</h3>
                {/* List of Contacts */}
                <h3>Contacts List:</h3>
                <ul>
                    {contacts.map(contact => (
                        <li key={contact.id} className="owner-contact-item">
                            {contact.username}
                        </li>
                    ))}
                </ul>

                <div className="owner-timeslot-form">
                    {finalizedTimeslot ? (
                        <CalendarView events={[convertTimeslotToEvent(finalizedTimeslot)]} allowEventCreation={false} />
                    ) : (
                        <p>No finalized timeslot available.</p>
                    )}
                </div>

                {/* Finalized Timeslot */}
                {finalizedTimeslot && (
                    <div>
                        <h3>Finalized Timeslot:</h3>
                        <div className="owner-timeslot-details">
                            <span>Timeslot: {formatDateTime(finalizedTimeslot.start_date_time)}, Duration: {finalizedTimeslot.duration} minutes,</span>
                            <span> Comment: {finalizedTimeslot.comment || 'None'},</span>
                        </div>
                    </div>
                )}
            </div>
            <footer className="footer text-center align-items-center">
                <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
            </footer>
        </>
    );
};

export default FinalView;
