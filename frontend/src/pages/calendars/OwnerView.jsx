import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './OwnerView.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/AuthProvider";
import JustFinalizedView from './JustFinalizedView';
import Navbar from '../../components/Navbar';
import CalendarView from '../../components/CalendarView'; // Import the CalendarView component
import moment from 'moment';

const OwnerView = ({ calendar, token, isOwner }) => {
    const [timeslotError, setTimeslotError] = useState(null);
    const navigate = useNavigate();
    const [editingTimeslotId, setEditingTimeslotId] = useState(null);
    const [editingTimeslot, setEditingTimeslot] = useState({});
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [contacts, setContacts] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [contactUsername, setContactUsername] = useState('');
    const [possibleContacts, setPossibleContacts] = useState([]);
    const [failMessage, setFailMessage] = useState('');
    const [suggestedTimeslots, setSuggestedTimeslots] = useState([]);
    const [suggested, setSuggested] = useState(false);
    const auth = useAuth();
    const [isFinalized, setIsFinalized] = useState(false);


    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const pad = (num) => (num < 10 ? '0' + num : num);
        const localDateTime = date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + 'T' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes());
        return localDateTime;
    };

    const fetchContacts = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/`,
                { headers: { Authorization: `Bearer ${token}` } });
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }, [backendUrl, calendar.id, token]);

    const fetchTimeslots = useCallback(async () => {
        try {
            const timeslotsResponse = await axios.get(`${backendUrl}/calendars/${calendar.id}/timeslots/`, { headers: { Authorization: `Bearer ${token}` } });
            
            const fetchedTimeslots = Array.isArray(timeslotsResponse.data) ? timeslotsResponse.data : [];
            
            const votesResponse = fetchedTimeslots.length > 0
                ? await axios.get(`${backendUrl}/calendars/${calendar.id}/timeslot-votes/`, { headers: { Authorization: `Bearer ${token}` } })
                : { data: [] };
            
            const timeslotsWithVotes = fetchedTimeslots.map(timeslot => {
                const votesForTimeslot = votesResponse.data.find(voteEntry => voteEntry.timeslot_id === timeslot.id)?.votes || [];
                return { ...timeslot, votes: votesForTimeslot };
            });
    
            setTimeslots(timeslotsWithVotes);
        } catch (error) {
            console.error('Error fetching timeslots:', error);
            setTimeslotError(error); 
            setTimeslots([]); 
        }
    }, [backendUrl, calendar.id, token]);

    const fetchPossibleContacts = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/detail/`, 
            { headers: { Authorization: `Bearer ${token}` } });
            setPossibleContacts(response.data);
            if (response.data.length > 0) {
                setContactUsername(response.data[0].username);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }, [backendUrl, calendar.id, token]);

    useEffect(() => {
        fetchPossibleContacts();
        fetchContacts();
        fetchTimeslots();
    }, [fetchContacts, fetchPossibleContacts, fetchTimeslots]);

    const handleFinalizeClick = async (timeslot) => {
        try {
            await axios.post(`${backendUrl}/calendars/${calendar.id}/finalization/`, 
                {   timeslot_id : timeslot.timeslot_id},
                {   headers: { Authorization: `Bearer ${token}` } });
            setIsFinalized(true);
        } catch (error) {
            console.error('Error finalizing calendar:', error);
        }
    }

    const handleSuggestCalendar = async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/suggestions/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.data && response.data.timeslots) {
                setSuggested(true);
                setSuggestedTimeslots(response.data.timeslots);
            } else {
                setSuggested(false);
                handleFailMessage();
            }
        } catch (error) {
            console.error('Error suggesting calendar:', error.response ? error.response.data : error.message);
            setSuggested(false);
            handleFailMessage();
        }
    }

    const handleFailMessage = () => {
        if (suggested) {
            return;
        }
        if (contacts.length === 0) {
            setFailMessage("Please add at least one contact.");
        } else if (calendar.status === "created") {
            setFailMessage("Not all contacts have submitted their preferences yet.");
        } else {
            setFailMessage("No timeslot meets all contacts' availabilities. Please add new timeslots or update existing timeslots to meet their requirements.");
        }
    }

    const handleAddContact = async () => {
        try {
            await axios.post(`${backendUrl}/calendars/${calendar.id}/contacts/detail/`,
                { contact_username: contactUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setContactUsername('');
            await fetchContacts();
            await fetchPossibleContacts();
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await axios.delete(`${backendUrl}/calendars/${calendar.id}/contacts/${contactId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchContacts();
            await fetchPossibleContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const handleAddTimeslot = async (timeslot) => {
        const formattedTimeslot = {
            start_date_time: timeslot.start.toISOString(), 
            duration: moment(timeslot.end).diff(moment(timeslot.start), 'minutes'),
            comment: timeslot.title,
            preference: 1, // Default preference
        };
    
        try {
            const response = await axios.post(`${backendUrl}/calendars/${calendar.id}/timeslots/`, 
                formattedTimeslot, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTimeslots([...timeslots, response.data]);
        } catch (error) {
            console.error('Error adding timeslot:', error.response ? error.response.data : error);
        }
    };

    const handleDeleteCalendar = async () => {
        try {
            await axios.delete(`${backendUrl}/calendars/${calendar.id}/`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate("/calendars/"); 
        } catch (error) {
            console.error('Error deleting calendar:', error);
        }
    };

    const handleEditClick = (timeslot) => {
        setEditingTimeslotId(timeslot.id);
        setEditingTimeslot({
            startDateTime: formatDateTime(timeslot.start_date_time),
            duration: timeslot.duration.toString(),
            comment: timeslot.comment,
            preference: timeslot.preference.toString(),
        });
    };       

    const handleEditChange = (e) => {
        setEditingTimeslot({ ...editingTimeslot, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        setEditingTimeslotId(null);
        setEditingTimeslot({});
    };

    const notifyContacts = async () => {
        let concatenatedContacts = ""; 
        const unsubmittedContacts = contacts.filter(contact => contact.has_submitted === false);
        for (let i = 0; i < unsubmittedContacts.length; i++) {
            concatenatedContacts += unsubmittedContacts[i].email;
            if (i < unsubmittedContacts.length - 1) {
                concatenatedContacts += ",";
            }
        }
        const link = `${backendUrl}/calendars/${calendar.id}`;
        const subject = encodeURIComponent(`Reminder: Calendar ${calendar.name} requires your preference input.`);
        const body = encodeURIComponent(`Click this link, for sure absolutely safe, will take you to the calendar for quick access:\n\n${link}\n\nBest,\n${auth.user.username}`);
        
        const mailtoLink = `mailto:${concatenatedContacts}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
    };

    const handleSaveEdit = async () => {
        const formattedTimeslot = {
            start_date_time: new Date(editingTimeslot.startDateTime).toISOString(),
            duration: parseInt(editingTimeslot.duration),
            comment: editingTimeslot.comment,
            preference: parseInt(editingTimeslot.preference),
        };
    
        try {
            const response = await axios.put(
                `${backendUrl}/calendars/timeslots/${editingTimeslotId}/`,
                formattedTimeslot,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                setTimeslots(timeslots.map((t) =>
                    t.id === editingTimeslotId ? response.data : t
                ));
                setEditingTimeslotId(null);
                setEditingTimeslot({});
            }
        } catch (error) {
            console.error('Error saving timeslot:', error.response ? error.response.data : error);
        }
    };    

    const handleDeleteTimeslot = async (timeslotId) => {
        try {
            await axios.delete(`${backendUrl}/calendars/timeslots/${timeslotId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTimeslots(timeslots.filter(t => t.id !== timeslotId));
            await fetchContacts();
        } catch (error) {
            console.error('Error deleting timeslot:', error.response ? error.response.data : error);
        }
    };

    const sendPreferenceReminder = async () => {
        const unsubmittedContacts = contacts.filter(contact => !contact.has_submitted);
        for (const contact of unsubmittedContacts) {
            try {
                await axios.post(`${backendUrl}/calendars/notifications/`, 
                    {
                        user: contact.contact,
                        calendar: calendar.id,
                        txt: `Reminder: Calendar - ${calendar.name} requires your preference input.`
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error(`Error sending reminder to contact ${contact.contact}:`, error);
            }
        }
        alert(`${unsubmittedContacts.length} reminder(s) sent.`);
    };

    const convertTimeslotsToEvents = () => {
        return timeslots.map(timeslot => ({
            start: new Date(timeslot.start_date_time),
            end: new Date(new Date(timeslot.start_date_time).getTime() + timeslot.duration * 60000),
            title: timeslot.comment || 'No Title',
        }));
    };

    return (
        <>
        {isFinalized ? (
            <JustFinalizedView calendar={calendar} token={token} isOwner={isOwner} contacts={contacts} user={auth.user}/>
        ) : (
            <>
                <Navbar activePage='calendars'/>
                <div className="container owner-container">
                    <h2>{calendar.name}</h2>
                    {calendar.comment !== "" && <h5>Comment: {calendar.comment}</h5>}
      
                    <div className="owner-contact-form">
                        <select
                            className="owner-input"
                            value={contactUsername}
                            onChange={(e) => setContactUsername(e.target.value)}
                        >
                            {possibleContacts.map((contact) => (
                                <option key={contact.username} value={contact.username}>
                                    {contact.username}
                                </option>
                            ))}
                        </select>
                        <button className="owner-button" onClick={handleAddContact}>Add Contact</button>
                    </div>
                    {calendar.status === "created" && (
                        <button 
                            className="owner-button green-btn" 
                            onClick={notifyContacts}
                            disabled={contacts.filter(contact => !contact.has_submitted).length === 0}>
                            Remind Contacts by Email
                        </button>
                    )}

                    {calendar.status === "created" && (
                        <button 
                            className="owner-button green-btn" 
                            onClick={sendPreferenceReminder}
                            disabled={contacts.filter(contact => !contact.has_submitted).length === 0}>
                            Send notification to Contact
                        </button>
                    )}
                    <h3>Contacts List:</h3>
                    <ul>
                        {contacts.length > 0 ? (
                            contacts.map(contact => (
                                <li key={contact.id} className="owner-contact-item">
                                    {contact.username} - {contact.has_submitted ? 'Submitted' : 'Not Submitted'}
                                    <button className="owner-button btn-delete" onClick={() => handleDeleteContact(contact.contact)}>Delete</button>
                                </li>
                            ))
                        ) : (
                            <li>No contacts added</li>
                        )}
                    </ul>
      
                    <div className="owner-timeslot-form">
                        <CalendarView events={convertTimeslotsToEvents()} onSelectSlot={handleAddTimeslot} allowEventCreation={true} />
                    </div>
      
                    <h3>Timeslots:</h3>
                    {timeslotError && <p>Error loading timeslots: {timeslotError.message}</p>}
                    <ul>
                        {timeslots.map(timeslot => (
                            <li key={timeslot.id}>
                                {editingTimeslotId === timeslot.id ? (
                                    <div>
                                        <input 
                                            type="datetime-local" 
                                            name="startDateTime"
                                            value={editingTimeslot.startDateTime}
                                            onChange={handleEditChange}
                                        />
                                        <input 
                                            type="number" 
                                            name="duration"
                                            value={editingTimeslot.duration}
                                            onChange={handleEditChange}
                                        />
                                        <input 
                                            type="text" 
                                            name="comment"
                                            value={editingTimeslot.comment}
                                            onChange={handleEditChange}
                                        />
                                        <select 
                                            name="preference"
                                            value={editingTimeslot.preference}
                                            onChange={handleEditChange}
                                        >
                                            <option value="1">Low Preference</option>
                                            <option value="2">Medium Preference</option>
                                            <option value="3">High Preference</option>
                                        </select>
                                        <button onClick={handleSaveEdit}>Save</button>
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                ) : (
                                    <div className="owner-timeslot-details">
                                        <span>Timeslot: {formatDateTime(timeslot.start_date_time)}, Duration: {timeslot.duration} minutes,</span>
                                        <span> Comment: {timeslot.comment || 'None'},</span>
                                        <span> Preference: {
                                            { '1': 'Low', '2': 'Medium', '3': 'High' }[timeslot.preference] || 'Not Set'
                                        }</span>
                                        <div className="owner-timeslot-controls">
                                            <button onClick={() => handleEditClick(timeslot)}>Edit</button>
                                            <button className="owner-button btn-delete" onClick={() => handleDeleteTimeslot(timeslot.id)}>Delete</button>
                                            <label htmlFor={`timeslot-vote-dropdown-${timeslot.id}`}>Votes: </label>
                                            <select id={`timeslot-vote-dropdown-${timeslot.id}`}>
                                                {Array.isArray(timeslot.votes) && timeslot.votes.map((vote, index) => (
                                                    <option key={index} value={vote.contact}>
                                                        {vote.contact} - {vote.preference}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    {calendar.status === "submitted" && (
                        <button className="owner-button green-btn" onClick={handleSuggestCalendar}>Suggest Calendar</button>
                    )}
            
                    {suggested && (
                        <>
                            <h3>Suggested Timeslots:</h3>
                            <ul>
                                {suggestedTimeslots.map((timeslot) => (
                                    <li key={timeslot.id}>
                                        <div className="owner-timeslot-details">
                                            <span>Timeslot: {formatDateTime(timeslot.start_date_time)}, Duration: {timeslot.duration} minutes,</span>
                                            <span> Comment: {timeslot.comment || 'None'},</span>
                                            <span> Preference: {
                                                { '1': 'Low', '2': 'Medium', '3': 'High' }[timeslot.preference] || 'Not Set'
                                            },</span>
                                            <span>
                                                Total Preference: {[timeslot.total_preference] || 0}
                                            </span>
                                            <div className="owner-timeslot-controls">
                                                <button onClick={() => handleFinalizeClick(timeslot)}>Finalize</button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {!suggested && (
                        <div>
                            <span>{failMessage}</span>
                        </div>
                    )}
                    <button className="owner-button btn-delete" onClick={handleDeleteCalendar}>Delete Calendar</button>
                </div>
                <footer className="footer text-center py-3">
                    <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
                </footer>
            </>
        )}
        </>
    );
};

export default OwnerView;
