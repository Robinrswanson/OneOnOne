import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ContactView.css';
import { useAuth } from "../../hooks/AuthProvider";
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const ContactView = ({ calendar, token, isOwner }) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [contacts, setContacts] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const auth = useAuth();
    const [editingTimeslots, setEditingTimeslots] = useState({});
    const [updateEditingTimeslots, setUpdateEditingTimeslots] = useState({});
    const [otherTimeslots, setOtherTimeslots] = useState([]);
    const [votesData, setVotesData] = useState([]);

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

    const fetchTimeslots = useCallback(async () => {
        try {
            const response1 = await axios.get(`${backendUrl}/calendars/${calendar.id}/timeslots/`,
                { headers: { Authorization: `Bearer ${token}` } });

            const response2 = await axios.get(`${backendUrl}/calendars/${calendar.id}/timeslot-votes/`,
                { headers: { Authorization: `Bearer ${token}` } });

            const username = auth.user.username;

            const filteredTimeslots = response1.data.filter(timeslot => {
                const voteForTimeslot = response2.data.find(voteData => voteData.timeslot_id === timeslot.id);
                return !voteForTimeslot || !voteForTimeslot.votes.some(vote => vote.contact === username);
            });

            const timeslotsVotedOn = response1.data.filter(timeslot => {
                const voteForTimeslot = response2.data.find(voteData => voteData.timeslot_id === timeslot.id);
                return voteForTimeslot && voteForTimeslot.votes.some(vote => vote.contact === username);
            });

            setVotesData(response2.data);
            setTimeslots(filteredTimeslots);
            setOtherTimeslots(timeslotsVotedOn);
            setEditingTimeslots({});
            setUpdateEditingTimeslots({});
        } catch (error) {
            console.error('Error fetching timeslots:', error);
        }
    }, [backendUrl, calendar.id, token, auth.user.username]);

    useEffect(() => {
        if (calendar && token) {
            fetchContacts();
            fetchTimeslots();
        }
    }, [calendar, token, fetchContacts, fetchTimeslots]);

    if (!calendar) return <p>Loading...</p>;

    const getUserPreferenceForTimeslot = (timeslotId) => {
        const username = auth.user.username;
        const voteForTimeslot = votesData.find(voteData => voteData.timeslot_id === timeslotId);
        const userVote = voteForTimeslot?.votes.find(vote => vote.contact === username);
        return userVote ? { '0': 'Not Available', '1': 'Low', '2': 'Medium', '3': 'High' }[userVote.preference] || 'Not Set' : 'Not Set';
    };

    const handleEditChange = (timeslotId, e) => {
        setEditingTimeslots({ ...editingTimeslots, [timeslotId]: { ...editingTimeslots[timeslotId], [e.target.name]: e.target.value } });
    };

    const handleUpdateEditChange = (timeslotId, e) => {
        setUpdateEditingTimeslots({ ...updateEditingTimeslots, [timeslotId]: { ...updateEditingTimeslots[timeslotId], [e.target.name]: e.target.value } });
    };

    const handleSaveEdit = async (timeslotId) => {
        const preference = parseInt(editingTimeslots[timeslotId]?.preference || "0");

        try {
            const response = await axios.post(
                `${backendUrl}/calendars/${calendar.id}/vote/`,
                { timeslot: timeslotId, preference: preference },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (response.status === 200) {
                setEditingTimeslots({ ...editingTimeslots, [timeslotId]: {} });
            }
            await fetchTimeslots();
        } catch (error) {
            console.error('Error saving timeslot:', error.response ? error.response.data : error);
        }
    };

    const handleUpdateSaveEdit = async (timeslotId) => {
        const preference = parseInt(updateEditingTimeslots[timeslotId]?.preference || "0");

        try {
            const response = await axios.put(
                `${backendUrl}/calendars/${calendar.id}/vote/`,
                { timeslot: timeslotId, preference: preference },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (response.status === 200) {
                setUpdateEditingTimeslots({ ...updateEditingTimeslots, [timeslotId]: {} });
            }
            await fetchTimeslots();
        } catch (error) {
            console.error('Error saving timeslot:', error.response ? error.response.data : error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container owner-container">
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
                                            value={editingTimeslots[timeslot.id]?.preference || "0"}
                                            onChange={(e) => handleEditChange(timeslot.id, e)}
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
                                            value={updateEditingTimeslots[timeslot.id]?.preference || "0"}
                                            onChange={(e) => handleUpdateEditChange(timeslot.id, e)}
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
