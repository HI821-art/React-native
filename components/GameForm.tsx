import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { GameFormData } from '../models/game';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: GameFormData) => void;
};

const GameForm = ({ visible, onClose, onSubmit }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GameFormData>({
    defaultValues: {
      title: '',
      price: '',
      description: '',
      category: '',
      image: '',
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 'medium',
    },
  });

  const [selectedRating, setSelectedRating] = useState<'low' | 'medium' | 'high'>('medium');

  const onSubmitForm = (data: GameFormData) => {
    const formData = {
      ...data,
      rating: selectedRating,
    };
    
    onSubmit(formData);
    reset();
    setSelectedRating('medium');
    onClose();
  };

  const handleCancel = () => {
    reset();
    setSelectedRating('medium');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>➕ Додати нову гру</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Назва гри */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Назва гри *</Text>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Назва обов\'язкова',
                  minLength: { value: 3, message: 'Мінімум 3 символи' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Наприклад: The Legend of Zelda"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
            </View>

            {/* Ціна */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ціна ($) *</Text>
              <Controller
                control={control}
                name="price"
                rules={{
                  required: 'Ціна обов\'язкова',
                  pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Невірний формат ціни' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.price && styles.inputError]}
                    placeholder="59.99"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                  />
                )}
              />
              {errors.price && (
                <Text style={styles.errorText}>{errors.price.message}</Text>
              )}
            </View>

            {/* Категорія */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Категорія *</Text>
              <Controller
                control={control}
                name="category"
                rules={{ required: 'Категорія обов\'язкова' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.category && styles.inputError]}
                    placeholder="RPG, Action, Adventure..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category.message}</Text>
              )}
            </View>

            {/* Дата релізу */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Дата релізу *</Text>
              <Controller
                control={control}
                name="releaseDate"
                rules={{ required: 'Дата обов\'язкова' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.releaseDate && styles.inputError]}
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.releaseDate && (
                <Text style={styles.errorText}>{errors.releaseDate.message}</Text>
              )}
            </View>

            {/* Рейтинг */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Рейтинг</Text>
              <View style={styles.ratingContainer}>
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    selectedRating === 'low' && styles.ratingButtonActive,
                    { borderColor: '#EF4444' },
                  ]}
                  onPress={() => setSelectedRating('low')}
                >
                  <Text
                    style={[
                      styles.ratingText,
                      selectedRating === 'low' && styles.ratingTextActive,
                    ]}
                  >
                    ⭐ Low
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    selectedRating === 'medium' && styles.ratingButtonActive,
                    { borderColor: '#F59E0B' },
                  ]}
                  onPress={() => setSelectedRating('medium')}
                >
                  <Text
                    style={[
                      styles.ratingText,
                      selectedRating === 'medium' && styles.ratingTextActive,
                    ]}
                  >
                    ⭐⭐ Medium
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    selectedRating === 'high' && styles.ratingButtonActive,
                    { borderColor: '#10B981' },
                  ]}
                  onPress={() => setSelectedRating('high')}
                >
                  <Text
                    style={[
                      styles.ratingText,
                      selectedRating === 'high' && styles.ratingTextActive,
                    ]}
                  >
                    ⭐⭐⭐ High
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* URL зображення */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL зображення</Text>
              <Controller
                control={control}
                name="image"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com/image.jpg"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            {/* Опис */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Опис</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Опишіть гру..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
            </View>

            {/* Кнопки */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Скасувати</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit(onSubmitForm)}
              >
                <Text style={styles.submitButtonText}>Додати гру</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default GameForm;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  ratingButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  ratingTextActive: {
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});