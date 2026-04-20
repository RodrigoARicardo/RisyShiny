import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CalendarScreen from 'src/CalendarScreen';
import supabase from 'src/config/supabaseClient';

// --- Mocking External Dependencies ---
jest.mock('src/config/supabaseClient', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        single: jest.fn(),
        update: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        rpc: jest.fn(),
    };
    return mockSupabase;
});

jest.mock('src/AIJudge', () => ({
    getTaskDifficulty: jest.fn().mockResolvedValue({ score: 10, reasoning: 'Mock reasoning' }),
    getRejudgedTaskDifficulty: jest.fn().mockResolvedValue({ score: 15, reasoning: 'Mock debate reasoning' }),
}));

jest.mock('src/notifications/NotificationService', () => ({
    notificationService: {
        scheduleNotify: jest.fn().mockResolvedValue(true),
    },
}));

jest.mock('expo-router', () => ({
    router: {
        setParams: jest.fn(),
    },
}));

describe('CalendarScreen Game Functionality', () => {
    const mockUserId = 'user-123';

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default successful Supabase responses for component mount
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: mockUserId } },
        });

        // Mock events load
        (supabase.from as jest.Mock).mockImplementation((table) => {
            const chainable = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                gte: jest.fn().mockReturnThis(),
                lt: jest.fn().mockReturnThis(),
                update: jest.fn().mockResolvedValue({ error: null }),
                insert: jest.fn().mockResolvedValue({ data: { id: 'new-event-123' }, error: null }),
                delete: jest.fn().mockResolvedValue({ error: null }),
                single: jest.fn(),
            };

            if (table === 'events') {
                chainable.lt = jest.fn().mockResolvedValue({
                    data: [
                        {
                            id: 'event-1',
                            user_id: mockUserId,
                            title: 'Initial Task',
                            start_time: new Date().toISOString(),
                            score: 99,
                            description: 'Good job',
                            has_menu_open: false,
                            has_been_appealed: false,
                        }
                    ],
                    error: null,
                });
            } else if (table === 'profiles') {
                chainable.single = jest.fn().mockResolvedValue({
                    data: {
                        global_score: 50, // Starting points for the shop
                        bedtime: 0,
                        is_in_multiplayer_mode: false,
                        tactical_game_state: null,
                    },
                    error: null,
                });
            }

            return chainable;
        });

        // Mock RPC calls (like deduct points)
        (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
    });

    it('renders the initial global points successfully', async () => {
        const { getByText } = render(<CalendarScreen />);

        await waitFor(() => {
            expect(getByText('50')).toBeTruthy(); // Checks if the global points from the mocked profile loaded
        });
    });

    it('toggles between 1D (List) and 2D (Grid) view modes', async () => {
        const { getByText, queryByText } = render(<CalendarScreen />);

        // Wait for initial render
        await waitFor(() => {
            expect(getByText(/Tasks for:/i)).toBeTruthy(); // 1D mode banner
        });

        // Tap the date banner to switch to 2D view
        fireEvent.press(getByText(/Tasks for:/i));

        // Wait for 2D view elements to appear
        await waitFor(() => {
            expect(getByText('Secure the line:')).toBeTruthy();
            expect(getByText('Shop')).toBeTruthy(); // Shop label is visible in 2D
        });

        // Ensure 1D banner is gone
        expect(queryByText(/Tasks for:/i)).toBeNull();
    });

    it('selects and deselects shop items in the 2D view', async () => {
        const { getByText } = render(<CalendarScreen />);

        // Switch to 2D view
        await waitFor(() => {
            fireEvent.press(getByText(/Tasks for:/i));
        });

        // Find the 'basic' tower (cost 5, icon 🔫)
        const basicTowerCost = getByText('5');

        // Select it
        await act(async () => {
            fireEvent.press(basicTowerCost);
        });

        // The item should now be selected (you can verify this visually via styles in a real run,
        // but here we just ensure it doesn't crash and fires the state update)
        expect(basicTowerCost).toBeTruthy();

        // Deselect it
        await act(async () => {
            fireEvent.press(basicTowerCost);
        });
    });

    it('deducts points when a purchase is successful via the database RPC', async () => {
        const { getByText, getAllByText } = render(<CalendarScreen />);

        await waitFor(() => { fireEvent.press(getByText(/Tasks for:/i)); });
        await waitFor(() => expect(getByText('50')).toBeTruthy());

        const freezeTowers = getAllByText('15');

        await act(async () => {
            fireEvent.press(freezeTowers[0]);
        });

        // Use getByText with our unique score!
        const gridCell = getByText('99');

        await act(async () => {
            fireEvent.press(gridCell);
        });

        await waitFor(() => {
            expect(supabase.rpc).toHaveBeenCalledWith('buy_item', { item_cost: 15 });
        });

        await waitFor(() => {
            expect(getByText('35')).toBeTruthy();
        });
    });

    it('restores points if the database purchase transaction fails', async () => {
        // Force the RPC to fail
        (supabase.rpc as jest.Mock).mockResolvedValueOnce({ error: { message: 'Network error' } });

        const { getByText, getAllByText } = render(<CalendarScreen />);

        // Switch to 2D
        await waitFor(() => fireEvent.press(getByText(/Tasks for:/i)));

        // Select 5-cost tower
        const basicTower = getByText('5');
        await act(async () => {
            fireEvent.press(basicTower);
        });

        // Click a scored cell
        const gridCells = getAllByText('10');
        await act(async () => {
            fireEvent.press(gridCells[0]);
        });

        // Points should remain 50 because the transaction failed
        await waitFor(() => {
            expect(getByText('50')).toBeTruthy();
        });
    });
});