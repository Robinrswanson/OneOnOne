import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import './ContactView.css';
import { useAuth } from "../../hooks/AuthProvider";

const ContactView = ({ calendar, token, isOwner }) => {
    const backendUrl = 'http://localhost:8000'; 
    const [contacts, setContacts] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const auth = useAuth();
    const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse
    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
    const [editingTimeslotId, setEditingTimeslotId] = useState(null);
    const [updateEditingTimeslotId, setUpdateEditingTimeslotId] = useState(null);
    const [editingTimeslot, setEditingTimeslot] = useState({});
    const [updateEditingTimeslot, setUpdateEditingTimeslot] = useState({});
    const [otherTimeslots, setOtherTimeslots] = useState([]);
    const [votesData, setVotesData] = useState([]);



    useEffect(() => {
        if (calendar && token) {    
            fetchContacts();
            fetchTimeslots();
        }
    }, [calendar, token]);


    if (!calendar) return <p>Loading...</p>;

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
            const response = await axios.get(`${backendUrl}/calendars/${calendar.id}/contacts/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchTimeslots = async () => {
        try {
            const response1 = await axios.get(`${backendUrl}/calendars/${calendar.id}/timeslots/`,
                { headers: { Authorization: `Bearer ${token}` } });

            const response2 = await axios.get(`${backendUrl}/calendars/${calendar.id}/timeslot-votes/`,
                { headers: { Authorization: `Bearer ${token}` } });

            const username = auth.user.username;
            
            const filteredTimeslots = response1.data.filter(timeslot => {
                // Find the vote data for the current timeslot
                const voteForTimeslot = response2.data.find(voteData => voteData.timeslot_id === timeslot.id);
                
                // If there's no vote data for this timeslot, or if the current user's username is not found in the votes, include the timeslot
                return !voteForTimeslot || !voteForTimeslot.votes.some(vote => vote.contact === username);
            });

            const timeslotsVotedOn = response1.data.filter(timeslot => {
                const voteForTimeslot = response2.data.find(voteData => voteData.timeslot_id === timeslot.id);
                return voteForTimeslot && voteForTimeslot.votes.some(vote => vote.contact === username);
            });
            setVotesData(response2.data);
            setTimeslots(filteredTimeslots);
            setOtherTimeslots(timeslotsVotedOn);
            setEditingTimeslot({preference: "0"})
            setUpdateEditingTimeslot({preference: "0"})
        } catch (error) {
            console.error('Error fetching timeslots:', error);
        }
    };
    
    const getUserPreferenceForTimeslot = (timeslotId) => {
        // Find the corresponding vote for the timeslot
        const username = auth.user.username
        const voteForTimeslot = votesData.find(voteData => voteData.timeslot_id === timeslotId);
        // If there's a vote and it contains the current user's vote, return it
        const userVote = voteForTimeslot?.votes.find(vote => vote.contact === username);
        if (userVote) {
            // Map the preference number to a readable format, similar to owner's preference mapping
            return { '0': 'Not Available', '1': 'Low', '2': 'Medium', '3': 'High' }[userVote.preference] || 'Not Set';
        }
        // If the user hasn't voted on this timeslot, return a default message
        return 'Not Set';
    };

    const handleEditChange = (e) => {
        setEditingTimeslot({ ...editingTimeslot, [e.target.name]: e.target.value });
    };

    const handleUpdateEditChange = (e) => {
        setUpdateEditingTimeslot({ ...updateEditingTimeslot, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async (timeslot_id) => {
        console.log(editingTimeslot.preference + " " + typeof editingTimeslot)
        const preference = parseInt(editingTimeslot.preference)
        console.log(preference + " " + typeof preference)
    
        try {
            const response = await axios.post(
                `${backendUrl}/calendars/${calendar.id}/vote/`,
                { timeslot: timeslot_id, preference: preference},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (response.status === 200) {
                setEditingTimeslotId(null);
                setEditingTimeslot({});
            }
            await fetchTimeslots();
        } catch (error) {
            console.error('Error saving timeslot:', error.response ? error.response.data : error);
        }
    };

    const handleUpdateSaveEdit = async (timeslot_id) => {
        console.log(updateEditingTimeslot.preference + " " + typeof updateEditingTimeslot)
        const preference = parseInt(updateEditingTimeslot.preference)
        console.log(preference + " " + typeof preference)
    
        try {
            const response = await axios.put(
                `${backendUrl}/calendars/${calendar.id}/vote/`,
                { timeslot: timeslot_id, preference: preference},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (response.status === 200) {
                setUpdateEditingTimeslotId(null);
                setUpdateEditingTimeslot({});
            }
            await fetchTimeslots();
        } catch (error) {
            console.error('Error saving timeslot:', error.response ? error.response.data : error);
        }
    };
    

    // const handleVoteClick

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
            <h2>Calendar: {calendar.name}</h2>
            {calendar.comment && <h5>Comment: {calendar.comment}</h5>}
            <h3>Owner: {calendar.owner_username}</h3>
            {/* List of Contacts */}
            <h3>Contacts List:</h3>
            <ul>
                {contacts.map(contact => (
                    <li key={contact.id} className="owner-contact-item">
                        {contact.username} - {contact.has_submitted ? 'Submitted' : 'Not Submitted'}
                    </li>
                ))}
            </ul>

            {/* Timeslot Preferences Submission */}
            <div>
                <h3>Submit Timeslot Preferences:</h3>
                <ul>
                {timeslots.map(timeslot => (
                    <li key={timeslot.id}>
                        <div className="owner-timeslot-details">
                                <span>Timeslot: {formatDateTime(timeslot.start_date_time)}, Duration: {timeslot.duration} minutes,</span>
                                <span> Comment: {timeslot.comment || 'None'},</span>
                                <span> Owner Preference: {
                                    { '1': 'Low', '2': 'Medium', '3': 'High' }[timeslot.preference] || 'Not Set'
                                }</span>
                                <div className="owner-timeslot-controls">
                                <select 
                                    name="preference"
                                    value={editingTimeslot.preference || "0"}
                                    onChange={handleEditChange}
                                >
                                    <option value="0">Not Available</option>
                                    <option value="1">Low Preference</option>
                                    <option value="2">Medium Preference</option>
                                    <option value="3">High Preference</option>
                                </select>
                                <button className="green-btn" onClick={() => handleSaveEdit(timeslot.id)}>Vote</button>
                                </div>
                            </div>
                    </li>
                    
                ))}
                </ul>
            </div>
            <div>
                <h3>Update Timeslot Preferences:</h3>
                <ul>
                {otherTimeslots.map(timeslot => (
                    <li key={timeslot.id}>
                        <div className="owner-timeslot-details">
                                <span>Timeslot: {formatDateTime(timeslot.start_date_time)}, Duration: {timeslot.duration} minutes,</span>
                                <span> Comment: {timeslot.comment || 'None'},</span>
                                <span> Owner Preference: {
                                    { '1': 'Low', '2': 'Medium', '3': 'High' }[timeslot.preference] || 'Not Set'
                                }</span>
                                <span> Your Preference: {getUserPreferenceForTimeslot(timeslot.id)} </span>
                                <div className="owner-timeslot-controls">
                                <select 
                                    name="preference"
                                    value={updateEditingTimeslot.preference || "0"}
                                    onChange={handleUpdateEditChange}
                                >
                                    <option value="0">Not Available</option>
                                    <option value="1">Low Preference</option>
                                    <option value="2">Medium Preference</option>
                                    <option value="3">High Preference</option>
                                </select>
                                <button className="green-btn" onClick={() => handleUpdateSaveEdit(timeslot.id)}>Update</button>
                                </div>
                            </div>
                    </li>
                    
                ))}
                </ul>
            </div>

        </div>
        <footer className="footer text-center align-items-center">
            <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
        </footer>
        </>
    );
};

export default ContactView;
