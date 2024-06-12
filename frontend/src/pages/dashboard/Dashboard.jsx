import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from "../../hooks/AuthProvider";
import axios from 'axios';
import Navbar from '../../components/Navbar';
 
const Dashboard = () => {

    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]);

    const auth = useAuth();
    const { token } = useAuth();
    const navigate = useNavigate();

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/calendars/notifications/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [backendUrl, token]);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/contacts/contact-requests/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    }, [backendUrl, token]);

    useEffect(() => {
        fetchNotifications();
        fetchRequests();
    }, [fetchNotifications, fetchRequests]);

    const handleNotificationClick = async (notification) => {
        try {
            await axios.delete(`${backendUrl}/calendars/notifications/${notification.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchNotifications();
            navigate(`/calendars/${notification.calendar}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <>
            <Navbar activePage='dashboard'/>
            <main>
                <div className="container-sm">
                    <h2 className="text-center my-4">Welcome back {auth.user?.username}.</h2>
                    <div className="notifications">
                        <h3>Notifications</h3>
                        <div className="list-group">
                            {notifications.length + requests.length === 0 ? (
                                <p>No new notifications</p>
                            ) : (
                                <>
                                    {notifications.map(notification => (
                                        <div
                                            className="list-group-item list-group-item-action"
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            {notification.txt}
                                        </div>
                                    ))}
                                    {requests.map(request => (
                                        <Link
                                            className="list-group-item list-group-item-action"
                                            key={request.id}
                                            to='/contacts'
                                        >
                                            <div>New contact request from {request.sender_details.username}.</div>
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="footer text-center py-3 container-fluid">
                <p>2024 1on1 Meetings. All rights reserved.</p>
            </footer>
        </>
    );
};
 
export default Dashboard;
