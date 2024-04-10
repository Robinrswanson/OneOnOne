import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OwnerView.css';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";

const JustFinalizedView = ({calendar, token, isOwner, contacts, user}) => {
    const navigate = useNavigate();
    const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse
    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
    const auth = useAuth();
    const backendUrl = 'http://localhost:8000';



    const notifyFinalization = async () => {
		let concatenatedContacts = "" 
		for (let i = 0; i < contacts.length; i++) {
			concatenatedContacts += contacts[i].email;
			if (i < contacts.length - 1) {
			  concatenatedContacts += ",";
			}
		}
		// `http://localhost:3000/calendars/${calendar.id}`
		const link = `http://localhost:3000/calendars/${calendar.id}`;
		const subject = encodeURIComponent(`Notification: Calendar ${calendar.name} has been finalized.`);
		const body = encodeURIComponent(`Click this link, for sure absolutely safe, will take you to the calendar for quick access:\n\n${link}\n\nBest,\n${auth.user.username}`);
		
		// Directly navigating to the mailto link including the concatenated contacts, subject, and body
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