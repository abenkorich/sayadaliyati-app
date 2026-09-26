import type { ScanPreview } from './scan-preview';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PrescriptionScan } from './prescription-scan';
import { MedicineImage } from './medicine-search';
import { useSession } from './session';
import { units, stockError, localDate } from './stock';

type Item = {
  id: string;
  quantity: string;
  unit: string;
  expiryDate: string | null;
  isLowStock: boolean;
  medicine: {
    name: string;
    strength: string | null;
    boxImageUrl?: string | null;
    category?: { name: string } | null;
  };
};
type List<T> = { data: T[]; meta: { total: number; totalPages: number } };
type Course = { id: string; name: string; endDate: string };
export const palette = {
  teal: '#087F7B',
  ink: '#172321',
  muted: '#667371',
  soft: '#DDF4F1',
  border: '#E4EAE8',
};
export function Tile({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress(): void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={s.tile}>
      <View style={s.icon}>
        <Ionicons name={icon} size={24} color={palette.teal} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s.heading}>{title}</Text>
        <Text style={s.muted}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.muted} />
    </Pressable>
  );
}
function StockCard({ item }: { item: Item }) {
  return (
    <View style={s.tile}>
      <MedicineImage medicine={item.medicine} small />
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={s.heading}>{item.medicine.name}</Text>
        <Text style={s.muted}>
          {item.medicine.category?.name ?? 'Uncategorized'}
        </Text>
        <Text style={s.muted}>
          {[
            item.medicine.strength,
            `${item.quantity} ${item.unit.toLowerCase()}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <Text style={s.muted}>
          {item.expiryDate
            ? `Expiry: ${item.expiryDate.slice(0, 10)}`
            : 'Expiry not recorded'}
        </Text>
        {item.isLowStock && (
          <Text style={{ color: '#94621C', fontWeight: '600' }}>Low stock</Text>
        )}
      </View>
    </View>
  );
}
export function PharmacyScreen({
  home,
  revision,
  navigate,
  openTreatment,
  report,
}: {
  home: boolean;
  revision: number;
  navigate(tab: string): void;
  openTreatment(id: string): void;
  report(error: unknown): void;
}) {
  const { client } = useSession();
  const [data, setData] = useState<{
    items: Item[];
    total: number;
    low: number;
    treatments: number;
    courses: Course[];
    name: string;
  } | null>(null);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setData(null);
    async function load() {
      const items = await client.request<List<Item>>(
        `/me/inventory?page=${page}&limit=${home ? 3 : 20}&sort=created_desc${!home && filter === 'Low stock' ? '&lowStock=true' : ''}${!home && filter === 'Expired' ? `&expiryBefore=${localDate(new Date())}` : ''}`,
      );
      const [profile, low, treatments] = home
        ? await Promise.all([
            client.request<{ data: { firstName: string } }>('/me/profile'),
            client.request<List<Item>>('/me/inventory?limit=1&lowStock=true'),
            client.request<List<Course>>(
              '/me/treatments?limit=3&status=ACTIVE',
            ),
          ])
        : [null, null, null];
      if (active) {
        setData({
          items: items.data,
          total: items.meta.total,
          low: low?.meta.total ?? 0,
          treatments: treatments?.meta.total ?? 0,
          courses: treatments?.data ?? [],
          name: profile?.data.firstName ?? '',
        });
        setPages(items.meta.totalPages);
      }
    }
    void load()
      .catch((e) => {
        if (active) {
          setFailed(true);
          report(e);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client, home, revision, filter, page, report]);
  if (loading)
    return (
      <ActivityIndicator
        accessibilityLabel="Loading your pharmacy"
        color={palette.teal}
      />
    );
  if (failed || !data)
    return (
      <Text style={s.muted}>
        Your pharmacy could not be loaded. Pull down to try again.
      </Text>
    );
  return (
    <View style={{ gap: 20 }}>
      {home ? (
        <>
          <View style={s.hero}>
            <View style={{ flex: 1, gap: 10 }}>
              <Text style={s.eyebrow}>YOUR EVERYDAY HEALTH COMPANION</Text>
              <Text style={s.title}>
                Hello{data.name ? `, ${data.name}` : ''}.
              </Text>
              <Text style={s.muted}>
                A little care, every day. Keep your medicines and routines
                together.
              </Text>
            </View>
            <Ionicons name="leaf-outline" size={66} color={palette.teal} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              {
                label: 'In pharmacy',
                value: data.total,
                tab: 'My Pharmacy',
                icon: 'medkit-outline',
              },
              {
                label: 'Low stock',
                value: data.low,
                tab: 'My Pharmacy',
                icon: 'alert-circle-outline',
              },
              {
                label: 'Active plans',
                value: data.treatments,
                tab: 'Treatments',
                icon: 'calendar-outline',
              },
            ].map((x) => (
              <Pressable
                key={x.label}
                accessibilityRole="button"
                onPress={() => navigate(x.tab)}
                style={s.stat}
              >
                <Ionicons
                  name={x.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={22}
                  color={palette.teal}
                />
                <Text style={s.number}>{x.value}</Text>
                <Text style={s.caption}>{x.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.section}>Your current treatments</Text>
          {data.courses.length ? (
            data.courses.map((c) => (
              <Tile
                key={c.id}
                title={c.name}
                subtitle={`Review schedule · ends ${c.endDate.slice(0, 10)}`}
                icon="calendar-outline"
                onPress={() => openTreatment(c.id)}
              />
            ))
          ) : (
            <View style={s.card}>
              <Text style={s.heading}>Room for your routine</Text>
              <Text style={s.muted}>
                Your active treatment plans will appear here when available.
              </Text>
            </View>
          )}
          <Text style={s.section}>Quick actions</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              style={s.quick}
              onPress={() => navigate('Medicines')}
            >
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={palette.teal}
              />
              <Text style={s.heading}>Add medicine</Text>
              <Text style={s.muted}>Find it in the catalog</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={s.quick}
              onPress={() => navigate('Inbox')}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color={palette.teal}
              />
              <Text style={s.heading}>My reminders</Text>
              <Text style={s.muted}>Stay up to date</Text>
            </Pressable>
          </View>
          <View style={s.between}>
            <Text style={s.section}>Recently added</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigate('My Pharmacy')}
              style={{ padding: 12 }}
            >
              <Text style={{ color: palette.teal, fontWeight: '600' }}>
                View all
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={s.muted}>
            Your medicines, quantities and expiry dates in one place.
          </Text>
          <Tile
            title="Add a medicine"
            subtitle="Search the catalog to build your pharmacy"
            icon="add-circle-outline"
            onPress={() => navigate('Medicines')}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['All', 'Low stock', 'Expired'].map((f) => (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === f }}
                onPress={() => {
                  setPage(1);
                  setFilter(f);
                }}
                style={[
                  s.chip,
                  filter === f && { backgroundColor: palette.soft },
                ]}
              >
                <Text
                  style={{ color: filter === f ? palette.teal : palette.muted }}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.muted}>{data.total} stock entries</Text>
        </>
      )}
      {data.items.map((item) => (
        <StockCard key={item.id} item={item} />
      ))}
      {!data.items.length && (
        <View style={s.card}>
          <Ionicons name="file-tray-outline" size={36} color={palette.teal} />
          <Text style={s.heading}>
            {filter === 'All'
              ? 'Your pharmacy starts here'
              : 'No matching medicines'}
          </Text>
          <Text style={s.muted}>
            {filter === 'All'
              ? 'Add your first medicine to keep track of what you have at home.'
              : 'Try another filter to see your stock.'}
          </Text>
        </View>
      )}
      {!home && pages > 1 && (
        <View style={s.between}>
          <Pressable
            accessibilityRole="button"
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={s.chip}
          >
            <Text>Previous</Text>
          </Pressable>
          <Text>
            {page} / {pages}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={page >= pages}
            onPress={() => setPage(page + 1)}
            style={s.chip}
          >
            <Text>Next</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
export function AddStock({
  initialScan,
  medicineId,
  save,
  busy,
}: {
  initialScan?: ScanPreview | null;
  medicineId: string;
  save(body: Record<string, unknown>): void;
  busy: boolean;
}) {
  const [quantity, setQuantity] = useState(
    initialScan?.packageInfo?.quantity ?? '',
  );
  const [unit, setUnit] = useState(initialScan?.packageInfo?.unit ?? '');
  const [expiry, setExpiry] = useState(
    initialScan?.packageInfo?.expiryDate ?? '',
  );
  const [error, setError] = useState('');
  return (
    <View style={{ gap: 12 }}>
      <Text style={s.section}>Add to My Pharmacy</Text>
      {initialScan && (
        <Text style={s.muted}>
          Scanned: {initialScan.medications[0]?.extractedName}{' '}
          {initialScan.medications[0]?.strength}. Verify this matches the
          selected medicine. Pack quantity may differ from your remaining stock.
        </Text>
      )}
      <PrescriptionScan
        mode="box"
        disabled={busy}
        report={() => {}}
        onApply={(preview) => {
          const pack = preview.packageInfo;
          setQuantity(pack?.quantity ?? '');
          setUnit(pack?.unit ?? '');
          setExpiry(pack?.expiryDate ?? '');
          setError(
            'Check that the scanned box matches the selected catalog medicine and that the quantity is your remaining stock.',
          );
        }}
      />

      <Text style={s.muted}>
        Record the quantity you have. This does not change your treatment or
        dose.
      </Text>
      <Text style={s.heading}>Quantity</Text>
      <TextInput
        accessibilityLabel="Stock quantity"
        keyboardType="decimal-pad"
        value={quantity}
        onChangeText={setQuantity}
        placeholder="e.g. 20"
        style={s.input}
      />
      <Text style={s.heading}>Unit</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {units.map((u) => (
          <Pressable
            key={u}
            accessibilityRole="button"
            accessibilityState={{ selected: unit === u }}
            onPress={() => setUnit(u)}
            style={[s.chip, unit === u && { backgroundColor: palette.soft }]}
          >
            <Text>{u.toLowerCase()}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.heading}>Expiry date (optional)</Text>
      <TextInput
        accessibilityLabel="Expiry date YYYY-MM-DD"
        placeholder="YYYY-MM-DD"
        value={expiry}
        onChangeText={setExpiry}
        style={s.input}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: '#8C2926' }}>
          {error}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        style={[s.save, busy && { opacity: 0.5 }]}
        onPress={() => {
          const message = stockError(quantity, unit, expiry);
          if (message) {
            setError(message);
            return;
          }
          setError('');
          save({
            medicineId,
            quantity: Number(quantity),
            unit,
            ...(expiry ? { expiryDate: expiry } : {}),
            source: 'MANUAL',
          });
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
          {busy ? 'Saving…' : 'Add to My Pharmacy'}
        </Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  hero: {
    backgroundColor: '#E6F4EF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '700',
    color: palette.teal,
  },
  title: { fontSize: 29, fontWeight: '700', color: palette.ink },
  muted: { color: palette.muted, lineHeight: 21, fontSize: 14 },
  heading: { color: palette.ink, fontSize: 16, fontWeight: '600' },
  section: { color: palette.ink, fontSize: 20, fontWeight: '700' },
  tile: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: { backgroundColor: palette.soft, borderRadius: 16, padding: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    gap: 12,
  },
  quick: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  number: { fontSize: 26, fontWeight: '700', color: palette.ink },
  caption: { fontSize: 11, color: palette.muted },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    padding: 12,
    minHeight: 44,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  save: { backgroundColor: palette.teal, borderRadius: 14, padding: 18 },
});
