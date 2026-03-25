import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

const HelloComponent = () => (
    <View>
        <Text>Hello, Expo!</Text>
    </View>
);

describe('HelloComponent', () => {
    it('renders the correct text', () => {
        render(<HelloComponent />);
        expect(screen.getByText('Hello, Expo!')).toBeTruthy();
    });
});