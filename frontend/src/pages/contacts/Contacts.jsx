import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Contacts.css'; // Make sure this path is correct
import { useAuth } from '../../hooks/AuthProvider';
import Navbar from '../../components/Navbar';

const ContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const auth = useAuth();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get(`${backendUrl}/contacts/contact-lists/`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                setContacts(response.data.contacts);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };

        if (auth.token) { // Making sure there is a token before attempting to fetch contacts
            fetchContacts();
        }

        const fetchRequests = async () => {
            try {
                const response = await axios.get(`${backendUrl}/contacts/contact-requests/`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                setRequests(response.data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        if (auth.token) { 
            fetchContacts();
            fetchRequests();
        }
    }, [auth.token, backendUrl]);

    const handleSubmit = async (e) => {
        const endpoint = `${backendUrl}/contacts/contact-requests/`;
        const data = { 'receiver': username };
        try {
            const response = await axios.post(endpoint, data, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            console.log('Success:', response.data);
            if (response.data.message){
                setMessage('Contact added successfully!');
            }
            else {
                setMessage('Contact request sent.');
            }
            setIsError(false);
            setUsername('');
        } catch (error) {
            console.error('Error during the API call:', error);
            // Extracting server error message
            console.log(error.response.data[0])
            const errorMessage = error.response.data[0];

            setMessage(errorMessage);
            setIsError(true);
        }
    };

    const deleteContact = async (username) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this contact?');
        if (isConfirmed) {
            const contactToDelete = contacts.find(contact => contact.username === username);
            if (!contactToDelete) {
                console.error('Contact not found');
                return;
            }
    
            try {
                // Assuming you need to send the contact's email as data for some reason
                const data = { email: contactToDelete.email };
                await axios.put(`${backendUrl}/contacts/contact-lists/`, data, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                console.log('Contact deleted successfully');
                // Update the UI
                const updatedContacts = contacts.filter(contact => contact.username !== username);
                setContacts(updatedContacts);
            } catch (error) {
                console.error('Error during the API call:', error);
            }
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            const response = await axios.put(
                `${backendUrl}/contacts/contact-requests/`,
                { id: requestId, action: 'accept' },
                { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            console.log('Request accepted:', response.data);
            const newContact = {
                username: response.data.sender.username, 
                first_name: response.data.sender.first_name,
                last_name: response.data.sender.last_name,
                email: response.data.sender.email,
            };
            setContacts(prevContacts => [...prevContacts, newContact]);
            setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
            
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    // Function to reject a contact request
    const rejectRequest = async (requestId) => {
        try {
            const response = await axios.put(
                `${backendUrl}/contacts/contact-requests/`,
                { id: requestId, action: 'decline' },
                { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            console.log('Request rejected:', response.data);
            setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };
    

    return (
        <>
            <Navbar activePage='contacts'/>

            <main className="container mt-4">
                <h2 className="mb-4">Incoming Contact Requests</h2>
                <div style={{ overflowX: 'auto' }}>
                {requests.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Sender</th>
                                <th scope="col">Email</th>
                                <th scope="col">First Name</th>
                                <th scope="col">Last Name</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request, index) => (
                                <tr key={request.id}>
                                    <td>{request.sender_details.username}</td>
                                    <td>{request.sender_details.email}</td>
                                    <td>{request.sender_details.first_name}</td>
                                    <td>{request.sender_details.last_name}</td>
                                    <td>
                                        <button className="btn btn-success btn-sm m-1" onClick={() => acceptRequest(request.id)}>Accept</button>
                                        <button className="btn btn-danger btn-sm m-1" onClick={() => rejectRequest(request.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No new contact requests</p>
                )}
                </div>
                <h2 className="mb-4">Manage Contacts</h2>
                <div className="input-group flex-nowrap">
                    <span className="input-group-text" id="addon-wrapping">Add a Contact</span>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Username" 
                        aria-label="Username" 
                        aria-describedby="addon-wrapping" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button className="btn btn-primary" type="button" onClick={handleSubmit} >Sumbit</button>
                </div>
                {message && <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
                <div style={{ overflowX: 'auto' }}>
                {contacts.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Username</th>
                                <th scope="col">First Name</th>
                                <th scope="col">Last Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact, index) => (
                                <tr key={index}>
                                    <td>{contact.username}</td>
                                    <td>{contact.first_name}</td>
                                    <td>{contact.last_name}</td>
                                    <td>{contact.email}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteContact(contact.username)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <h3>No contacts</h3>
                )}
                </div>
            </main>

            
            <footer className="footer text-center py-3 container-fluid">
                <p>2024 1on1 Meetings. All rights reserved.</p>
            </footer>
        </>
    );
};

export default ContactsPage;
