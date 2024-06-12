import React from 'react';
import axios from 'axios';
import './OwnerView.css';
import { useAuth } from "../../hooks/AuthProvider";
import Navbar from '../../components/Navbar';

const JustFinalizedView = ({calendar, token, contacts}) => {
    const auth = useAuth();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const notifyFinalization = async () => {
		let concatenatedContacts = "" 
		for (let i = 0; i < contacts.length; i++) {
			concatenatedContacts += contacts[i].email;
			if (i < contacts.length - 1) {
			  concatenatedContacts += ",";
			}
		}
		const link = `${backendUrl}/calendars/${calendar.id}`;
		const subject = encodeURIComponent(`Notification: Calendar ${calendar.name} has been finalized.`);
		const body = encodeURIComponent(`Click this link, for sure absolutely safe, will take you to the calendar for quick access:\n\n${link}\n\nBest,\n${auth.user.username}`);
		const mailtoLink = `mailto:${concatenatedContacts}?subject=${subject}&body=${body}`;
		window.location.href = mailtoLink;
	}

    const notifyFinalization2 = async () => {
        contacts.forEach(async (contact) => {
            try {
                await axios.post(`${backendUrl}/calendars/notifications/`, 
                    {
                        user: contact.contact,
                        calendar: calendar.id,
                        txt: `Calendar - ${calendar.name} was just finalized.`
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error(`Error sending finalization notification to ${contact.username}:`, error);
            }
        });

    	alert("Notifications sent regarding calendar finalization.");
	};

    return (
        <>
        <Navbar />

        <div className="owner-container">
            <h2 className="green-text">Congratulations! Your Calendar has been finalized. Would you like to notify the members?</h2>
            <div className="center-btn big-btn">
            <button className="owner-button" onClick={notifyFinalization2}>Notify members on Website</button>
            <button className="owner-button" onClick={notifyFinalization}>Notify members via Email</button>
            </div>
        </div>

        <footer className="footer text-center py-3">
				<p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
		</footer>
        </>
    )
}

export default JustFinalizedView;
