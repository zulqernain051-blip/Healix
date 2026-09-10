import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { z } from 'zod';
import { PriceType, SubmitOfferDto } from '../../types/marketplace';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

// Derived from backend validation: submitOfferSchema
const offerSchema = z.object({
  price: z.number().positive('Price must be greater than 0'),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']),
  message: z.string().optional(),
});

interface Props {
  onSubmit: (data: SubmitOfferDto) => void;
  isSubmitting: boolean;
  defaultProposedStart: string;
}

export const OfferForm: React.FC<Props> = ({ onSubmit, isSubmitting, defaultProposedStart }) => {
  const [priceStr, setPriceStr] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('HOURLY');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const parsedPrice = parseFloat(priceStr);

    const result = offerSchema.safeParse({
      price: parsedPrice,
      priceType,
      message: message.trim() || undefined,
    });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    onSubmit({
      price: result.data.price,
      priceType: result.data.priceType,
      message: result.data.message,
      proposedStart: defaultProposedStart || new Date().toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit an Offer</Text>
      
      <View style={styles.field}>
        <Text style={styles.label}>Rate Type</Text>
        <SegmentedButtons
          value={priceType}
          onValueChange={(val) => setPriceType(val as PriceType)}
          buttons={[
            { value: 'HOURLY', label: 'Hourly' },
            { value: 'DAILY', label: 'Daily' },
            { value: 'FIXED', label: 'Fixed' },
          ]}
          style={styles.segmented}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Price (PKR)</Text>
        <TextInput
          mode="outlined"
          value={priceStr}
          onChangeText={setPriceStr}
          keyboardType="numeric"
          placeholder="e.g. 1500"
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          textColor={COLORS.textPrimary}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Message (Optional)</Text>
        <TextInput
          mode="outlined"
          value={message}
          onChangeText={setMessage}
          placeholder="Why are you a good fit?"
          multiline
          numberOfLines={3}
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          textColor={COLORS.textPrimary}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submitBtn}
        buttonColor={COLORS.primary}
      >
        Submit Offer
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  segmented: {
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: COLORS.bg,
  },
  errorText: {
    color: COLORS.red,
    marginBottom: SPACING.md,
    fontSize: 12,
  },
  submitBtn: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
});
