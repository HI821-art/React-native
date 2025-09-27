import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const questions = [
  { text: "Ти, як правило, завжди буваєш всім задоволений?", type: 'Сангвінік' },
  { text: "Тобі іноді заважають заснути різні думки?", type: 'Меланхолік' },
  { text: "Чи було коли-небудь так, що тобі довірили таємницю, а ти з яких-небудь причин не зміг її зберегти?", type: 'Флегматик' },
  { text: "Чи було коли-небудь так, що тобі стає сумно без особливої причини?", type: 'Меланхолік' },
  { text: "Чи любиш ти жартувати над ким-небудь?", type: 'Сангвінік' },
  { text: "Чи легко ти знаходиш спільну мову з новими людьми?", type: 'Сангвінік' },
  { text: "Чи часто ти відчуваєш втому без причини?", type: 'Меланхолік' },
  { text: "Чи подобається тобі бути в центрі уваги?", type: 'Холерик' },
  { text: "Чи часто ти замислюєшся над сенсом життя?", type: 'Флегматик' },
  { text: "Чи легко ти пристосовуєшся до змін?", type: 'Холерик' },
];

const types = ['Сангвінік', 'Меланхолік', 'Холерик', 'Флегматик'] as const;
type Temperament = typeof types[number];

export default function App() {
  const [started, setStarted] = useState(false);
  const [scores, setScores] = useState<Record<Temperament, number>>({
    Сангвінік: 0,
    Меланхолік: 0,
    Холерик: 0,
    Флегматик: 0,
  });

  const startTest = () => {
    setScores({ Сангвінік: 0, Меланхолік: 0, Холерик: 0, Флегматик: 0 });
    setStarted(true);
    askQuestion(0, { Сангвінік: 0, Меланхолік: 0, Холерик: 0, Флегматик: 0 });
  };

  const askQuestion = (index: number, tempScores: Record<Temperament, number>) => {
    if (index >= questions.length) {
      showResult(tempScores);
      setStarted(false);
      return;
    }
    const q = questions[index];
    Alert.alert(
      `Питання ${index + 1}`,
      q.text,
      [
        {
          text: 'Так',
          onPress: () => {
            const newScores = { ...tempScores, [q.type as Temperament]: tempScores[q.type as Temperament] + 1 };
            askQuestion(index + 1, newScores);
          },
        },
        {
          text: 'Ні',
          onPress: () => askQuestion(index + 1, tempScores),
        },
      ],
      { cancelable: false }
    );
  };

  const showResult = (finalScores: Record<Temperament, number>) => {
    const max = Math.max(...Object.values(finalScores));
    const temperament = types.find((t) => finalScores[t] === max) || 'Невизначено';
    Alert.alert('Результат', `Ваш тип темпераменту: ${temperament}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест на темперамент</Text>
      {!started && (
        <TouchableOpacity style={styles.button} onPress={startTest}>
          <Text style={styles.buttonText}>Старт</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  button: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 20 },
});