import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DemoModeBanner from '@/components/DemoModeBanner';

describe('DemoModeBanner Component', () => {
  beforeEach(() => {
    // Reset environment variable before each test
    vi.unstubAllEnvs();
  });

  it('should render banner when using test PayMongo keys', () => {
    // Set test mode
    vi.stubEnv(
      'NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY',
      'pk_test_mock_key_for_testing'
    );

    render(<DemoModeBanner />);

    // Check if banner is visible
    expect(screen.getByText(/Demo Mode:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/This site is using test payments/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No real money will be charged/i)
    ).toBeInTheDocument();
  });

  it('should not render banner when using live PayMongo keys', () => {
    // Set live mode
    vi.stubEnv(
      'NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY',
      'pk_live_real_key_for_production'
    );

    const { container } = render(<DemoModeBanner />);

    // Banner should not be rendered
    expect(container.firstChild).toBeNull();
  });

  it('should not render banner when no PayMongo key is set', () => {
    // No key set
    vi.stubEnv('NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY', undefined);

    const { container } = render(<DemoModeBanner />);

    // Banner should not be rendered
    expect(container.firstChild).toBeNull();
  });

  it('should dismiss banner when close button is clicked', () => {
    // Set test mode
    vi.stubEnv(
      'NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY',
      'pk_test_mock_key_for_testing'
    );

    render(<DemoModeBanner />);

    // Banner should be visible initially
    expect(screen.getByText(/Demo Mode:/i)).toBeInTheDocument();

    // Click dismiss button
    const dismissButton = screen.getByLabelText(/dismiss banner/i);
    fireEvent.click(dismissButton);

    // Banner should be removed
    expect(screen.queryByText(/Demo Mode:/i)).not.toBeInTheDocument();
  });

  it('should have correct warning styling', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY',
      'pk_test_mock_key_for_testing'
    );

    const { container } = render(<DemoModeBanner />);

    // Check if warning classes are applied
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('bg-warning/20');
  });

  it('should display warning icon', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY',
      'pk_test_mock_key_for_testing'
    );

    render(<DemoModeBanner />);

    // Check if SVG icon is rendered (warning triangle)
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
});
