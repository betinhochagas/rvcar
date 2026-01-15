import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/Navbar';

// Mock scroll behavior
window.scrollTo = vi.fn();

// Mock useSiteConfig hook
vi.mock('@/contexts/SiteConfigContext', () => ({
  useSiteConfig: () => ({
    getConfig: vi.fn((key: string, defaultValue: string) => {
      const mockConfig: Record<string, string> = {
        site_name: 'RV Car Solutions',
        site_tagline: 'Soluções em locação de veículos',
        site_logo: '/logo.svg',
        site_logo_alt: 'RV Car Solutions',
        contact_phone: '(11) 99999-9999',
        contact_whatsapp: '5511999999999',
      };
      return mockConfig[key] || defaultValue;
    }),
    updateConfig: vi.fn(),
    isLoading: false,
  }),
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  it('should render logo and navigation links', () => {
    renderNavbar();

    // Check for logo
    const logo = screen.getByAltText('RV Car Solutions');
    expect(logo).toBeInTheDocument();

    // Check for navigation text
    expect(screen.getByText('RV Car Solutions')).toBeInTheDocument();
    expect(screen.getByText('Início')).toBeInTheDocument();
  });

  it('should render mobile menu button on small screens', () => {
    renderNavbar();

    // Mobile menu button should exist
    const menuButton = screen.getByLabelText('Abrir menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderNavbar();

    // Check for navigation element
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  it('should contain navigation buttons', () => {
    renderNavbar();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Check for specific navigation items
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Serviços')).toBeInTheDocument();
    expect(screen.getByText('Veículos')).toBeInTheDocument();
    expect(screen.getByText('Contato')).toBeInTheDocument();
  });

  it('should toggle mobile menu when button is clicked', () => {
    renderNavbar();

    const menuButton = screen.getByLabelText('Abrir menu');
    expect(menuButton).toBeInTheDocument();

    // Click to open menu
    fireEvent.click(menuButton);

    // After click, button label should change (tested via aria-expanded)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have WhatsApp contact button', () => {
    renderNavbar();

    const whatsappButton = screen.getByText('Fale Conosco');
    expect(whatsappButton).toBeInTheDocument();
  });

  it('should display phone number', () => {
    renderNavbar();

    const phoneText = screen.getByText('(11) 99999-9999');
    expect(phoneText).toBeInTheDocument();
  });

  it('should have logo with proper alt text', () => {
    renderNavbar();

    const logo = screen.getByAltText('RV Car Solutions');
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.svg'));
  });
});
