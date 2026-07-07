import { RouterProvider } from 'react-router-dom';
import { CookieNotice } from '../features/legal/components/CookieNotice';
import { Providers } from './providers';
import { router } from './router';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <CookieNotice />
    </Providers>
  );
}
