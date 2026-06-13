import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddCandidateForm from '../components/AddCandidateForm';

describe('AddCandidateForm Component Tests (ADLC)', () => {
    beforeEach(() => {
        // Mock global fetch
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the form with all main input fields', () => {
        render(<AddCandidateForm />);
        
        expect(screen.getByText('Agregar Candidato')).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument();
    });

    it('allows typing into fields and updates state', () => {
        render(<AddCandidateForm />);
        
        const firstNameInput = screen.getByLabelText(/Nombre/i);
        const lastNameInput = screen.getByLabelText(/Apellido/i);
        const emailInput = screen.getByLabelText(/Correo Electrónico/i);

        fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
        fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
        fireEvent.change(emailInput, { target: { value: 'juan.perez@example.com' } });

        expect(firstNameInput.value).toBe('Juan');
        expect(lastNameInput.value).toBe('Pérez');
        expect(emailInput.value).toBe('juan.perez@example.com');
    });

    it('submits the form successfully and displays success message', async () => {
        global.fetch.mockResolvedValueOnce({
            status: 201,
            json: async () => ({ message: 'Candidate added successfully', id: 1 })
        });

        render(<AddCandidateForm />);
        
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'juan.perez@example.com' } });

        const submitButton = screen.getByRole('button', { name: /Enviar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/candidates', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining('"firstName":"Juan"')
            }));
        });

        expect(await screen.findByText('Candidato añadido con éxito')).toBeInTheDocument();
    });

    it('displays error message when submission fails', async () => {
        global.fetch.mockResolvedValueOnce({
            status: 400,
            json: async () => ({ message: 'The email already exists in the database' })
        });

        render(<AddCandidateForm />);
        
        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'juan.perez@example.com' } });

        const submitButton = screen.getByRole('button', { name: /Enviar/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText(/Error al añadir candidato: Datos inválidos: The email already exists in the database/i)).toBeInTheDocument();
    });
});
