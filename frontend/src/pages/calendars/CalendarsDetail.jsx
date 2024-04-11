import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from "../../hooks/AuthProvider";
import OwnerView from './OwnerView'; // Update the path as necessary
import ContactView from './ContactView'; // Update the path as necessary
import FinalView from './FinalView';

const CalendarDetailPage = () => {
    const { token, user } = useAuth();
    const { calendarId } = useParams();
    const backendUrl = 'http://3.95.237.137';

    const [calendar, setCalendar] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isContact, setIsContact] = useState(false);
    const [error, setError] = useState('');
    const [isFinalized, setisFinalized] = useState(false);

    useEffect(() => {
        const fetchCalendar = async () => {
            if (!token || !calendarId) {
                console.error('Token or calendarId is not available');
                setError('Token or calendarId is not available');
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const response = await axios.get(`${backendUrl}/calendars/${calendarId}/`, config);
                setCalendar(response.data);
                setisFinalized(response.data.status === "finalized")
                setIsOwner(response.data.owner_id === user.id);
                console.log("lol")
                // Check if the user is a calendar participant
                const contactsResponse = await axios.get(`${backendUrl}/calendars/${calendarId}/contacts/`, config);
                console.log("lol2")
                const isContact = contactsResponse.data.some(contact => contact.contact === user.id);
                console.log(isContact)
                setIsContact(isContact);
                
            } catch (error) {
                console.error('Error fetching calendar:', error);
                // setError('404\n\nThe page you are looking for does not exist or you do not have access to it.');
                const newText = 'Error 404\nThe page you are looking for does not exist or you do not have access to it.'.split('\n').map(str => <p>{str}</p>);
                setError(newText)
            }
        };

        if (token && user) {
            fetchCalendar();
        }
    }, [calendarId, token, user]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
    <div>
        <h1>{calendar ? calendar.name : 'Loading...'}</h1>
        {(isOwner || isContact) && isFinalized ? (
            <FinalView calendar={calendar} token={token} isOwner={isOwner}/>
        ) : isOwner ? (
            <OwnerView calendar={calendar} token={token} isOwner={isOwner}/>
        ) : isContact ? (
            <ContactView calendar={calendar} token={token} isOwner={isOwner}/>
        ) : (
            <div>
                <h2>404 Error</h2>
                <p>The page you are looking for does not exist or you do not have access to it.</p>
            </div>
        )}
    </div>
    );
};

export default CalendarDetailPage;
