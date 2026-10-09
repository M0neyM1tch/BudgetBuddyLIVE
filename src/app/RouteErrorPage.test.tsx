import { lazy, Suspense } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteErrorPage } from './RouteErrorPage';

beforeEach(() => {
  // React Router reports the intentional fixture failures to the console.
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('route error recovery', () => {
  it.each([
    'Failed to fetch dynamically imported module: https://example.invalid/assets/retired-page.js',
    'Importing a module script failed.',
    'Loading chunk 42 failed. https://example.invalid/assets/retired-page.js',
  ])('catches a rejected lazy page import without automatically reloading (%s)', async (message) => {
    const onReload = vi.fn();
    const FailedPage = lazy(() => Promise.reject(new TypeError(message)));
    const router = createMemoryRouter([{
      errorElement: <RouteErrorPage onReload={onReload} />,
      children: [{
        path: '/dashboard',
        children: [{
          path: 'calculator',
          element: <Suspense fallback={<p>Loading page</p>}><FailedPage /></Suspense>,
        }],
      }],
    }], { initialEntries: ['/dashboard/calculator'] });
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'This page could not load' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('A recent update or a connection problem');
    expect(screen.getByRole('alert')).not.toHaveTextContent(message);
    expect(screen.getByRole('alert')).not.toHaveTextContent('example.invalid');
    expect(screen.queryByText(/TypeError|Unexpected Application Error|at RouteErrorPage/)).not.toBeInTheDocument();
    const reload = screen.getByRole('button', { name: 'Reload page' });
    expect(reload).toHaveAccessibleDescription('Reloading may discard unsaved changes.');
    expect(onReload).not.toHaveBeenCalled();

    fireEvent.click(reload);
    expect(onReload).toHaveBeenCalledTimes(1);
    router.dispose();
  });

  it('sanitizes an ordinary rendering error on a public route', async () => {
    const onReload = vi.fn();
    function BrokenPage(): never {
      throw new Error('Synthetic internal detail at https://example.invalid/internal');
    }
    const router = createMemoryRouter([{
      errorElement: <RouteErrorPage onReload={onReload} />,
      children: [{ path: '/terms', element: <BrokenPage /> }],
    }], { initialEntries: ['/terms'] });
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).not.toHaveTextContent('Synthetic internal detail');
    expect(screen.getByRole('alert')).not.toHaveTextContent('example.invalid');
    expect(screen.queryByText(/recent update/)).not.toBeInTheDocument();
    expect(onReload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reload page' }));
    expect(onReload).toHaveBeenCalledTimes(1);
    router.dispose();
  });
});
