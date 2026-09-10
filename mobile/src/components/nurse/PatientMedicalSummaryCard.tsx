import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AllergyItem {
  id?: string;
  allergen: string;
  severity: string;
}

interface ConditionItem {
  id?: string;
  name: string;
}

interface ContactItem {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
}

interface PatientObject {
  patientName: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  bloodType?: string;
  allergies?: AllergyItem[];
  chronicConditions?: ConditionItem[];
  emergencyContacts?: ContactItem[];
  onViewFullRecordPress?: () => void;
}

interface PatientMedicalSummaryCardProps {
  patient?: PatientObject;
  patientName?: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  bloodType?: string;
  allergies?: AllergyItem[];
  chronicConditions?: ConditionItem[];
  emergencyContacts?: ContactItem[];
  onViewFullRecordPress?: () => void;
}

export const PatientMedicalSummaryCard: React.FC<PatientMedicalSummaryCardProps> = ({
  patient,
  patientName: patientNameProp,
  cnic: cnicProp,
  dob: dobProp,
  gender: genderProp,
  bloodType: bloodTypeProp,
  allergies: allergiesProp = [],
  chronicConditions: chronicConditionsProp = [],
  emergencyContacts: emergencyContactsProp = [],
  onViewFullRecordPress: onViewFullRecordPressProp,
}) => {
  // Merge patient object with flat props, patient object takes precedence
  const name = patient?.patientName ?? patientNameProp;
  const cnic = patient?.cnic ?? cnicProp;
  const dob = patient?.dob ?? dobProp;
  const gender = patient?.gender ?? genderProp;
  const bloodType = patient?.bloodType ?? bloodTypeProp;
  const allergies = patient?.allergies ?? allergiesProp;
  const chronicConditions = patient?.chronicConditions ?? chronicConditionsProp;
  const emergencyContacts = patient?.emergencyContacts ?? emergencyContactsProp;
  const onViewFullRecordPress = patient?.onViewFullRecordPress ?? onViewFullRecordPressProp;

  // Fade-in entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Pulse animation for severe allergy banner
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Looping pulse for allergy banner
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, pulseAnim]);

  const severeAllergies = allergies.filter(a => a.severity === 'SEVERE');

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      {/* Patient Basic Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.patientName}>{name}</Text>
          <Text style={styles.patientSub}>
            {gender || 'Patient'}
            {dob ? ` · DOB: ${dob}` : ''}
            {cnic ? ` · CNIC: ${cnic}` : ''}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {bloodType && (
            <View style={styles.bloodTypeChip}>
              <Text style={styles.bloodTypeText}>🩸 {bloodType}</Text>
            </View>
          )}
          {onViewFullRecordPress && (
            <TouchableOpacity onPress={onViewFullRecordPress}>
              <Text style={styles.linkText}>Full Record ›</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Severe Allergy Warning Banner — pulsing */}
      {severeAllergies.length > 0 && (
        <Animated.View style={[styles.allergyWarningBanner, { opacity: pulseAnim }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>SEVERE ALLERGY WARNING</Text>
            <Text style={styles.warningText}>
              {severeAllergies.map(a => a.allergen).join(', ')}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Chronic Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chronic Conditions:</Text>
        {chronicConditions.length > 0 ? (
          <View style={styles.chipRow}>
            {chronicConditions.map((c, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{c.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noneText}>No chronic conditions logged.</Text>
        )}
      </View>

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact:</Text>
          {emergencyContacts.slice(0, 1).map((contact, i) => (
            <View key={i} style={styles.contactRow}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {contact.name} ({contact.relationship})
                </Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              >
                <Text style={styles.callIcon}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  patientName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  patientSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  linkText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  bloodTypeChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  bloodTypeText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '700',
  },
  allergyWarningBanner: {
    backgroundColor: '#1E1214',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  warningIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  section: {
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  chipText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '600',
  },
  noneText: {
    color: '#6B8E8A',
    fontSize: 11,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#051815',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: 4,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  contactPhone: {
    color: '#94A3B8',
    fontSize: 10,
  },
  callBtn: {
    backgroundColor: '#00E676',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  callIcon: {
    color: '#061C19',
    fontSize: 11,
    fontWeight: '700',
  },
});
