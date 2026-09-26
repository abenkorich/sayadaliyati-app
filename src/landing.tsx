import React, { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { landingCopy as t } from './landing-copy';
// Metro resolves bundled images through a static require.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const familyIcon = require('../assets/icon-family.png');
const teal = '#087F7B';
export function Landing({
  signedIn,
  onStart,
  onSignIn,
}: {
  signedIn: boolean;
  onStart(): void;
  onSignIn(): void;
}) {
  const scroll = useRef<ScrollView>(null);
  const [featuresY, setFeaturesY] = useState(0);
  const [question, setQuestion] = useState<number | null>(null);
  return (
    <SafeAreaView style={s.screen}>
      <StatusBar style="dark" />
      <View style={s.topline} />
      <ScrollView ref={scroll} contentContainerStyle={s.content}>
        <View style={s.header}>
          <Image
            source={familyIcon}
            style={s.mark}
            resizeMode="contain"
            accessible={false}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.brand}>{t.brand}</Text>
            <Text style={s.tagline}>{t.tagline}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            style={s.login}
            onPress={onSignIn}
          >
            <Text style={s.link}>{signedIn ? 'Open app' : 'Sign in'}</Text>
            <Ionicons name="arrow-forward" size={18} color={teal} />
          </Pressable>
        </View>
        <View style={s.hero}>
          <Text style={s.eyebrow}>{t.eyebrow}</Text>
          <Text accessibilityRole="header" style={s.title}>
            {t.title}
            {'\n'}
            <Text style={s.accent}>{t.accent}</Text>
          </Text>
          <Text style={s.description}>{t.description}</Text>
          <Pressable
            accessibilityRole="button"
            style={s.button}
            onPress={onStart}
          >
            <Text style={s.buttonText}>
              {signedIn ? 'Continue to my pharmacy' : t.cta}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={s.explore}
            onPress={() =>
              scroll.current?.scrollTo({ y: featuresY, animated: true })
            }
          >
            <Text style={s.link}>{t.explore}</Text>
            <Ionicons name="arrow-down" size={18} color={teal} />
          </Pressable>
          <View style={{ gap: 10 }}>
            {t.reassurance.map((text) => (
              <View key={text} style={s.line}>
                <Ionicons name="checkmark" size={18} color={teal} />
                <Text style={s.small}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.visual}>
          <View style={s.preview}>
            <View style={s.line}>
              <Ionicons name="sunny-outline" size={20} color={teal} />
              <Text style={s.small}>{t.previewHello}</Text>
            </View>
            <Text style={s.sectionTitle}>{t.previewTitle}</Text>
            <View style={s.banner}>
              <Ionicons name="leaf-outline" size={26} color={teal} />
              <Text style={[s.link, { flex: 1 }]}>{t.previewStock}</Text>
            </View>
            {t.previewMedicine.map((name) => (
              <View key={name} style={s.medicine}>
                <View style={s.icon}>
                  <Ionicons name="medkit-outline" size={22} color={teal} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={s.heading}>{name}</Text>
                  <Text style={s.small}>{t.previewStatus}</Text>
                </View>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={teal}
                />
              </View>
            ))}
            <View style={s.line}>
              <Ionicons name="calendar-outline" size={24} color={teal} />
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={s.heading}>{t.previewRoutine}</Text>
                <Text style={s.small}>{t.previewNote}</Text>
              </View>
            </View>
          </View>
          <Text style={s.caption}>
            Illustrative app preview · example content
          </Text>
          <Text style={s.note}>{t.floatingTitle}</Text>
        </View>
        <View
          onLayout={(event) => setFeaturesY(event.nativeEvent.layout.y)}
          style={s.section}
        >
          <Text style={s.eyebrow}>{t.brand.toUpperCase()}</Text>
          <Text accessibilityRole="header" style={s.sectionTitle}>
            {t.promise}
            {'\n'}
            <Text style={s.accent}>{t.promiseAccent}</Text>
          </Text>
          <Text style={s.description}>{t.promiseText}</Text>
          {t.features.map((feature, index) => (
            <View key={feature.tag} style={s.card}>
              <View
                style={[
                  s.art,
                  { backgroundColor: ['#DDF4F1', '#F4EBDD', '#E8EEED'][index] },
                ]}
              >
                <Ionicons
                  name={
                    (
                      [
                        'medkit-outline',
                        'calendar-outline',
                        'notifications-outline',
                      ] as const
                    )[index]
                  }
                  size={48}
                  color={teal}
                />
              </View>
              <Text style={s.eyebrow}>{feature.tag}</Text>
              <Text style={s.heading}>{feature.title}</Text>
              <Text style={s.body}>{feature.body}</Text>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.eyebrow}>{t.stepsEyebrow}</Text>
          <Text accessibilityRole="header" style={s.sectionTitle}>
            {t.stepsTitle}
          </Text>
          <Text style={s.body}>{t.stepsText}</Text>
          {t.steps.map((step, index) => (
            <View key={step.title} style={s.step}>
              <Text style={s.number}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={s.heading}>{step.title}</Text>
                <Text style={s.body}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.privacy}>
          <Ionicons name="shield-checkmark-outline" size={42} color={teal} />
          <Text style={s.eyebrow}>{t.privacyEyebrow}</Text>
          <Text accessibilityRole="header" style={s.sectionTitle}>
            {t.privacyTitle}
          </Text>
          <Text style={s.body}>{t.privacyBody}</Text>
          {t.privacyPoints.map((point) => (
            <View key={point} style={s.line}>
              <Ionicons name="checkmark" size={20} color={teal} />
              <Text style={[s.body, { flex: 1 }]}>{point}</Text>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.eyebrow}>{t.faqEyebrow}</Text>
          <Text accessibilityRole="header" style={s.sectionTitle}>
            {t.faqTitle}
          </Text>
          {t.faqs
            .filter((f) => f.question !== 'Which languages are available?')
            .map((faq, index) => (
              <View key={faq.question} style={s.faq}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: question === index }}
                  style={s.line}
                  onPress={() => setQuestion(question === index ? null : index)}
                >
                  <Text style={[s.heading, { flex: 1 }]}>{faq.question}</Text>
                  <Ionicons
                    name={question === index ? 'remove' : 'add'}
                    size={22}
                    color={teal}
                  />
                </Pressable>
                {question === index && <Text style={s.body}>{faq.answer}</Text>}
              </View>
            ))}
        </View>
        <View style={s.final}>
          <Ionicons name="leaf-outline" size={38} color={teal} />
          <Text accessibilityRole="header" style={s.sectionTitle}>
            {t.finalTitle}
          </Text>
          <Text style={s.body}>{t.finalText}</Text>
          <Pressable
            accessibilityRole="button"
            style={s.button}
            onPress={onStart}
          >
            <Text style={s.buttonText}>
              {signedIn ? 'Continue to my pharmacy' : 'Create my account'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
          <Text style={s.small}>App currently available in English.</Text>
        </View>
        <Text style={s.caption}>{t.footer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAF9' },
  topline: { height: 4, backgroundColor: teal },
  content: { padding: 22, gap: 30, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: {
    backgroundColor: teal,
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brand: { fontSize: 21, fontWeight: '700', color: teal },
  tagline: { fontSize: 9, color: '#667371', marginTop: 3 },
  login: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 },
  link: { color: teal, fontWeight: '600', fontSize: 14 },
  hero: { gap: 22, paddingTop: 18 },
  eyebrow: { fontSize: 11, letterSpacing: 1.3, fontWeight: '700', color: teal },
  title: {
    fontSize: 43,
    lineHeight: 49,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: '#172321',
  },
  accent: { color: teal, fontStyle: 'italic' },
  description: { fontSize: 17, lineHeight: 27, color: '#667371' },
  button: {
    backgroundColor: teal,
    minHeight: 54,
    padding: 17,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
  explore: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  small: { fontSize: 12, lineHeight: 19, color: '#667371' },
  visual: {
    backgroundColor: '#E4F1EB',
    borderRadius: 28,
    padding: 18,
    gap: 16,
  },
  preview: { backgroundColor: '#fff', padding: 18, borderRadius: 20, gap: 18 },
  sectionTitle: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    color: '#172321',
    letterSpacing: -0.5,
  },
  banner: {
    backgroundColor: '#DDF4F1',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  medicine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderColor: '#E4EAE8',
    paddingBottom: 16,
  },
  icon: { padding: 10, borderRadius: 12, backgroundColor: '#F4EBDD' },
  heading: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#172321',
  },
  caption: {
    fontSize: 11,
    lineHeight: 18,
    color: '#667371',
    textAlign: 'center',
  },
  note: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: teal,
    textAlign: 'center',
  },
  section: { gap: 18, paddingTop: 14 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4EAE8',
    gap: 14,
  },
  art: {
    height: 100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { fontSize: 15, lineHeight: 24, color: '#667371' },
  step: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#E4EAE8',
  },
  number: { fontSize: 26, color: teal, fontWeight: '600' },
  privacy: {
    backgroundColor: '#EAF3EF',
    padding: 24,
    borderRadius: 24,
    gap: 18,
  },
  faq: {
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: '#E4EAE8',
    gap: 16,
  },
  final: { backgroundColor: '#DDF4F1', padding: 24, borderRadius: 24, gap: 18 },
});
