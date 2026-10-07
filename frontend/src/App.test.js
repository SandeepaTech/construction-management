import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.history.replaceState({}, '', '/login');
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 401 });
});

afterEach(() => {
  jest.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

test('shows the BuildPro landing page and opens sign-in from its navigation', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  expect(screen.getByRole('heading', { name: /building your dreams, together/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /what are you looking for/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /home construction/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /get a free quote/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /construction workers reviewing a building project/i })).toHaveAttribute('src', expect.stringContaining('about-construction-team'));
  expect(screen.queryByText(/open my profile/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/signed in as client/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: /log in/i })[0]);
  expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
});

test('filters construction service categories from the home page search', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  fireEvent.change(screen.getByRole('searchbox', { name: /search for services/i }), { target: { value: 'commercial' } });
  fireEvent.click(screen.getByRole('button', { name: /search services/i }));
  expect(screen.getByRole('button', { name: /commercial construction/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /home construction/i })).not.toBeInTheDocument();
});

test('changes the hero photo on hover and slide selection without zooming', () => {
  window.history.replaceState({}, '', '/');
  const { container } = render(<App />);
  const heroImage = container.querySelector('.landing-hero-image img');
  const hero = container.querySelector('.landing-hero');
  jest.spyOn(hero, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    right: 900,
    top: 0,
    bottom: 600,
    width: 900,
    height: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  expect(heroImage).toHaveAttribute('src', expect.stringContaining('project-hotel'));
  fireEvent.mouseMove(hero, { clientX: 810 });
  expect(heroImage).toHaveAttribute('src', expect.stringContaining('infrastructure'));
  fireEvent.mouseEnter(screen.getByRole('button', { name: 'Show project image 2' }));
  expect(heroImage).toHaveAttribute('src', expect.stringContaining('project-home'));
  fireEvent.click(screen.getByRole('button', { name: 'Show project image 3' }));
  expect(heroImage).toHaveAttribute('src', expect.stringContaining('infrastructure'));
  expect(heroImage).not.toHaveAttribute('style');
});

test('shows sign-in form and the available account roles', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email address/i)).toBeRequired();
  expect(screen.getByLabelText(/login as/i)).toHaveTextContent('Admin');
  expect(screen.getByLabelText(/login as/i)).toHaveTextContent('Project Manager');
  expect(screen.getByLabelText(/login as/i).options).toHaveLength(8);
  expect(screen.getByLabelText(/login as/i)).toHaveTextContent('Site Engineer');
});

test('public registration only creates a client account', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: /create account/i }));
  expect(screen.getByLabelText(/full name/i)).toBeRequired();
  expect(screen.getByLabelText(/email address/i)).toBeRequired();
  expect(screen.getByLabelText(/phone number/i)).toBeRequired();
  expect(screen.getByLabelText(/phone number/i)).toHaveAttribute('placeholder', '0700000000');
  expect(screen.getByLabelText(/^password$/i)).toBeRequired();
  expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
  expect(screen.getByLabelText(/account type/i)).toHaveTextContent('Client / Building Owner');
  expect(screen.getByLabelText(/account type/i).options).toHaveLength(1);
  expect(screen.queryByLabelText(/login as/i)).not.toBeInTheDocument();
  expect(screen.getByText('Client / Building Owner')).toBeInTheDocument();
});

test('opens the admin dashboard with account information for an existing admin session', async () => {
  const admin = {
    id: 1,
    fullName: 'Admin',
    email: 'admin@gmail.com',
    phoneNumber: '0000000000',
    role: 'ADMIN_PROJECT_MANAGER',
  };
  window.history.replaceState({}, '', '/admin/dashboard');
  global.fetch.mockImplementation((url) => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(url.endsWith('/api/auth/me') ? admin : [admin]),
  }));

  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Welcome, Admin.' })).toBeInTheDocument();
  expect(await screen.findByRole('table')).toHaveTextContent('admin@gmail.com');
  expect(screen.getByText('REGISTERED ACCOUNTS')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/admin/dashboard');
});

test('lets an administrator view their own profile from the dashboard', async () => {
  const admin = {
    id: 1,
    fullName: 'Admin',
    email: 'admin@gmail.com',
    phoneNumber: '0700000000',
    role: 'ADMIN_PROJECT_MANAGER',
  };
  window.history.replaceState({}, '', '/admin/dashboard');
  global.fetch.mockImplementation((url) => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(url.endsWith('/api/auth/me') ? admin : [admin]),
  }));

  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Welcome, Admin.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: /my profile/i }));

  expect(await screen.findByRole('heading', { name: 'My profile' })).toBeInTheDocument();
  expect(screen.getByText('admin@gmail.com')).toBeInTheDocument();
  expect(screen.getByText('0700000000')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/admin/profile');
});

test('shows the signed-in home page first after admin login', async () => {
  const admin = {
    id: 1,
    fullName: 'Admin',
    email: 'admin@gmail.com',
    phoneNumber: '0000000000',
    role: 'ADMIN_PROJECT_MANAGER',
  };
  global.fetch.mockImplementation((url, options) => {
    if (url.endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: false, status: 401 });
    }
    if (url.endsWith('/api/auth/csrf')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve('csrf-token') });
    }
    if (url.endsWith('/api/auth/login')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(admin) });
    }
    if (url.endsWith('/api/admin/users')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([admin]) });
    }
    return Promise.reject(new Error('Unexpected API request'));
  });

  render(<App />);
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: admin.email } });
  fireEvent.change(screen.getByLabelText(/login as/i), { target: { value: 'ADMIN_PROJECT_MANAGER' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'admin123' } });
  fireEvent.submit(screen.getByLabelText(/^password$/i).closest('form'));

  expect(await screen.findByRole('heading', { name: /building your dreams, together/i })).toBeInTheDocument();
  expect(screen.queryByText(/signed in as admin \/ project manager/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /open my profile/i })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
  fireEvent.click(screen.getByRole('button', { name: /my dashboard/i }));
  expect(await screen.findByRole('heading', { name: 'Welcome, Admin.' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/admin/dashboard');
  const loginCall = global.fetch.mock.calls.find(([url]) => url.endsWith('/api/auth/login'));
  expect(JSON.parse(loginCall[1].body).role).toBe('ADMIN_PROJECT_MANAGER');
});

test('shows the signed-in home page first after client login', async () => {
  const client = {
    id: 2,
    fullName: 'Casey Client',
    email: 'casey@example.com',
    phoneNumber: '0700000000',
    role: 'CLIENT',
  };
  global.fetch.mockImplementation((url) => {
    if (url.endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: false, status: 401 });
    }
    if (url.endsWith('/api/auth/csrf')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve('csrf-token') });
    }
    if (url.endsWith('/api/auth/login')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(client) });
    }
    if (url.endsWith('/api/client/requests')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) });
    }
    return Promise.reject(new Error('Unexpected API request'));
  });

  render(<App />);
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: client.email } });
  fireEvent.change(screen.getByLabelText(/login as/i), { target: { value: 'CLIENT' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'clientpass123' } });
  fireEvent.submit(screen.getByLabelText(/^password$/i).closest('form'));

  expect(await screen.findByRole('heading', { name: /building your dreams, together/i })).toBeInTheDocument();
  expect(screen.queryByText(/signed in as client \/ building owner/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /open my profile/i })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
  fireEvent.click(screen.getByRole('button', { name: /my dashboard/i }));
  expect(await screen.findByRole('heading', { name: 'My profile' })).toBeInTheDocument();
  expect(screen.getByText('casey@example.com')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/client/dashboard');
});

test('shows the backend login error instead of a generic message', async () => {
  global.fetch.mockImplementation((url, options) => {
    if (url.endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: false, status: 401 });
    }
    if (url.endsWith('/api/auth/csrf')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve('csrf-token') });
    }
    return Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        timestamp: '2026-10-05T00:00:00',
        status: 401,
        error: 'Unauthorized',
        path: '/api/auth/login',
      }),
    });
  });

  render(<App />);
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'admin@gmail.com' } });
  fireEvent.change(screen.getByLabelText(/login as/i), { target: { value: 'ADMIN_PROJECT_MANAGER' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'admin123' } });
  fireEvent.submit(screen.getByLabelText(/^password$/i).closest('form'));

  expect(await screen.findByRole('alert')).toHaveTextContent(/email, password, or selected account type is incorrect/i);
});

test('explains when the Spring Boot backend does not have the admin dashboard endpoint', async () => {
  const admin = {
    id: 1,
    fullName: 'Admin',
    email: 'admin@gmail.com',
    phoneNumber: '0000000000',
    role: 'ADMIN_PROJECT_MANAGER',
  };
  global.fetch.mockImplementation((url) => Promise.resolve(
    url.endsWith('/api/auth/me')
      ? { ok: true, status: 200, json: () => Promise.resolve(admin) }
      : { ok: false, status: 404 },
  ));

  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/restart the spring boot backend in intellij/i);
});

test('submits client registration without a user-selected role', async () => {
  global.fetch.mockImplementation((url, options) => {
    if (url.endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: false, status: 401 });
    }
    if (url.endsWith('/api/auth/csrf')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve('csrf-token') });
    }
    if (url.endsWith('/api/auth/register')) {
      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 5 }),
      });
    }
    return Promise.reject(new Error('Unexpected API request'));
  });

  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: /create account/i }));
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Casey Client' } });
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '5551234567' } });
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'casey@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'client-pass-123' } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'client-pass-123' } });
  fireEvent.submit(screen.getByLabelText(/confirm password/i).closest('form'));

  expect(await screen.findByRole('status')).toHaveTextContent(/account has been created/i);
  const registrationCall = global.fetch.mock.calls.find(([url]) => url.endsWith('/api/auth/register'));
  expect(JSON.parse(registrationCall[1].body)).not.toHaveProperty('role');
  expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
});

test('shows the requested client workspace navigation and page content', async () => {
  const client = {
    id: 2,
    fullName: 'Casey Client',
    email: 'casey@example.com',
    phoneNumber: '0700000000',
    role: 'CLIENT',
  };
  window.history.replaceState({}, '', '/');
  global.fetch.mockImplementation((url) => Promise.resolve(
    url.endsWith('/api/auth/me')
      ? { ok: true, status: 200, json: () => Promise.resolve(client) }
      : { ok: true, status: 200, json: () => Promise.resolve([]) },
  ));

  render(<App />);

  expect(await screen.findByRole('heading', { name: /building your dreams, together/i })).toBeInTheDocument();
  await screen.findByRole('button', { name: /my dashboard/i });
  expect(screen.queryByText(/signed in as client \/ building owner/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /open my profile/i })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/');

  fireEvent.click(screen.getByRole('button', { name: /my dashboard/i }));
  expect(await screen.findByRole('heading', { name: 'My profile' })).toBeInTheDocument();
  expect(screen.getByText('casey@example.com')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /submit project request/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /my project requests/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /my projects/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /project progress/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /my invoices/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /notifications/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/client/dashboard');

  fireEvent.click(screen.getByRole('link', { name: /dashboard/i }));
  expect(await screen.findByRole('heading', { name: 'My profile' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/client/dashboard');

  fireEvent.click(screen.getByRole('link', { name: /profile/i }));
  expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  expect(screen.getAllByText('casey@example.com')).toHaveLength(2);
});

test('shows each signed-in user their own profile and role', async () => {
  const engineer = {
    id: 7,
    fullName: 'Jordan Engineer',
    email: 'jordan@example.com',
    phoneNumber: '0712345678',
    role: 'SITE_ENGINEER',
  };
  window.history.replaceState({}, '', '/');
  global.fetch.mockImplementation((url) => Promise.resolve(
    url.endsWith('/api/auth/me')
      ? { ok: true, status: 200, json: () => Promise.resolve(engineer) }
      : { ok: true, status: 200, json: () => Promise.resolve([]) },
  ));

  render(<App />);

  expect(await screen.findByRole('heading', { name: /building your dreams, together/i })).toBeInTheDocument();
  await screen.findByRole('button', { name: /my dashboard/i });
  expect(screen.queryByText(/signed in as site engineer/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /open my profile/i })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/');
  fireEvent.click(screen.getByRole('button', { name: /my dashboard/i }));
  expect(await screen.findByRole('heading', { name: 'Welcome, Jordan.' })).toBeInTheDocument();
  expect(screen.getAllByText('Jordan Engineer')).toHaveLength(3);
  expect(screen.getByText('jordan@example.com')).toBeInTheDocument();
  expect(screen.getByText('0712345678')).toBeInTheDocument();
  expect(screen.getAllByText('Site Engineer')).toHaveLength(2);
  expect(window.location.pathname).toBe('/workspace/dashboard');
  fireEvent.click(screen.getByRole('link', { name: /my profile/i }));
  expect(await screen.findByRole('heading', { name: 'My profile' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/workspace/profile');
});

test('submits a client project request to the protected API', async () => {
  const client = {
    id: 2,
    fullName: 'Casey Client',
    email: 'casey@example.com',
    phoneNumber: '0700000000',
    role: 'CLIENT',
  };
  const projectRequest = {
    id: 14,
    projectName: 'Family home',
    projectType: 'Residential',
    location: 'Colombo',
    description: 'A two-storey home',
    status: 'PENDING',
    createdAt: '2026-10-05T10:00:00Z',
  };
  global.fetch.mockImplementation((url, options) => {
    if (url.endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(client) });
    }
    if (url.endsWith('/api/auth/csrf')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve('csrf-token') });
    }
    if (url.endsWith('/api/client/requests')) {
      return Promise.resolve({
        ok: true,
        status: options?.method === 'POST' ? 201 : 200,
        json: () => Promise.resolve(options?.method === 'POST' ? projectRequest : []),
      });
    }
    return Promise.reject(new Error('Unexpected API request'));
  });

  render(<App />);
  fireEvent.click(await screen.findByRole('link', { name: /submit project request/i }));
  fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: 'Family home' } });
  fireEvent.change(screen.getByLabelText(/project type/i), { target: { value: 'Residential' } });
  fireEvent.change(screen.getByLabelText(/project location/i), { target: { value: 'Colombo' } });
  fireEvent.change(screen.getByLabelText(/project details/i), { target: { value: 'A two-storey home' } });
  fireEvent.submit(screen.getByLabelText(/project details/i).closest('form'));

  expect(await screen.findByRole('status')).toHaveTextContent(/submitted successfully/i);
  expect(await screen.findByText('Family home')).toBeInTheDocument();
  expect(['/client/requests', '/client/project-requests']).toContain(window.location.pathname);
  const createCall = global.fetch.mock.calls.find(([, options]) => options?.method === 'POST');
  expect(createCall[0]).toBe('http://localhost:8080/api/client/requests');
  expect(JSON.parse(createCall[1].body)).toEqual({
    projectName: 'Family home',
    projectType: 'Residential',
    location: 'Colombo',
    description: 'A two-storey home',
  });
});
