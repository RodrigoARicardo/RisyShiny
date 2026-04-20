import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import CalendarScreen from 'src/CalendarScreen';
import * as AIJudge from 'src/AIJudge';
import { notificationService } from 'src/notifications/NotificationService';

// 1. Mock the Notification Service
jest.mock('src/notifications/NotificationService', () => ({
    notificationService: {
        initialize: jest.fn().mockResolvedValue(undefined),
        scheduleNotify: jest.fn().mockResolvedValue('mock-notification-id'),
        getExpoPushToken: jest.fn().mockReturnValue('mock-token'),
        onNotificationTapped: jest.fn().mockReturnValue(() => {}),
    }
}));

// 2. Mock the AI Judge
jest.mock('src/AIJudge', () => ({
    getTaskDifficulty: jest.fn().mockResolvedValue({ score: 2, reasoning: "Mocked Reasoning", AIExecuted: true }),
    getRejudgedTaskDifficulty: jest.fn().mockResolvedValue({ score: 5, reasoning: "Court Appeal Success", AIExecuted: true }),
}));

// 3. The Bulletproof Supabase Mock
jest.mock('src/config/supabaseClient', () => {
    // This object allows infinite chaining (e.g., .from().select().eq().gte().lt())
    const chainable = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),

        // When .single() is called at the end of a chain, it resolves with this data.
        // We include both global_score (for the profile fetch) and id (for the insert fetch).
        single: jest.fn().mockResolvedValue({
            data: { global_score: 10, id: 'mock-event-123' },
            error: null
        }),

        // MAGIC BULLET: If the chain itself is 'await'ed directly without .single(),
        // JavaScript looks for this .then() method to resolve the Promise!
        then: jest.fn((resolve) => resolve({ data: [], error: null }))
    };

    return {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'student_123' } } }) },
        from: jest.fn(() => chainable),
        rpc: jest.fn().mockResolvedValue({ error: null }),
    };
});

describe('Student Daily Routine & Local Notification Simulation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Simulates a student scheduling classes, receiving local notifications, and arguing with the AI', async () => {
        // Setup AI Mock responses specifically for this test's timeline
        (AIJudge.getTaskDifficulty as jest.Mock)
            .mockResolvedValueOnce({ score: 2, reasoning: "Basic morning hygiene and prep.", AIExecuted: true })
            .mockResolvedValueOnce({ score: 4, reasoning: "Requires focus to ensure all academic materials are gathered.", AIExecuted: true });

        const { getByText, getAllByText, findByText, getByDisplayValue } = render(<CalendarScreen />);

        // Wait for CalendarScreen to mount and fetch initial global points (10)
        await findByText('10');

        // --- Step 1: 7:00 AM - Wake up & EEL3701C Prep ---
        fireEvent.press(getAllByText('+ Click to schedule routine')[7]);
        const input7AM = getByDisplayValue('');
        const task7AM = 'Wake up, make bed, and review EEL3701C lab materials';
        fireEvent.changeText(input7AM, task7AM);
        fireEvent(input7AM, 'blur'); // Trigger the save

        await waitFor(() => {
            expect(AIJudge.getTaskDifficulty).toHaveBeenCalledWith(task7AM);
            // Notification should be scheduled twice (start and claim points)
            expect(notificationService.scheduleNotify).toHaveBeenCalledTimes(2);
        });

        // --- Step 2: 8:00 AM - Packing for COP3530 ---
        fireEvent.press(getAllByText('+ Click to schedule routine')[8]);
        const input8AM = getByDisplayValue('');
        const task8AM = 'Pack laptop and notes for COP3530 and CEN3031';
        fireEvent.changeText(input8AM, task8AM);
        fireEvent(input8AM, 'blur'); // Trigger the save

        // Wait for the UI to reflect the score calculation
        const scoreElement = await findByText('◁ 4');

        // --- Step 3: Checking the AI Score & Debating the 8 AM task ---
        fireEvent.press(scoreElement); // Open the menu

        // Mock the High Court's response before we click debate
        (AIJudge.getRejudgedTaskDifficulty as jest.Mock).mockResolvedValueOnce({
            score: 5,
            reasoning: "The High Court recognizes the heavy mental friction of gathering materials for two distinct courses. Score increased.",
            AIExecuted: true
        });

        // Wait for the reasoning text to appear and tap it
        const reasoningElement = await findByText("Requires focus to ensure all academic materials are gathered.");
        fireEvent.press(reasoningElement);

        // Student writes their argument in the modal
        const debateInput = await screen.findByPlaceholderText(/Example:/i);
        fireEvent.changeText(debateInput, 'Finding all my notes for Data Structures and Software Engineering takes extreme focus before leaving.');
        fireEvent.press(getByText('Submit Appeal'));

        // IMPORTANT: Let React settle and verify the score updated to 5 BEFORE clicking done
        await findByText('◁ 5');

        // --- Step 4: Completing the Task and Claiming Points ---
        const doneButton = await findByText(/when done/i);
        fireEvent.press(doneButton);

        // Validate the score logic updated the global points correctly (10 + 5 = 15)
        await findByText('15');
    });
});