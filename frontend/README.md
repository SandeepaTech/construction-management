# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Construction management sign-in

The React app runs separately from the Spring Boot backend. Start MySQL and the
backend first, then run `npm start` in this `frontend` directory. The frontend
connects to `http://localhost:8080` by default; set `REACT_APP_API_URL` before
starting the frontend if your backend uses a different address.

The BuildPro landing page is at `/`. Use its Log in or Get started actions to
open `/login` or `/signup`. After login, the signed-in home page stays at `/`
and hides the role/status text and profile call-to-action. Use the account
icon to open the signed-in role's dashboard. The home page has a construction
photo hero with three supplied photos that change as the pointer moves over
the hero, plus clickable and keyboard-accessible slide controls; the images
stay at normal scale without hover zoom. It also has searchable construction
service categories. The blue-and-yellow theme is shared by the landing page,
authentication forms, and signed-in workspaces. Each
signed-in account can open its own profile, including its name, email, phone
number, and account type. Admin profiles are at `/admin/profile`, client
profiles at `/client/profile`, and other staff profiles at `/workspace/profile`.

Public registration always creates a `CLIENT` account with a BCrypt-hashed
password in the `app_users` table. Duplicate emails are rejected. Admin /
Project Manager and other staff roles cannot be selected during registration.
The backend creates one development Admin / Project Manager account:
`admin@gmail.com` / `admin123`. The admin dashboard is at `/admin/dashboard`
and its profile at `/admin/profile`. Client login and restored client sessions
show the home page at `/`; the client dashboard at `/client/dashboard` displays
the signed-in user's profile, also available at `/client/profile`. Change the
default password before deployment.

Authentication endpoints:

- `POST /api/auth/register` — register with full name, email, phone number,
  password, and confirm password. The server assigns the Client role.
- `POST /api/auth/login` — authenticate with email, password, and role.
- `GET /api/auth/me` — get the signed-in account.
- `POST /api/auth/logout` — end the current session.
- `GET /api/admin/users` — list registered accounts for Admin / Project Manager sessions only.
- `GET /api/client/requests` — list the signed-in client's project requests.
- `POST /api/client/requests` — submit a project request for the signed-in client.

From the client workspace, My Projects,
Project Progress, My Invoices, and Notifications currently show empty states
until those records are added to the application.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
