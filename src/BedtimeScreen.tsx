import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import supabase from 'src/config/supabaseClient';

export default function BedtimeScreen() {
    const [userBedtime, setUserBedtime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the user's current bedtime when the tab opens
    useEffect(() => {
        const fetchBedtime = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('bedtime')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error("Failed to fetch bedtime:", error.message);
                    } else if (data && data.bedtime !== null) {
                        // Make sure to parse it safely just like in CalendarScreen!
                        setUserBedtime(Number(data.bedtime));
                    } else {
                        setUserBedtime(0);
                    }
                }
            } finally {
                // This guarantees the loading screen goes away, success or fail
                setIsLoading(false);
            }
        };

        // Explicitly handle the returned promise to satisfy strict linting
        fetchBedtime().catch(error => {
            console.error("Unhandled error in fetchBedtime promise:", error);
            setIsLoading(false); // Failsafe
        });
    }, []);

    // Save the new bedtime to the database
    const handleBedtimeChange = async (newHour: number) => {
        // Optimistic UI update
        const previousBedtime = userBedtime;
        setUserBedtime(newHour);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ bedtime: newHour })
                .eq('id', user.id);

            if (error) {
                console.error("Failed to save bedtime:", error.message);
                setUserBedtime(previousBedtime); // Revert on failure
                Alert.alert("Error", "Could not save your new bedtime to the database.");
            } else {
                Alert.alert("Saved!", "Your logical day end time has been updated.");
            }
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90D9" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select Bedtime</Text>
                <Text style={styles.subtitle}>When does your logical day end?</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                    const isSelected = userBedtime === hour;
                    const timeLabel = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

                    return (
                        <TouchableOpacity
                            key={hour}
                            style={[
                                styles.timeSlot,
                                isSelected && styles.selectedTimeSlot
                            ]}
                            onPress={() => handleBedtimeChange(hour)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.timeText,
                                isSelected && styles.selectedTimeText
                            ]}>
                                {timeLabel}
                            </Text>
                            {isSelected && <Text style={styles.activeLabel}>Current</Text>}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60, // Padding for safe area / status bar
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 5,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 40,
    },
    timeSlot: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1, // subtle shadow for android
        shadowColor: '#000', // shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    selectedTimeSlot: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        borderWidth: 2,
    },
    timeText: {
        fontSize: 18,
        color: '#334155',
        fontWeight: '500',
    },
    selectedTimeText: {
        color: '#1d4ed8',
        fontWeight: 'bold',
    },
    activeLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    }
});