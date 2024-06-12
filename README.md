# Calendar Scheduling Application

## Quick Summary

The Calendar Scheduling Application allows users to create and manage calendars, invite contacts, create and vote on timeslots, and finalize events. It includes features such as user authentication, real-time updates, and notifications to ensure seamless scheduling and collaboration.

## Video Demonstration

*Include a link to a video demonstration of the application here.*

(Usage Guide Included After Installation Section)

## Technologies Used

- **Backend**: Django, Django REST Framework
- **Frontend**: React, React Big Calendar, Bootstrap
- **Real-Time Communication**: Socket.io (Optional for chat system)
- **Authentication**: Custom or third-party like Auth0 or Firebase Authentication
- **Database**: PostgreSQL (or any preferred database)
- **Hosting**: AWS, Heroku, or any cloud service

## Installation

### Backend Setup

1. **Create a .env file** in the backend directory.
2. **Generate a Django secret key** through a website such as [Djecrety](https://djecrety.ir/).
3. **Add the secret key** to the .env file with the variable name `DJANGO_SECRET_KEY`.
   ```env
   DJANGO_SECRET_KEY=your_generated_secret_key
   ```
4. **Run startup.sh**:
   ```sh
   ./startup.sh
   ```
5. **Activate the virtual environment** by running in the shell:
   ```sh
   source venv/bin/activate
   ```
6. **Run the server**:
   ```sh
   ./run.sh
   ```

### Frontend Setup

1. **Install Node.js** if not already installed. You can download it from [Node.js official website](https://nodejs.org/).
2. **Navigate to the frontend directory** and install the necessary dependencies:
   ```sh
   npm install
   ```
3. **Create a .env file** in the frontend directory.
4. **Add the backend URL** to the .env file:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```
5. **Start the frontend server**:
   ```sh
   npm start
   ```
6. **Open** the application in your browser at [http://localhost:3000](http://localhost:3000).

## Usage

1. **Get Started**:
   - Click "Get Started" and register an account (any email format is acceptable).
   
2. **Manage Contacts**:
   - Go to the contacts page and send a contact request to another user via their username (if no other users exist, create another account).
   - Wait for the other user to accept the friend request via the contacts page.

3. **Create and Manage Calendars**:
   - Navigate to the calendars page.
   - Create a calendar by adding a name and an optional description, then click "Create Calendar".
   - Open the newly created calendar from the list below.
   - Create timeslots by dragging on the calendar and optionally adding a comment for the timeslot.
   - Edit the timeslot to add preference, exact duration, and modify the start time or comment as desired.

4. **Invite Contacts and Collect Preferences**:
   - Add desired contacts to the calendar through the dropdown menu.
   - Wait for other users to add their preferences for each timeslot.
   - If you are an attendee, open the calendar and add a preference to each timeslot, then click "Vote". This must be done for all timeslots.

5. **Suggest and Finalize Calendar**:
   - When all users have submitted their preferences, click "Suggest Calendar" to get a recommended calendar.
   - If there are no conflicts, finalize the desired calendar. Note that the total preference score indicates everyone's availability—the higher the score, the more preferred the calendar is for everyone.
   - Once finalized, either email or notify everyone via website notifications about the finalized date.
   
6. **View Finalized Calendar**:
   - To view the finalized calendar again, go to the calendars tab and click on the calendar.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Django](https://www.djangoproject.com/)
- [Node.js](https://nodejs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [React Big Calendar](https://github.com/jquense/react-big-calendar)

```
