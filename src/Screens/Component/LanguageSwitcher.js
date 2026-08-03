import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setLangId, setLanguageStrings, setIsLanguageLoading } from '../../Store/Reducers/CommonReducer';
import { fetchLanguageStrings, persistLanguageSelection } from '../../Service/languageService';

export default function LanguageSwitcher() {
    const [visible, setVisible] = useState(false);
    const dispatch = useDispatch();
    const { languagesList, langId, baseUrl, user_slug, userToken } = useSelector(
        (state) => state.common
    );

    // Looked up once per render and reused by both the trigger button
    // (closed state) and the checkmark logic inside the list (open state),
    // so the flag/name shown always matches the currently applied language.
    const selectedLanguage = languagesList.find((l) => l.id === langId);

    const handleSelectLanguage = async (item) => {
        setVisible(false);
        dispatch(setIsLanguageLoading(true));

        const strings = await fetchLanguageStrings(baseUrl, user_slug, item.id, userToken);
        if (Object.keys(strings).length > 0) {
            dispatch(setLangId(item.id));
            dispatch(setLanguageStrings(strings));
            await persistLanguageSelection(item.id, strings);
        }
        dispatch(setIsLanguageLoading(false));
    };

    return (
        <>
            <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
                {selectedLanguage?.image_path ? (
                    <Image
                        source={{ uri: selectedLanguage.image_path }}
                        style={styles.flagIcon}
                        resizeMode="cover"
                    />
                ) : (
                    <Ionicons name="language-outline" size={20} color="#3D2FC9" />
                )}
                <Text style={styles.triggerText}>
                    {selectedLanguage?.name || 'Language'}
                </Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>Select a Language</Text>
                        <FlatList
                            data={languagesList}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.row} onPress={() => handleSelectLanguage(item)}>
                                    <View style={styles.rowLeft}>
                                        {item.image_path ? (
                                            <Image
                                                source={{ uri: item.image_path }}
                                                style={styles.flagIcon}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.flagIcon, styles.flagFallback]} />
                                        )}
                                        <Text style={styles.rowText}>{item.name}</Text>
                                    </View>
                                    {item.id === langId && (
                                        <Ionicons name="checkmark-circle" size={20} color="#3D2FC9" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
    triggerText: { fontSize: 14, color: '#1A1D29', fontWeight: '600' },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 16,
    },
    sheet: {
        width: 200,
        maxHeight: 260,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    sheetTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#1A1D29' },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF0F5',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    flagIcon: {
        width: 20,
        height: 20,
        borderRadius: 2,
    },
    flagFallback: {
        backgroundColor: '#EEF0F5',
    },
    rowText: { fontSize: 14, color: '#1A1D29' },
});