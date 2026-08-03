import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceholder from './ShimmerPlaceholder.js';

const COLUMN_WIDTHS = [70, 150, 140, 120, 180, 100];

export default function ReportTableSkeleton({ rowCount = 6 }) {
    return (
        <View>
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
                <View
                    key={rowIdx}
                    style={[
                        styles.row,
                        rowIdx === rowCount - 1 && { borderBottomWidth: 0 },
                    ]}
                >
                    {COLUMN_WIDTHS.map((w, colIdx) => (
                        <View key={colIdx} style={{ width: w, paddingRight: 12 }}>
                            <ShimmerPlaceholder height={12} width={w - 20} />
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E7E7F3',
    },
});