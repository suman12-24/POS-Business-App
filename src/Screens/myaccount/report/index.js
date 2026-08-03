import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
    StyleSheet,
    Platform,
    Modal,
    PermissionsAndroid
} from 'react-native';
import { useSelector } from 'react-redux';
import { showToastMsg } from '../../../Service/localStorage';
import { postWithToken } from '../../../Service/service';
import { Container } from 'react-native-basic-elements';
import AccountSidebar from '../accountSidebar';
import Styles from '../style';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import ReportTableSkeleton from './ReportTableSkeleton';
import useTranslation from '../../../Hooks/useTranslation';
import RNBlobUtil from 'react-native-blob-util';
import { useAppTheme } from '../../../Hooks/useAppTheme';
const TABLET_BREAKPOINT = 768;

/* ---------------------------------------------------
   COLORS
--------------------------------------------------- */
const COLORS = {
    border: '#E7E7F3',
    bg: '#F5F5FA',
    text: '#1F2937',
};

/* ---------------------------------------------------
   TABLE COLUMN WIDTHS
   (single source of truth so header + body can never drift apart)
--------------------------------------------------- */
const COLUMN_WIDTHS = {
    orderId: 150,
    date: 250,
    name: 200,
    phone: 150,
    // email: 180,
    total: 150,
};

/* ---------------------------------------------------
   PAGINATION CONFIG
--------------------------------------------------- */
const PAGE_SIZE = 10;

/* ---------------------------------------------------
   GET-REPORTS API HELPERS
--------------------------------------------------- */
const PERIOD_OPTIONS = ['DAILY', 'WEEKLY', 'MONTHLY', 'OTHERS'];

const SEARCH_TYPE_BY_PERIOD = {
    DAILY: 1,
    WEEKLY: 2,
    MONTHLY: 3,
    OTHERS: 4,
};

/* Order source radio options.
   value -> what gets sent to the API as `search_order_source`
   key   -> translation key used for the on-screen label
   text  -> plain-text fallback used in the exported CSV */
const ORDER_SOURCE_OPTIONS = [
    { value: 1, key: 'WEB_APP', text: 'Web App' },
    { value: 2, key: 'WAITER', text: 'Waiter' },
    { value: 3, key: 'POS', text: 'POS' },
    { value: 4, key: 'APP', text: 'App' },
];

const getOrderSourceText = (value) => {
    const found = ORDER_SOURCE_OPTIONS.find((opt) => opt.value === value);
    return found ? found.text : value;
};

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

const formatDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseDate = (value) => {
    if (typeof value === 'string') {
        const parts = value.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
    }
    return new Date();
};

const addDays = (d, days) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
};

/* Subtract exactly one calendar month, clamping the day if the target
   month is shorter (e.g. Mar 31 -> Feb 28/29) instead of rolling over. */
const subtractOneMonth = (d) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const targetMonthRaw = month - 1;
    const targetYear = targetMonthRaw < 0 ? year - 1 : year;
    const targetMonth = (targetMonthRaw + 12) % 12;

    // Day 0 of (targetMonth + 1) = last day of targetMonth
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(day, lastDayOfTargetMonth);

    return new Date(targetYear, targetMonth, targetDay);
};

/**
 * Daily   -> today only
 * Weekly  -> last 7 days up to and including today (today - 6  ...  today)
 * Monthly -> exactly one calendar month back, up to and including today
 *            (e.g. Aug 3 -> Jul 3 ... Aug 3), clamped for short months
 */
const getRangeForPeriod = (period) => {
    const today = new Date();
    switch (period) {
        case 'DAILY':
            return { from: formatDate(today), to: formatDate(today) };
        case 'WEEKLY':
            return { from: formatDate(addDays(today, -6)), to: formatDate(today) };
        case 'MONTHLY':
            return { from: formatDate(subtractOneMonth(today)), to: formatDate(today) };
        default:
            return { from: formatDate(today), to: formatDate(today) };
    }
};

const pickField = (row, keys, fallback = '') => {
    for (const key of keys) {
        if (row && row[key] !== undefined && row[key] !== null) {
            return row[key];
        }
    }
    return fallback;
};

/* ---------------------------------------------------
   CSV EXPORT HELPERS
--------------------------------------------------- */
const CSV_HEADERS = ['Order ID', 'Date', 'Name', 'Phone No', 'Email', 'Order Total', 'Report Type', 'Source of Order'];

const escapeCsvValue = (value) => {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const rowToCsvLine = (row, idx, period, orderSourceText) => {
    const id = pickField(row, ['order_id', 'id'], `#${idx + 1}`);
    const date = pickField(row, ['date', 'created_at', 'order_date']);
    const name = pickField(row, ['buyername', 'name', 'customer_name']);
    const phone = pickField(row, ['buyerphone', 'phone', 'cel', 'phone_no']);
    const email = pickField(row, ['buyeremail', 'email']);
    const total = pickField(row, ['total', 'order_total', 'amount']);
    return [id, date, name, phone, email, total, period, orderSourceText].map(escapeCsvValue).join(',');
};

const buildCsvContent = (rows, period, orderSourceText) => {
    const lines = [CSV_HEADERS.join(',')];
    rows.forEach((row, idx) => lines.push(rowToCsvLine(row, idx, period, orderSourceText)));
    return lines.join('\n');
};

const buildCsvFileName = (period, fromDate, toDate) =>
    `report_${period}_${fromDate}_to_${toDate}.csv`.replace(/\s+/g, '_');

/* ---------------------------------------------------
   REUSABLE RADIO BUTTON
--------------------------------------------------- */
const RadioOption = ({ label, selected, onPress, styles }) => (
    <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
);

/* ---------------------------------------------------
   DATE INPUT
--------------------------------------------------- */
const DateField = ({ label, value, editable, onPress, styles }) => (
    <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity
            style={[styles.dateInput, !editable && { opacity: 0.6 }]}
            activeOpacity={0.7}
            disabled={!editable}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }} pointerEvents="none">
                <Text style={styles.dateText}>{value}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
            </View>
        </TouchableOpacity>
    </View>
);

/* ---------------------------------------------------
   FILTER CARD
--------------------------------------------------- */
function FilterCard({
    period,
    setPeriod,
    orderSource,
    setOrderSource,
    fromDate,
    toDate,
    onPressFromDate,
    onPressToDate,
    onGenerate,
    generating,
}) {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>{t('REPORT')}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.sectionLabel}>{t('ORDER_SOURCE')}</Text>
                <View style={[styles.radioGroupRow, { marginBottom: 16 }]}>
                    {ORDER_SOURCE_OPTIONS.map((opt) => (
                        <RadioOption
                            key={opt.value}
                            label={t(opt.key)}
                            selected={orderSource === opt.value}
                            onPress={() => setOrderSource(opt.value)}
                            styles={styles}
                        />
                    ))}
                </View>

                <Text style={styles.sectionLabel}>{t('OTHERS')}</Text>
                <View style={styles.radioGroupRow}>
                    {PERIOD_OPTIONS.map((opt) => (
                        <RadioOption
                            key={opt}
                            label={t(opt)}
                            selected={period === opt}
                            onPress={() => setPeriod(opt)}
                            styles={styles}
                        />
                    ))}
                </View>
                <View style={styles.filterRow}>
                    {period === 'OTHERS' && (
                        <>
                            <DateField
                                label={t('FROM_DATE')}
                                value={fromDate}
                                editable={true}
                                onPress={onPressFromDate}
                                styles={styles}
                            />
                            <View style={{ width: 16 }} />
                            <DateField
                                label={t('TO_DATE')}
                                value={toDate}
                                editable={true}
                                onPress={onPressToDate}
                                styles={styles}
                            />
                            <View style={{ width: 16 }} />
                        </>
                    )}
                    <TouchableOpacity
                        style={styles.generateBtn}
                        activeOpacity={0.85}
                        onPress={onGenerate}
                        disabled={generating}
                    >
                        <Text style={styles.generateBtnText}>
                            {generating ? t('GENERATING') : t('GENERATE_REPORT')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

/* ---------------------------------------------------
   PAGINATION BAR
--------------------------------------------------- */
function PaginationBar({ currentPage, totalPages, totalRows, pageSize, onPrev, onNext, onGoTo }) {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    // Build a compact page-number list: first, last, current +/-1, with ellipses.
    // Moved above the early return so this hook always runs, regardless of totalRows.
    const pageNumbers = useMemo(() => {
        const pages = [];
        const addPage = (p) => {
            if (!pages.includes(p)) pages.push(p);
        };

        addPage(1);
        for (let p = currentPage - 1; p <= currentPage + 1; p++) {
            if (p > 1 && p < totalPages) addPage(p);
        }
        if (totalPages > 1) addPage(totalPages);

        return pages.sort((a, b) => a - b);
    }, [currentPage, totalPages]);

    if (totalRows === 0) {
        return null;
    }

    const startRow = (currentPage - 1) * pageSize + 1;
    const endRow = Math.min(currentPage * pageSize, totalRows);

    return (
        <View style={styles.paginationBar}>
            <Text style={styles.paginationSummary}>
                {t('SHOWING')} {startRow}-{endRow} of {totalRows}
            </Text>

            <View style={styles.paginationControls}>
                <TouchableOpacity
                    style={[styles.pageNavBtn, currentPage === 1 && styles.pageNavBtnDisabled]}
                    onPress={onPrev}
                    disabled={currentPage === 1}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.pageNavText, currentPage === 1 && styles.pageNavTextDisabled]}>
                        {t('PREVIOUS')}
                    </Text>
                </TouchableOpacity>

                <View style={styles.pageNumbersRow}>
                    {pageNumbers.map((p, idx) => {
                        const prevP = pageNumbers[idx - 1];
                        const showEllipsis = idx > 0 && p - prevP > 1;
                        return (
                            <React.Fragment key={p}>
                                {showEllipsis && <Text style={styles.pageEllipsis}>…</Text>}
                                <TouchableOpacity
                                    style={[styles.pageNumBtn, p === currentPage && styles.pageNumBtnActive]}
                                    onPress={() => onGoTo(p)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.pageNumText,
                                            p === currentPage && styles.pageNumTextActive,
                                        ]}
                                    >
                                        {p}
                                    </Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.pageNavBtn, currentPage === totalPages && styles.pageNavBtnDisabled]}
                    onPress={onNext}
                    disabled={currentPage === totalPages}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[styles.pageNavText, currentPage === totalPages && styles.pageNavTextDisabled]}
                    >
                        {t('NEXT')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ---------------------------------------------------
   TABLE (download button + table + pagination share one card)
--------------------------------------------------- */
function ReportTable({ rows, loading, period, orderSource, fromDate, toDate, onFetchExportRows }) {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [currentPage, setCurrentPage] = useState(1);
    const [downloading, setDownloading] = useState(false);

    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

    // Whenever the underlying data set changes (new report generated), snap back to page 1.
    useEffect(() => {
        setCurrentPage(1);
    }, [rows]);

    // Guard against being stuck on a page that no longer exists (e.g. fewer rows now).
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return rows.slice(start, start + PAGE_SIZE);
    }, [rows, currentPage]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Re-fetch fresh data from the get-reports API (with current
            // filters + pageNo: 1) rather than exporting whatever happens
            // to be loaded on screen, so the CSV always matches the
            // selected Report Type + Source of Order.
            const exportRows = await onFetchExportRows();

            if (!exportRows || !exportRows.length) {
                showToastMsg('No data available to download');
                return;
            }

            const csvContent = buildCsvContent(exportRows, period, getOrderSourceText(orderSource));
            const fileName = buildCsvFileName(period, fromDate, toDate);

            if (Platform.OS === 'android') {
                if (Platform.Version <= 28) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission',
                            message: 'App needs access to storage to download the report',
                            buttonPositive: 'OK',
                        },
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        showToastMsg('Storage permission is required to download the report');
                        setDownloading(false);
                        return;
                    }
                }
                const downloadPath = `${RNBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
                await RNFS.writeFile(downloadPath, csvContent, 'utf8');
                await RNBlobUtil.android.addCompleteDownload({
                    title: fileName,
                    description: 'Report download complete',
                    mime: 'text/csv',
                    path: downloadPath,
                    showNotification: true,
                });
                showToastMsg(`Saved to Downloads/${fileName}`);

            } else {
                const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                await RNFS.writeFile(filePath, csvContent, 'utf8');
                showToastMsg(`Saved to Files app > On My iPhone > ${fileName}`);
            }
        } catch (error) {
            console.log('CSV download error: ', error);
            showToastMsg(error?.message || 'Something went wrong while downloading the report');
        } finally {
            setDownloading(false);
        }
    };
    return (
        <View style={styles.tableCard}>
            <View style={styles.downloadRow}>
                <TouchableOpacity
                    style={styles.downloadBtn}
                    activeOpacity={0.85}
                    disabled={loading || downloading}
                    onPress={handleDownload}
                >
                    <Text style={styles.downloadBtnText}>
                        {downloading ? t('PREPARING') + '...' : t('DOWNLOAD_REPORT')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, minWidth: '100%' }}
            >
                <View style={{ flex: 1 }}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, { width: COLUMN_WIDTHS.orderId }]}>{t('ORDERID')}</Text>
                        <Text style={[styles.th, { width: COLUMN_WIDTHS.date }]}>{t('DATE')}</Text>
                        <Text style={[styles.th, { width: COLUMN_WIDTHS.name }]}>{t('NAME_TEXT')}</Text>
                        <Text style={[styles.th, { width: COLUMN_WIDTHS.phone }]}>{t('PHONENO')}</Text>
                        {/* <Text style={[styles.th, { width: COLUMN_WIDTHS.email }]}>{t('EMAIL')}</Text> */}
                        <Text style={[styles.th, { width: COLUMN_WIDTHS.total }]}>{t('ORDER_TOTAL')}</Text>
                    </View>

                    <ScrollView>
                        {loading ? (
                            <ReportTableSkeleton rowCount={6} />
                        ) : totalRows === 0 ? (
                            <View style={styles.emptyRow}>
                                <Text style={styles.emptyText}>{t('NO_ORDER_FOUND')}.</Text>
                            </View>
                        ) : (
                            paginatedRows.map((row, idx) => {
                                const id = pickField(row, ['order_id', 'id'], `#${idx + 1}`);
                                return (
                                    <View
                                        key={`${id}-${idx}`}
                                        style={[
                                            styles.tableRow,
                                            idx === paginatedRows.length - 1 && { borderBottomWidth: 0 },
                                        ]}
                                    >
                                        <Text style={[styles.td, { width: COLUMN_WIDTHS.orderId }]}>#{id}</Text>
                                        <Text style={[styles.td, { width: COLUMN_WIDTHS.date }]}>
                                            {pickField(row, ['date', 'created_at', 'order_date'])}
                                        </Text>
                                        <Text style={[styles.td, { width: COLUMN_WIDTHS.name }]}>
                                            {pickField(row, ['buyername', 'name', 'customer_name'])}
                                        </Text>
                                        <Text style={[styles.td, { width: COLUMN_WIDTHS.phone }]}>
                                            {pickField(row, ['buyerphone', 'phone', 'cel', 'phone_no'])}
                                        </Text>
                                        {/* <Text style={[styles.td, { width: COLUMN_WIDTHS.email }]}>
                                            {pickField(row, ['buyeremail', 'email'])}
                                        </Text> */}
                                        <Text style={[styles.td, styles.tdBold, { width: COLUMN_WIDTHS.total }]}>
                                            {pickField(row, ['total', 'order_total', 'amount'])}
                                        </Text>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            {!loading && (
                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRows={totalRows}
                    pageSize={PAGE_SIZE}
                    onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    onGoTo={(p) => setCurrentPage(p)}
                />
            )}
        </View>
    );
}

/* ---------------------------------------------------
   ROOT SCREEN
--------------------------------------------------- */
export default function ReportScreen({ navigation }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= TABLET_BREAKPOINT;
    const theme = useAppTheme();
    const accountStyles = Styles(isTablet, theme);
    const styles = useMemo(() => getStyles(theme), [theme]);
    const { baseUrl, userToken, userData, langId } = useSelector(state => state.common);
    const { t } = useTranslation();
    const [period, setPeriod] = useState('DAILY');
    const [orderSource, setOrderSource] = useState(ORDER_SOURCE_OPTIONS[0].value); // 1 = Web App selected by default
    const initialRange = getRangeForPeriod('DAILY');
    const [fromDate, setFromDate] = useState(initialRange.from);
    const [toDate, setToDate] = useState(initialRange.to);
    const [orderRows, setOrderRows] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [viewloader, setLoader] = useState(false);

    const [activePicker, setActivePicker] = useState(null);

    // Single source of truth for the get-reports request body, used both
    // for the on-screen "Generate Report" flow and the CSV export flow.
    const buildReportPayload = (activePeriod, activeFrom, activeTo, activeOrderSource, pageNo = 1) => ({
        lang_id: langId,
        search_type: SEARCH_TYPE_BY_PERIOD[activePeriod],
        from_date: activeFrom,
        to_date: activeTo,
        search_order_source: activeOrderSource,
        pageNo,
    });

    const extractRows = (response) =>
        Array.isArray(response.today)
            ? response.today
            : Array.isArray(response.data?.today)
                ? response.data.today
                : Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.orders)
                        ? response.data.orders
                        : [];

    // The API returns results one page at a time (per `pageNo`). If it tells
    // us the total record count / total pages, trust that; otherwise fall
    // back to "keep going until a page comes back short or empty."
    const extractTotalCount = (response) =>
        response.total_count ?? response.data?.total_count ??
        response.total ?? response.data?.total ??
        response.totalRecords ?? response.data?.totalRecords ??
        null;

    const MAX_PAGES_SAFETY_CAP = 200;

    // Loops through get-reports pageNo=1,2,3... and merges every page into
    // one array, so callers always get the FULL result set for the current
    // filters instead of just whatever the API's own page size caps out at.
    const fetchAllReportRows = (activePeriod, activeFrom, activeTo, activeOrderSource) => {
        const allRows = [];
        let pageNo = 1;
        let knownTotal = null;
        let lastPageSize = null;

        const fetchNextPage = () =>
            postWithToken(
                baseUrl,
                'get-reports',
                buildReportPayload(activePeriod, activeFrom, activeTo, activeOrderSource, pageNo),
                userToken,
            ).then((response) => {
                if (response.status !== true) {
                    throw new Error(response.message || 'Something went wrong, try again later');
                }

                const pageRows = extractRows(response);
                allRows.push(...pageRows);

                if (knownTotal === null) {
                    knownTotal = extractTotalCount(response);
                }
                if (lastPageSize === null && pageRows.length > 0) {
                    lastPageSize = pageRows.length;
                }

                const reachedKnownTotal = knownTotal !== null && allRows.length >= knownTotal;
                const pageWasShortOrEmpty =
                    pageRows.length === 0 || (lastPageSize !== null && pageRows.length < lastPageSize);
                const hitSafetyCap = pageNo >= MAX_PAGES_SAFETY_CAP;

                if (reachedKnownTotal || pageWasShortOrEmpty || hitSafetyCap) {
                    return allRows;
                }

                pageNo += 1;
                return fetchNextPage();
            });

        return fetchNextPage();
    };

    const generateReport = ({
        periodOverride,
        fromOverride,
        toOverride,
        orderSourceOverride,
    } = {}) => {
        const activePeriod = periodOverride ?? period;
        const activeFrom = fromOverride ?? fromDate;
        const activeTo = toOverride ?? toDate;
        const activeOrderSource = orderSourceOverride ?? orderSource;

        if (activePeriod === 'OTHERS') {
            const dateReg = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateReg.test(activeFrom) || !dateReg.test(activeTo)) {
                showToastMsg('Please enter valid From/To dates (YYYY-MM-DD)');
                return;
            }
        }

        setGenerating(true);
        setLoader(true);

        fetchAllReportRows(activePeriod, activeFrom, activeTo, activeOrderSource)
            .then((rows) => {
                setGenerating(false);
                setLoader(false);
                setOrderRows(rows);
            })
            .catch(error => {
                console.log('Error : ', error);
                setGenerating(false);
                setLoader(false);
                showToastMsg(error?.message || 'Something went wrong, try again later');
            });
    };

    // Called by ReportTable's Download button. Hits the dedicated export
    // endpoint (get-reports/export) with the current filters, which is
    // expected to return the complete dataset for those filters in one
    // shot (no manual page-looping needed here, unlike the on-screen table).
    const fetchExportRows = ({
        periodOverride,
        fromOverride,
        toOverride,
        orderSourceOverride,
    } = {}) => {
        const activePeriod = periodOverride ?? period;
        const activeFrom = fromOverride ?? fromDate;
        const activeTo = toOverride ?? toDate;
        const activeOrderSource = orderSourceOverride ?? orderSource;

        return postWithToken(
            baseUrl,
            'get-reports/export',
            buildReportPayload(activePeriod, activeFrom, activeTo, activeOrderSource, 1),
            userToken,
        ).then((response) => {
            if (response.status !== true) {
                throw new Error(response.message || 'Something went wrong, try again later');
            }
            return extractRows(response);
        });
    };

    useEffect(() => {
        if (period !== 'OTHERS') {
            const range = getRangeForPeriod(period);
            setFromDate(range.from);
            setToDate(range.to);
            generateReport({ periodOverride: period, fromOverride: range.from, toOverride: range.to });
        } else {
            const today = formatDate(new Date());
            setFromDate(today);
            setToDate(today);
            // Load today's data by default, same as Daily — user can then
            // adjust the From/To fields and hit Generate for a custom range.
            generateReport({ periodOverride: 'OTHERS', fromOverride: today, toOverride: today });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]);
    const isFirstOrderSourceRender = useRef(true);
    useEffect(() => {
        if (isFirstOrderSourceRender.current) {
            isFirstOrderSourceRender.current = false;
            return;
        }
        if (period !== 'OTHERS') {
            generateReport({ orderSourceOverride: orderSource });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderSource]);

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setActivePicker(null);
        }
        if (event.type === 'dismissed' || !selectedDate) {
            return;
        }
        const formatted = formatDate(selectedDate);
        if (activePicker === 'from') {
            setFromDate(formatted);
        } else if (activePicker === 'to') {
            setToDate(formatted);
        }
    };

    return (
        <Container style={accountStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={accountStyles.scrollContent}
            >
                <View style={accountStyles.main}>
                    {/* LEFT SIDEBAR */}
                    <View style={accountStyles.inner_left}>
                        <AccountSidebar
                            isTablet={isTablet}
                            userData={userData}
                            navigation={navigation}
                            selectedKey="report"
                        />
                    </View>

                    {/* RIGHT CONTENT */}
                    <View style={accountStyles.inner_right}>
                        <FilterCard
                            period={period}
                            setPeriod={setPeriod}
                            orderSource={orderSource}
                            setOrderSource={setOrderSource}
                            fromDate={fromDate}
                            toDate={toDate}
                            onPressFromDate={() => setActivePicker('from')}
                            onPressToDate={() => setActivePicker('to')}
                            onGenerate={() => generateReport()}
                            generating={generating}
                        />
                        <ReportTable
                            rows={orderRows}
                            loading={generating || viewloader}
                            period={period}
                            orderSource={orderSource}
                            fromDate={fromDate}
                            toDate={toDate}
                            onFetchExportRows={fetchExportRows}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* DATE PICKER (IOS MODAL / ANDROID NATIVE) */}
            {activePicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        transparent
                        animationType="slide"
                        visible={!!activePicker}
                        onRequestClose={() => setActivePicker(null)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setActivePicker(null)}
                        >
                            <View style={styles.pickerContainer}>
                                <TouchableOpacity
                                    style={styles.doneBtn}
                                    onPress={() => setActivePicker(null)}
                                >
                                    <Text style={styles.doneBtnText}>{t('DONE')}</Text>
                                </TouchableOpacity>
                                <DateTimePicker
                                    value={parseDate(activePicker === 'from' ? fromDate : toDate)}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDateChange}
                                    accentColor={theme.primary}
                                    textColor={theme.primary}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={parseDate(activePicker === 'from' ? fromDate : toDate)}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        accentColor={theme.primary}
                    />
                )
            )}
        </Container>
    );
}

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */
const getStyles = (theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        marginBottom: 16,
        marginRight: 10
    },
    cardHeader: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: theme.primary
    },
    cardHeaderText: {
        color: theme.fontColor,
        fontSize: 16,
        fontWeight: '700',
    },
    cardBody: {
        padding: 16,
    },

    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.fontColorOnBackground,
        marginBottom: 10,
    },

    radioGroupRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 18,
        rowGap: 10,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#C7C7D9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    radioOuterActive: {
        borderColor: theme.primary,
    },
    radioInner: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: theme.primary,
    },
    radioLabel: {
        fontSize: 13,
        color: theme.fontColorOnBackground,
    },

    /* Date fields + Generate button, all in one row */
    filterRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 18,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.fontColorOnBackground,
        marginBottom: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.background,
    },
    dateText: {
        flex: 1,
        fontSize: 13,
        color: theme.fontColorOnBackground,
        padding: 0,
    },
    calendarIcon: {
        fontSize: 14,
    },

    generateBtn: {
        backgroundColor: theme.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    generateBtnText: {
        color: theme.fontColor,
        fontWeight: '700',
        fontSize: 13,
    },

    /* Table card wraps the download button, table, and pagination bar */
    tableCard: {
        flex: 1,
        backgroundColor: theme.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        marginRight: 10
    },
    downloadRow: {
        alignItems: 'flex-end',
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 10,
    },
    downloadBtn: {
        backgroundColor: theme.primary,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    downloadBtnText: {
        color: theme.fontColor,
        fontWeight: '600',
        fontSize: 12,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFC',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    th: {
        fontWeight: '700',
        fontSize: 18,
        color: COLORS.text,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderBottomWidth: 1.2,
        borderBottomColor: COLORS.border,
    },
    td: {
        fontSize: 14,
        color: theme.fontColorOnBackground,
    },
    tdBold: {
        fontWeight: '700',
    },
    emptyRow: {
        paddingVertical: 24,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: theme.fontColorOnBackground,
    },

    /* ---------------------------------------------------
       PAGINATION BAR
    --------------------------------------------------- */
    paginationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 10,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: theme.background,
    },
    paginationSummary: {
        fontSize: 13,
        color: theme.fontColorOnBackground,
    },
    paginationControls: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    pageNavBtn: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    pageNavBtnDisabled: {
        opacity: 0.4,
    },
    pageNavText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.primary,
    },
    pageNavTextDisabled: {
        color: theme.fontColorOnBackground,
    },
    pageNumbersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 4,
        marginHorizontal: 4,
    },
    pageNumBtn: {
        minWidth: 30,
        height: 30,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    pageNumBtnActive: {
        backgroundColor: theme.primary,
    },
    pageNumText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.fontColorOnBackground,
    },
    pageNumTextActive: {
        color: theme.fontColor,
    },
    pageEllipsis: {
        fontSize: 13,
        color: theme.fontColorOnBackground,
        marginHorizontal: 2,
    },

    /* Modal styles for iOS date picker */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    pickerContainer: {
        backgroundColor: theme.background,
        paddingBottom: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    doneBtn: {
        alignSelf: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    doneBtnText: {
        color: theme.primary,
        fontWeight: '700',
        fontSize: 16,
    },
});