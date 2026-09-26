import type { ScanPreview } from '../src/scan-preview';
import { PrescriptionScan } from '../src/prescription-scan';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSession } from '../src/session';
import {
  MedicineImage,
  MedicineSearch,
  CategoryFilter,
} from '../src/medicine-search';
import type { Request as CatalogRequest } from '../src/prescription-model';
import { ClientError } from '../src/client';
import { Prescriptions } from '../src/prescriptions';
import { Landing } from '../src/landing';
import { registrationError } from '../src/registration';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PharmacyScreen, AddStock, Tile } from '../src/pharmacy';
type Medicine = {
  boxImageUrl?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  id: string;
  name: string;
  genericName: string | null;
  strength: string | null;
  dosageForm: string | null;
  source?: string | null;
  description?: string | null;
};
type Course = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
};
type Occurrence = {
  occurrenceId: string;
  scheduledAt: string;
  timezone: string;
  eligible: boolean;
  event: { status: string } | null;
};
type CourseDetail = Course & {
  medications: {
    id: string;
    medicineId: string;
    dose: string;
    doseUnit: string;
    instructions: string | null;
    schedules: { id: string; occurrences: Occurrence[] }[];
  }[];
};
type Notice = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  data: { treatmentId: string };
};
type Flags = {
  doseReminders: boolean;
  expiryReminders: boolean;
  lowStockAlerts: boolean;
  sharingNotifications: boolean;
  systemNotifications: boolean;
};
type Result<T> = { data: T; meta: { totalPages?: number; total?: number } };
const initial: Flags = {
  doseReminders: false,
  expiryReminders: false,
  lowStockAlerts: false,
  sharingNotifications: false,
  systemNotifications: false,
};
const labels: Record<keyof Flags, string> = {
  doseReminders: 'Dose reminders',
  expiryReminders: 'Expiry reminders',
  lowStockAlerts: 'Low stock alerts',
  sharingNotifications: 'Sharing updates',
  systemNotifications: 'System updates',
};
const color = {
  ink: '#172321',
  muted: '#667371',
  green: '#087F7B',
  soft: '#DDF4F1',
  bg: '#F8FAF9',
  border: '#E4EAE8',
};
function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress(): void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondary,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text
        style={{
          color: secondary ? color.green : '#fff',
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChangeText,
  password = false,
}: {
  label: string;
  value: string;
  onChangeText(value: string): void;
  password?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={password}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}
export default function Home() {
  const { client, ready, signedIn, setSignedIn } = useSession();
  const [landing, setLanding] = useState(true);
  const [tab, setTab] = useState('Home'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const prescriptionScrollTop = useCallback(
    () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
    [],
  );
  const [showActions, setShowActions] = useState(false);
  function navigate(name: string) {
    setBoxScan(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setTab(name);
    setPage(1);
    setPages(1);
    setDetail(null);
    setMedicine(null);
    setError('');
    setShowActions(false);
  }
  const actionLock = useRef(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [register, setRegister] = useState(false),
    [identifier, setIdentifier] = useState(''),
    [password, setPassword] = useState(''),
    [firstName, setFirstName] = useState(''),
    [lastName, setLastName] = useState('');
  const catalogApi: CatalogRequest = useCallback(
    <T,>(path: string) => client.request<{ data: T }>(path),
    [client],
  );
  const [category, setCategory] = useState('');
  const [boxScan, setBoxScan] = useState<ScanPreview | null>(null);
  const [search, setSearch] = useState(''),
    [term, setTerm] = useState(''),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([]),
    [courses, setCourses] = useState<Course[]>([]),
    [notices, setNotices] = useState<Notice[]>([]),
    [detail, setDetail] = useState<CourseDetail | null>(null),
    [medicine, setMedicine] = useState<Medicine | null>(null);
  const [flags, setFlags] = useState<Flags>(initial),
    [configured, setConfigured] = useState(false),
    [revision, setRevision] = useState(0);
  const report = useCallback(
    (e: unknown) => {
      if (e instanceof ClientError && e.status === 401) {
        setSignedIn(false);
        setPassword('');
        setDetail(null);
        setMedicine(null);
        setCourses([]);
        setNotices([]);
        setMedicines([]);
      }
      setError(
        e instanceof ClientError
          ? ({
              AUTH_INVALID_CREDENTIALS:
                'Check your email or phone and password.',
              VALIDATION_ERROR: 'Check your entries and try again.',
              AUTH_RATE_LIMITED:
                'Too many attempts. Please wait before trying again.',
              RESOURCE_NOT_FOUND: 'This item is no longer available.',
            }[e.code] ?? `Request could not be completed (${e.code}).`)
          : 'Connection interrupted. Try again. If sign-in expired, sign in again.',
      );
    },
    [setSignedIn],
  );
  const reload = () => setRevision((n) => n + 1);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') setRevision((n) => n + 1);
    });
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (!signedIn || landing) return;
    let active = true;
    setLoading(true);
    setError('');
    setPreferencesLoaded(false);
    const load = async () => {
      if (tab === 'Medicines') {
        const r = await client.request<Result<Medicine[]>>(
          `/medicines?page=${page}&limit=20${term ? `&q=${encodeURIComponent(term)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
        );
        if (active) {
          setMedicines(r.data);
          setPages(r.meta.totalPages ?? 1);
        }
      }
      if (tab === 'Treatments') {
        const r = await client.request<Result<Course[]>>(
          `/me/treatments?page=${page}&limit=20`,
        );
        if (active) {
          setCourses(r.data);
          setPages(r.meta.totalPages ?? 1);
        }
      }
      if (tab === 'Inbox') {
        const r = await client.request<Result<Notice[]>>(
          `/me/notifications?page=${page}&limit=20`,
        );
        if (active) {
          setNotices(r.data);
          setPages(r.meta.totalPages ?? 1);
        }
      }
      if (tab === 'Settings') {
        const r = await client.request<
          Result<{ configured: boolean; preferences: Flags | null }>
        >('/me/notification-preferences');
        if (active) {
          setPreferencesLoaded(true);
          setConfigured(r.data.configured);
          setFlags(
            r.data.preferences
              ? {
                  doseReminders: r.data.preferences.doseReminders,
                  expiryReminders: r.data.preferences.expiryReminders,
                  lowStockAlerts: r.data.preferences.lowStockAlerts,
                  sharingNotifications: r.data.preferences.sharingNotifications,
                  systemNotifications: r.data.preferences.systemNotifications,
                }
              : initial,
          );
        }
      }
    };
    load()
      .catch((e) => {
        if (active) report(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [signedIn, landing, tab, term, category, page, revision, client, report]);
  useEffect(() => {
    if (landing || signedIn) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      setLanding(true);
      setError('');
      setPassword('');
      return true;
    });
    return () => listener.remove();
  }, [landing, signedIn]);
  async function action(work: () => Promise<void>) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (e) {
      report(e);
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }
  async function openTreatment(id: string) {
    const r = await client.request<Result<CourseDetail>>(
      `/me/treatments/${encodeURIComponent(id)}`,
    );
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setDetail(r.data);
    setMedicine(null);
  }
  function record(occurrence: Occurrence, status: 'TAKEN' | 'SKIPPED') {
    Alert.alert(
      status === 'TAKEN'
        ? 'Record this dose as taken?'
        : 'Record this dose as skipped?',
      'This record cannot be edited in the app. It does not change your prescribed schedule.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () =>
            void action(async () => {
              await client.request('/me/medication-events', 'POST', {
                occurrenceId: occurrence.occurrenceId,
                status,
              });
              if (detail) await openTreatment(detail.id);
            }),
        },
      ],
    );
  }
  if (!ready)
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator accessibilityLabel="Restoring session" />
      </SafeAreaView>
    );
  if (landing)
    return (
      <Landing
        signedIn={signedIn}
        onStart={() => {
          setRegister(true);
          setLanding(false);
          navigate('Home');
        }}
        onSignIn={() => {
          setRegister(false);
          setLanding(false);
          navigate('Home');
        }}
      />
    );
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.brand}>Saydaliyati</Text>
            <Text style={[styles.muted, { fontSize: 12 }]}>
              All my medicines, in one place.
            </Text>
          </View>
          {signedIn && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open reminders"
                style={styles.headerAction}
                onPress={() => navigate('Inbox')}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={color.green}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                style={styles.headerAction}
                onPress={() => navigate('Settings')}
              >
                <Ionicons name="person-outline" size={23} color={color.green} />
              </Pressable>
            </>
          )}
        </View>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            signedIn ? (
              <RefreshControl
                refreshing={loading}
                onRefresh={() => {
                  reload();
                  if (detail) void action(() => openTreatment(detail.id));
                }}
              />
            ) : undefined
          }
        >
          {error !== '' && (
            <View accessibilityRole="alert" style={styles.error}>
              <Text style={{ color: '#8C2926' }}>{error}</Text>
              {signedIn && <Button title="Retry" secondary onPress={reload} />}
            </View>
          )}
          {!signedIn ? (
            <View style={styles.card}>
              <Button
                title="Back to introduction"
                secondary
                onPress={() => {
                  setLanding(true);
                  setError('');
                  setPassword('');
                }}
              />
              <Text style={styles.title}>
                {register ? 'Create your account' : 'Welcome back'}
              </Text>
              <Text style={styles.muted}>
                Keep your medicines and treatment records together.
              </Text>
              {register && (
                <>
                  <Field
                    label="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <Field
                    label="Last name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </>
              )}
              <Field
                label="Email or international phone number"
                value={identifier}
                onChangeText={setIdentifier}
              />
              <Field
                label={register ? 'Password (15–128 characters)' : 'Password'}
                value={password}
                onChangeText={setPassword}
                password
              />
              <Button
                title={
                  busy
                    ? 'Please wait…'
                    : register
                      ? 'Create account'
                      : 'Sign in'
                }
                disabled={busy || !identifier || !password}
                onPress={() =>
                  void action(async () => {
                    if (register) {
                      const message = registrationError({
                        firstName,
                        lastName,
                        password,
                      });
                      if (message) {
                        setError(message);
                        return;
                      }
                    }
                    const id = identifier.trim();
                    await client.signIn(
                      register
                        ? {
                            ...(id.startsWith('+')
                              ? { phone: id }
                              : { email: id }),
                            password,
                            firstName,
                            lastName,
                            preferredLanguage: 'EN',
                            timezone:
                              Intl.DateTimeFormat().resolvedOptions().timeZone,
                          }
                        : { identifier: id, password },
                      register,
                    );
                    setPassword('');
                    navigate('Home');
                    setSignedIn(true);
                    reload();
                  })
                }
              />
              <Button
                title={
                  register ? 'I already have an account' : 'Create an account'
                }
                secondary
                disabled={busy}
                onPress={() => {
                  setRegister(!register);
                  setError('');
                }}
              />
            </View>
          ) : (
            <>
              {(detail || medicine) && (
                <Button
                  title="Back to list"
                  secondary
                  onPress={() => {
                    setDetail(null);
                    setMedicine(null);
                    reload();
                  }}
                />
              )}
              {detail ? (
                <>
                  <Text style={styles.title}>{detail.name}</Text>
                  <Text style={styles.muted}>
                    {detail.status} · {detail.startDate} — {detail.endDate}
                  </Text>
                  {detail.medications.map((m) => (
                    <View key={m.id} style={styles.card}>
                      <Text style={styles.heading}>
                        {m.dose} {m.doseUnit}
                      </Text>
                      <Button
                        title="View medicine"
                        secondary
                        disabled={busy}
                        onPress={() =>
                          void action(async () => {
                            const r = await client.request<Result<Medicine>>(
                              `/medicines/${m.medicineId}`,
                            );
                            Alert.alert(
                              r.data.name,
                              [
                                r.data.genericName,
                                r.data.strength,
                                r.data.dosageForm,
                              ]
                                .filter(Boolean)
                                .join(' · '),
                            );
                          })
                        }
                      />
                      {m.instructions && <Text>{m.instructions}</Text>}
                      {m.schedules
                        .flatMap((s) => s.occurrences)
                        .map((o) => (
                          <View key={o.occurrenceId} style={styles.occurrence}>
                            <Text style={styles.label}>
                              {new Date(o.scheduledAt).toLocaleString('en', {
                                timeZone: o.timezone,
                              })}
                            </Text>
                            <Text style={styles.muted}>
                              {o.timezone} · {o.event?.status ?? 'Not recorded'}
                            </Text>
                            {o.eligible && !o.event && (
                              <View style={styles.row}>
                                <Button
                                  title="Taken"
                                  disabled={busy}
                                  onPress={() => record(o, 'TAKEN')}
                                />
                                <Button
                                  title="Skipped"
                                  secondary
                                  disabled={busy}
                                  onPress={() => record(o, 'SKIPPED')}
                                />
                              </View>
                            )}
                          </View>
                        ))}
                    </View>
                  ))}
                </>
              ) : medicine ? (
                <View style={styles.card}>
                  <MedicineImage medicine={medicine} />
                  <Text style={styles.muted}>
                    {medicine.category?.name ?? 'Uncategorized'}
                  </Text>
                  <Text style={styles.title}>{medicine.name}</Text>
                  <Text>
                    {[
                      medicine.genericName,
                      medicine.strength,
                      medicine.dosageForm,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  <Text style={styles.muted}>
                    {medicine.description ?? 'No description supplied.'}
                  </Text>
                  <Text style={styles.muted}>
                    Source: {medicine.source ?? 'Not supplied'}
                  </Text>
                  <AddStock
                    key={medicine.id}
                    medicineId={medicine.id}
                    initialScan={boxScan}
                    busy={busy}
                    save={(body) =>
                      void action(async () => {
                        await client.request('/me/inventory', 'POST', body);
                        setBoxScan(null);
                        navigate('My Pharmacy');
                        reload();
                      })
                    }
                  />
                </View>
              ) : (
                <>
                  {tab !== 'Home' && <Text style={styles.title}>{tab}</Text>}
                  {(tab === 'Home' || tab === 'My Pharmacy') && (
                    <PharmacyScreen
                      key={tab}
                      home={tab === 'Home'}
                      revision={revision}
                      navigate={navigate}
                      report={report}
                      openTreatment={(id) =>
                        void action(() => openTreatment(id))
                      }
                    />
                  )}
                  {tab === 'Prescriptions' && (
                    <Prescriptions
                      report={report}
                      revision={revision}
                      onViewChange={prescriptionScrollTop}
                    />
                  )}
                  {tab === 'More' && (
                    <>
                      <Text style={styles.muted}>
                        Everything you need, close at hand.
                      </Text>
                      <Tile
                        title="My Prescriptions"
                        subtitle="Create, attach and review prescriptions"
                        icon="document-text-outline"
                        onPress={() => navigate('Prescriptions')}
                      />
                      <Tile
                        title="Medicine catalog"
                        subtitle="Search medicines and add stock"
                        icon="search-outline"
                        onPress={() => navigate('Medicines')}
                      />
                      <Tile
                        title="My reminders"
                        subtitle="Review your in-app notifications"
                        icon="notifications-outline"
                        onPress={() => navigate('Inbox')}
                      />
                      <Tile
                        title="Settings"
                        subtitle="Reminder preferences and account"
                        icon="settings-outline"
                        onPress={() => navigate('Settings')}
                      />
                    </>
                  )}
                  {tab === 'Medicines' && (
                    <>
                      <PrescriptionScan
                        mode="box"
                        disabled={busy}
                        report={() => {}}
                        onApply={(preview) => {
                          setBoxScan(preview);
                          const name =
                            preview.medications[0]?.extractedName ?? '';
                          setSearch(name);
                          setTerm(name);
                          setCategory('');
                          setPage(1);
                          reload();
                        }}
                      />
                      <Text style={styles.muted}>
                        After scanning, select the matching catalog medicine and
                        check its strength before adding stock.
                      </Text>
                      <MedicineSearch
                        label="Search medicine names"
                        value={search}
                        onChange={setSearch}
                        api={catalogApi}
                        category={category}
                        disabled={busy}
                        onSelect={(m) =>
                          void action(async () => {
                            setMedicine(
                              (
                                await client.request<Result<Medicine>>(
                                  `/medicines/${m.id}`,
                                )
                              ).data,
                            );
                          })
                        }
                      />
                      <CategoryFilter
                        api={catalogApi}
                        value={category}
                        onChange={(value) => {
                          setCategory(value);
                          setPage(1);
                        }}
                      />
                      <Button
                        title="Search"
                        disabled={busy}
                        onPress={() => {
                          setTerm(search.trim());
                          setPage(1);
                          reload();
                        }}
                      />
                      <Text style={styles.muted}>
                        Search by brand or active ingredient.
                      </Text>
                      {medicines.map((m) => (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Open ${m.name}`}
                          key={m.id}
                          style={styles.card}
                          onPress={() =>
                            void action(async () => {
                              setMedicine(
                                (
                                  await client.request<Result<Medicine>>(
                                    `/medicines/${m.id}`,
                                  )
                                ).data,
                              );
                            })
                          }
                        >
                          <MedicineImage medicine={m} />
                          <Text style={styles.muted}>
                            {m.category?.name ?? 'Uncategorized'}
                          </Text>
                          <Text style={styles.heading}>{m.name}</Text>
                          <Text style={styles.muted}>
                            {[m.genericName, m.strength, m.dosageForm]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                        </Pressable>
                      ))}
                      {!loading && medicines.length === 0 && (
                        <Text style={styles.muted}>No medicines found.</Text>
                      )}
                    </>
                  )}
                  {tab === 'Treatments' && (
                    <>
                      <Text style={styles.muted}>
                        Review your saved schedules and record doses.
                      </Text>
                      {courses.map((c) => (
                        <Pressable
                          accessibilityRole="button"
                          key={c.id}
                          style={styles.card}
                          onPress={() => void action(() => openTreatment(c.id))}
                        >
                          <Text style={styles.heading}>{c.name}</Text>
                          <Text style={styles.muted}>
                            {c.status} · {c.startDate} — {c.endDate}
                          </Text>
                        </Pressable>
                      ))}
                      {!loading && courses.length === 0 && (
                        <View style={styles.card}>
                          <Text style={styles.heading}>No treatments yet</Text>
                          <Text style={styles.muted}>
                            Treatments created through the API will appear here.
                            Treatment creation on mobile is coming next.
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                  {tab === 'Inbox' && (
                    <>
                      <Text style={styles.muted}>
                        In-app reminders. Phone push is not connected yet.
                      </Text>
                      {notices.length > 0 && (
                        <Button
                          title="Mark all as read"
                          secondary
                          disabled={busy}
                          onPress={() =>
                            void action(async () => {
                              await client.request(
                                '/me/notifications/read-all',
                                'PATCH',
                                {},
                              );
                              reload();
                            })
                          }
                        />
                      )}
                      {notices.map((n) => (
                        <View key={n.id} style={styles.card}>
                          <Text style={styles.heading}>
                            {!n.readAt ? '• ' : ''}
                            {n.title}
                          </Text>
                          <Text>{n.body}</Text>
                          <Text style={styles.muted}>
                            {new Date(n.createdAt).toLocaleString()}
                          </Text>
                          <Button
                            title="Review treatment"
                            secondary
                            disabled={busy}
                            onPress={() =>
                              void action(async () => {
                                await client.request(
                                  `/me/notifications/${n.id}/read`,
                                  'PATCH',
                                  {},
                                );
                                await openTreatment(n.data.treatmentId);
                              })
                            }
                          />
                        </View>
                      ))}
                      {!loading && notices.length === 0 && (
                        <Text style={styles.muted}>You’re all caught up.</Text>
                      )}
                    </>
                  )}
                  {tab === 'Settings' && (
                    <>
                      <View style={styles.card}>
                        <Text style={styles.heading}>Reminder preferences</Text>
                        <Text style={styles.muted}>
                          {configured
                            ? 'Your saved choices'
                            : 'Choose and save your preferences. Nothing is enabled automatically.'}
                        </Text>
                        {(Object.keys(labels) as (keyof Flags)[]).map((key) => (
                          <View key={key} style={styles.row}>
                            <Text style={{ flex: 1 }}>{labels[key]}</Text>
                            <Switch
                              accessibilityLabel={labels[key]}
                              value={flags[key]}
                              disabled={busy || loading}
                              onValueChange={(value) =>
                                setFlags({ ...flags, [key]: value })
                              }
                              trackColor={{ true: color.green }}
                            />
                          </View>
                        ))}
                        <Text style={styles.muted}>
                          Only dose inbox reminders are delivered currently.
                          Other choices are saved for future features.
                        </Text>
                        <Button
                          title="Save preferences"
                          disabled={busy || loading || !preferencesLoaded}
                          onPress={() =>
                            void action(async () => {
                              await client.request(
                                '/me/notification-preferences',
                                'PATCH',
                                flags,
                              );
                              setConfigured(true);
                              Alert.alert('Preferences saved');
                            })
                          }
                        />
                      </View>
                      <Button
                        title="Sign out"
                        secondary
                        disabled={busy}
                        onPress={() =>
                          void action(async () => {
                            try {
                              await client.logout();
                            } finally {
                              setSignedIn(false);
                              setLanding(true);
                              setDetail(null);
                              setMedicine(null);
                              setCourses([]);
                              setNotices([]);
                              setMedicines([]);
                            }
                          })
                        }
                      />
                    </>
                  )}
                  {['Medicines', 'Treatments', 'Inbox'].includes(tab) &&
                    pages > 1 && (
                      <View style={styles.row}>
                        <Button
                          title="Previous"
                          secondary
                          disabled={page <= 1 || loading}
                          onPress={() => setPage(page - 1)}
                        />
                        <Text>
                          {page} / {pages}
                        </Text>
                        <Button
                          title="Next"
                          secondary
                          disabled={page >= pages || loading}
                          onPress={() => setPage(page + 1)}
                        />
                      </View>
                    )}
                </>
              )}
            </>
          )}
        </ScrollView>
        {signedIn && (
          <View style={styles.bottomBar}>
            {[
              { name: 'Home', label: 'Home', icon: 'home-outline' },
              {
                name: 'My Pharmacy',
                label: 'Pharmacy',
                icon: 'medkit-outline',
              },
              { name: 'Add', label: 'Add', icon: 'add' },
              {
                name: 'Treatments',
                label: 'Treatments',
                icon: 'calendar-outline',
              },
              { name: 'More', label: 'More', icon: 'grid-outline' },
            ].map((item) => (
              <Pressable
                key={item.name}
                accessibilityRole={item.name === 'Add' ? 'button' : 'tab'}
                accessibilityLabel={
                  item.name === 'Add' ? 'Open quick actions' : item.name
                }
                accessibilityState={{ selected: tab === item.name }}
                onPress={() =>
                  item.name === 'Add'
                    ? setShowActions(true)
                    : navigate(item.name)
                }
                style={styles.navItem}
              >
                <View style={item.name === 'Add' ? styles.fab : undefined}>
                  <Ionicons
                    name={
                      item.icon as React.ComponentProps<typeof Ionicons>['name']
                    }
                    size={item.name === 'Add' ? 30 : 23}
                    color={
                      item.name === 'Add'
                        ? '#fff'
                        : tab === item.name
                          ? color.green
                          : color.muted
                    }
                  />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: tab === item.name ? '700' : '500',
                    color: tab === item.name ? color.green : color.muted,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <Modal
          visible={signedIn && showActions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowActions(false)}
        >
          <View style={styles.overlay}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss quick actions"
              style={{ flex: 1 }}
              onPress={() => setShowActions(false)}
            />
            <SafeAreaView edges={['bottom']} style={styles.sheet}>
              <View style={styles.row}>
                <Text style={styles.title}>A little more care</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close quick actions"
                  onPress={() => setShowActions(false)}
                  style={styles.headerAction}
                >
                  <Ionicons name="close" size={24} />
                </Pressable>
              </View>
              <Text style={styles.muted}>What would you like to do?</Text>
              <Tile
                title="My Prescriptions"
                subtitle="Create a draft or review saved prescriptions"
                icon="document-text-outline"
                onPress={() => navigate('Prescriptions')}
              />
              <Tile
                title="Add a medicine"
                subtitle="Search the catalog and record your stock"
                icon="add-circle-outline"
                onPress={() => navigate('Medicines')}
              />
              <Tile
                title="Review a dose"
                subtitle="Open your treatment schedule"
                icon="calendar-outline"
                onPress={() => navigate('Treatments')}
              />
              <Tile
                title="Check my pharmacy"
                subtitle="See quantities, expiry dates and low stock"
                icon="medkit-outline"
                onPress={() => navigate('My Pharmacy')}
              />
            </SafeAreaView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.soft,
    borderRadius: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fab: {
    backgroundColor: color.green,
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: color.bg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,35,32,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: color.bg,
    padding: 24,
    gap: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  brand: { color: color.green, fontSize: 26, fontWeight: '700' },
  muted: { color: color.muted, lineHeight: 21 },
  tabs: { flexDirection: 'row', paddingHorizontal: 12, gap: 2 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  content: { padding: 20, gap: 16, paddingBottom: 36 },
  title: { fontSize: 27, fontWeight: '600', color: color.ink },
  heading: { fontSize: 18, fontWeight: '600', color: color.ink },
  label: { color: color.ink, fontWeight: '500' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  input: {
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    color: color.ink,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: color.green,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 18,
    minHeight: 48,
  },
  secondary: { backgroundColor: color.soft },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  occurrence: {
    borderTopWidth: 1,
    borderColor: color.border,
    paddingTop: 12,
    gap: 8,
  },
  error: { padding: 16, gap: 12, backgroundColor: '#FCEDEC', borderRadius: 8 },
});
