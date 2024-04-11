import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from "../../hooks/AuthProvider";
import axios from 'axios';
 
 
const Dashboard = () => {

    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]);

    const auth = useAuth();
    const { token } = useAuth();
    const navigate = useNavigate();


    console.log(auth.user);

    const [isNavCollapsed, setIsNavCollapsed] = useState(true); // State to handle navbar collapse

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('https://api.oneonone.software/calendars/notifications/', {
            headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await axios.get('https://api.oneonone.software/contacts/contact-requests/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchRequests();
    }, [token]);

    const handleNotificationClick = async (notification) => {
        try {
            await axios.delete(`https://api.oneonone.software/calendars/notifications/${notification.id}`, {
            headers: { Authorization: `Bearer ${token}` }
            });

            await fetchNotifications();
            console.log(notification.calendar)
            navigate(`/calendars/${notification.calendar}`);

        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };


  return (
    <>
   
    <nav className="navbar navbar-expand-lg">
        <div className="container">
          <span className="navbar-brand" to="/dashboard/">1on1</span>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded={!isNavCollapsed} 
                    aria-label="Toggle navigation" onClick={handleNavCollapse}>
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
                <ul className="navbar-nav me-auto mb-lg-0">
                    <li className="nav-item"><Link className="nav-link current" to="/dashboard/">Dashboard</Link></li>
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
                // to={`https://api.oneonone.software/calendars/${notification.calendar.id}`} // Use this if it's supposed to be a Link component
                className="list-group-item list-group-item-action"
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.txt}
              </div>
            ))}
            {requests.map((request, index) => (
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
