import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OwnerView.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";
import JustFinalizedView from './JustFinalizedView';


const OwnerView = ({ calendar, token, isOwner }) => {
    const [loadingTimeslots, setLoadingTimeslots] = useState(true);
    const [timeslotError, setTimeslotError] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [editingTimeslotId, setEditingTimeslotId] = useState(null);
    const [editingTimeslot, setEditingTimeslot] = useState({});
    const backendUrl = 'http://localhost:8000';
    const [contacts, setContacts] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [contactUsername, setContactUsername] = useState('');
    const [possibleContacts, setPossibleContacts] = useState([]);
    // const [isSubmitted, setIsSubmitted] = useState(false);
    // const [contactUsername, setContactUsername] = useState('');
    const [failMessage, setFailMessage] = useState('');
    const [suggestedTimeslots, setSuggestedTimeslots] = useState([]);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse
    const [suggested, setSuggested] = useState(false);
    const auth = useAuth();
    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
	const [isFinalized, setIsFinalized] = useState(false);
    const [newTimeslot, setNewTimeslot] = useState({
        startDateTime: '',
        duration: 30,
        comment: '',
        preference: 1
    });

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/`,
                { headers: { Authorization: `Bearer ${token}` } });
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const [visibleVotesTimeslotId, setVisibleVotesTimeslotId] = useState(null);

    const toggleVotesDisplay = (timeslotId) => {
        if (visibleVotesTimeslotId === timeslotId) {
            setVisibleVotesTimeslotId(null);
        } else {
            setVisibleVotesTimeslotId(timeslotId);
        }
    };


    const fetchTimeslots = async () => {
        setIsLoading(true);
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
            setError(null); 
        } catch (error) {
            console.error('Error fetching timeslots:', error);
            setTimeslotError(error); 
            setTimeslots([]); 
        }
        setIsLoading(false);
    };
    
    

    const fetchPossibleContacts = async () => {
        try {
          const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/detail/`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPossibleContacts(response.data);
          if (response.data.length > 0) {
            setContactUsername(response.data[0].username);
          }
        } catch (error) {
          console.error('Error fetching contacts:', error);
        }
    };


    useEffect(() => {
        fetchPossibleContacts();
        fetchContacts();
        fetchTimeslots();
    }, [calendar.id, token]);

    const handleFinalizeClick = async (timeslot) => {
        try {
            const response = await axios.post(`${backendUrl}/calendars/${calendar.id}/finalization/`, 
                {   timeslot_id : timeslot.timeslot_id},
                {   headers: { Authorization: `Bearer ${token}` } });
            // navigate("/calendars/");
			setIsFinalized(true);
        } catch (error) {
            console.error('Error finalizing calendar:', error)
        }
    }

    const handleSuggestCalendar = async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/suggestions/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // Check response data for suggestions or messages
            if (response.data && response.data.timeslots) {
                // Process suggested timeslots
                // console.log('Suggested timeslots:', response.data.timeslots);
                setSuggested(true)
                setSuggestedTimeslots(response.data.timeslots)
                // You might want to update state here or show the suggestions to the user in some way
            } else {
                // Handle cases with no suggestions but with a message (e.g., calendar not submitted, already finalized)
                setSuggested(false)
                handleFailMessage()
            }
        } catch (error) {
            console.error('Error suggesting calendar:', error.response ? error.response.data : error.message);
            setSuggested(false); // Ensure suggested is set to false on error
            handleFailMessage()
        }
    }

    const handleFailMessage = async () => {
        if (suggested) {
            return
        }
        // check if no contacts
        if (contacts.length === 0) {
            setFailMessage("Please add at least one contact.")
        }
        // not submitted
        else if (calendar.status === "created") {
            setFailMessage("Not all contacts have submitted their preferences yet.")
        }
        // other fail
        else {
            setFailMessage("No timeslot meets all contacts' availabilities. Please add new timeslots or update existing timeslots to meet their requirements.")
        }

    }

    const handleAddContact = async () => {
        try {
            const response = await axios.post(`${backendUrl}/calendars/${calendar.id}/contacts/detail/`,
                { contact_username: contactUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setContactUsername('');
            await fetchContacts(); // Re-fetch contacts
            await fetchPossibleContacts(); // If you want to update possible contacts list as well
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await axios.delete(`${backendUrl}/calendars/${calendar.id}/contacts/${contactId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchContacts(); // Re-fetch contacts
            await fetchPossibleContacts(); // If you want to update possible contacts list as well
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };


    const handleAddTimeslot = async () => {
        if (!newTimeslot.startDateTime) {
            console.error("Start date and time must be provided");
            return;
        }
    
        const formattedTimeslot = {
            start_date_time: newTimeslot.startDateTime, 
            duration: parseInt(newTimeslot.duration),
            comment: newTimeslot.comment,
            preference: parseInt(newTimeslot.preference), 
        };
    
        try {
            const response = await axios.post(`${backendUrl}/calendars/${calendar.id}/timeslots/`, 
                formattedTimeslot, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewTimeslot({ startDateTime: '', duration: 30, comment: '', preference: '1' }); 
            setTimeslots([...timeslots, response.data]); 
            await fetchContacts(); // Re-fetch contacts
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
            startDateTime: timeslot.start_date_time,
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

    const toLocalDateTime = (isoString) => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().split('.')[0].slice(0, -3);
    };
      
	const notifyContacts = async () => {
		let concatenatedContacts = "" 
		const unsubmittedContacts = contacts.filter(contact => contact.has_submitted === false);
		for (let i = 0; i < unsubmittedContacts.length; i++) {
			concatenatedContacts += unsubmittedContacts[i].email;
			if (i < unsubmittedContacts.length - 1) {
			  concatenatedContacts += ",";
			}
		}
		// `http://localhost:3000/calendars/${calendar.id}`
		const link = `http://localhost:3000/calendars/${calendar.id}`;
		const subject = encodeURIComponent(`Reminder: Calendar ${calendar.name} requires your preference input.`);
		const body = encodeURIComponent(`Click this link, for sure absolutely safe, will take you to the calendar for quick access:\n\n${link}\n\nBest,\n${auth.user.username}`);
		
		// Directly navigating to the mailto link including the concatenated contacts, subject, and body
		const mailtoLink = `mailto:${concatenatedContacts}?subject=${subject}&body=${body}`;
		window.location.href = mailtoLink;
	}
	
    const handleSaveEdit = async () => {
        const formattedTimeslot = {
            start_date_time: toLocalDateTime(editingTimeslot.startDateTime),
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
            await fetchContacts(); // Re-fetch contacts
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
    }
    

    

    return (
        <>
		{isFinalized ? (
            <JustFinalizedView calendar={calendar} token={token} isOwner={isOwner} contacts={contacts} user={auth.user}/>
        ) : (<>
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
          <h2>Calendar: {calendar.name}</h2>
          {/* if calendar.comment !== "": */}
          {calendar.comment !== "" && <h5>Comment: {calendar.comment}</h5>}
      
          {/* Contact management section */}
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
            <ul>
            <li>
            <h3>Contacts List:</h3>
            {calendar.status === "created" && <button 
				className="owner-button green-btn" 
				onClick={notifyContacts}
				disabled={contacts.filter(contact => !contact.has_submitted).length === 0}>
				Remind Contacts by Email
			</button>}

            {calendar.status === "created" && <button 
				className="owner-button green-btn" 
				onClick={sendPreferenceReminder}
				disabled={contacts.filter(contact => !contact.has_submitted).length === 0}>
				Send notification to Contact
			</button>}
            
            </li>
            </ul>
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

      
          {/* Timeslot management section */}
          <div className="owner-timeslot-form">
            <div className="input-group">
                <label for="start-date" className="form-label">Start Date and Time</label>
                <input
                className="owner-input"
                type="datetime-local"
                value={newTimeslot.startDateTime}
                onChange={(e) => setNewTimeslot({ ...newTimeslot, startDateTime: e.target.value })}
                placeholder="Start Date and Time"
                id="start-date"
                />
            </div>
            <div className="input-group">
                <label for="duration" className="form-label">Duration (minutes)</label>
                <input
                className="owner-input"
                type="number"
                value={newTimeslot.duration}
                onChange={(e) => setNewTimeslot({ ...newTimeslot, duration: e.target.value })}
                placeholder="Duration (minutes)"
                id="duration"
                />
            </div>
            <div className="input-group">
                <label for="description" className="form-label">Description</label>
            <input
              className="owner-input"
              type="text"
              value={newTimeslot.comment}
              onChange={(e) => setNewTimeslot({ ...newTimeslot, comment: e.target.value })}
              placeholder="Description (Optional)"
              id = "description"
            />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label for="preference" className="form-label">Preference</label>
                <select
                className="owner-select"
                value={newTimeslot.preference}
                onChange={(e) => setNewTimeslot({ ...newTimeslot, preference: e.target.value })}
                id = "preference"
                >
                <option value="1">Low Preference</option>
                <option value="2">Medium Preference</option>
                <option value="3">High Preference</option>
                </select>
            </div>

            <button className="owner-button" style={{gridColumn: 'span 2'}} onClick={handleAddTimeslot}>Add Timeslot</button>
          </div>
      
          <h3>Timeslots:</h3>
          {loadingTimeslots}
            {timeslotError && <p>Error loading timeslots: {timeslotError.message}</p>}
            <ul>
                {timeslots.map(timeslot => (
                    <li key={timeslot.id}>
                        {editingTimeslotId === timeslot.id ? (
                            <div>
                                {/* Inputs to edit timeslot details */}
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
            {/* {calendar.comment !== "" && <h2>Comment: {calendar.comment}</h2>} */}
            {calendar.status === "submitted" && <button className="owner-button green-btn" onClick={handleSuggestCalendar}>Suggest Calendar</button>}
            
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
                                            Total Preference : {[timeslot.total_preference] || 0}
                                        </span>
                                        {/* Since these are suggestions, you might not need edit/delete buttons here */}
                                        <div className="owner-timeslot-controls">
                                            <button onClick={() => handleFinalizeClick(timeslot)}>Finalize</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                {/* {handleFailMessage()} */}
                {!suggested && (
                <>
                <div>
                <span>{failMessage}</span>
                </div>
                </>
                )}
                <button className="owner-button btn-delete" onClick={handleDeleteCalendar}>Delete Calendar</button>
            </div>
            <footer className="footer text-center py-3">
				<p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
			</footer>
			</>)}
        </>
      );
      
};

export default OwnerView;

// <a href="mailto:rubin.rastogi@mail.utoronto.ca,inan.sanon@mail.utoronto.ca?subject=More%20info...&body=I%20was%20on%20your%20website%20and%20would%20like%20to%20learn%20more%20about:%0D%0A%0D%0A" className="email_address">rubin.rastogi@mail.utoronto.ca</a>