import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { useGameStore } from './src/store/gameStore';
import { SensorManager } from './src/sensors/SensorManager';
import { rondaPlayApi } from './src/services/RondaPlayApi';
import { i18n } from './src/i18n';
import defaultDecks from './src/data/decks.json';
import { Deck } from './src/types';

const sensorManager = new SensorManager();

export default function App() {
  const {
    gameState,
    language,
    selectedDeck,
    shuffledWords,
    currentWordIndex,
    timeRemainingSeconds,
    correctCount,
    passCount,
    hapticsEnabled,
    selectDeck,
    startGame,
    registerWordResult,
    tickTimer,
    resetGame,
  } = useGameStore();

  const [currentPitch, setCurrentPitch] = useState(0);

  // Initialize Default Deck
  useEffect(() => {
    if (!selectedDeck && defaultDecks.length > 0) {
      selectDeck(defaultDecks[0] as Deck);
    }
  }, [selectedDeck, selectDeck]);

  // Manage Orientation & Sensor Lifecycle
  useEffect(() => {
    if (gameState === 'PLAYING') {
      // Force Landscape Orientation for active gameplay
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

      // Start Motion Sensor Listening
      sensorManager.startListening(
        (action) => {
          if (hapticsEnabled) {
            if (action === 'CORRECT') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          }
          registerWordResult(action === 'CORRECT' ? 'correct' : 'pass');
        },
        (pitch) => setCurrentPitch(Math.round(pitch))
      );
    } else {
      // Force Portrait Mode for Menus & Game Over Screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      sensorManager.stopListening();
    }

    return () => {
      sensorManager.stopListening();
    };
  }, [gameState, hapticsEnabled, registerWordResult]);

  // Active Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, tickTimer]);

  const activeWord = shuffledWords[currentWordIndex];
  const wordText = activeWord ? (language === 'en' ? activeWord.en : activeWord.es) : '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* GAMEPLAY OVERLAY SCREEN */}
      {gameState === 'PLAYING' && (
        <View style={styles.gameplayContainer}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerText}>{timeRemainingSeconds}s</Text>
            <Text style={styles.pitchText}>Pitch: {currentPitch}°</Text>
          </View>

          <View style={styles.cardBox}>
            <Text style={styles.wordText}>{wordText || i18n.t('gameOver')}</Text>
          </View>

          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPass]}
              onPress={() => {
                if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                registerWordResult('pass');
              }}
            >
              <Text style={styles.btnText}>{i18n.t('pass')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnCorrect]}
              onPress={() => {
                if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                registerWordResult('correct');
              }}
            >
              <Text style={styles.btnText}>{i18n.t('correct')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* GAME OVER SUMMARY SCREEN */}
      {gameState === 'GAME_OVER' && (
        <View style={styles.menuContainer}>
          <Text style={styles.titleText}>{i18n.t('gameOver')}</Text>
          <Text style={styles.scoreText}>
            {i18n.t('correct')}: {correctCount} | {i18n.t('pass')}: {passCount}
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              // Submit match metrics to RondaPlay backend API
              const { matchHistory, selectedDeck } = useGameStore.getState();
              const total = correctCount + passCount;
              const rate = total > 0 ? Number((correctCount / total).toFixed(2)) : 0;

              await rondaPlayApi.postMatchResult({
                deckId: selectedDeck?.id || 'deck-default',
                deckTitle: selectedDeck?.titleEs || 'Default',
                correctCount,
                incorrectCount: passCount,
                successRate: rate,
                durationSeconds: 60,
                matchHistory,
                username: 'RondaPlayer',
              });

              resetGame();
            }}
          >
            <Text style={styles.primaryBtnText}>{i18n.t('playAgain')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* HOME MENU SCREEN */}
      {gameState === 'IDLE' && (
        <View style={styles.menuContainer}>
          <Text style={styles.brandSubtitle}>RondaPlay</Text>
          <Text style={styles.titleText}>{i18n.t('appTitle')}</Text>
          <Text style={styles.tagline}>{i18n.t('tagline')}</Text>

          <View style={styles.deckCard}>
            <Text style={styles.deckLabel}>Mazo Seleccionado:</Text>
            <Text style={styles.deckTitle}>
              {selectedDeck ? (language === 'en' ? selectedDeck.titleEn : selectedDeck.titleEs) : 'Cargando...'}
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => startGame()}>
            <Text style={styles.primaryBtnText}>{i18n.t('play')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandSubtitle: {
    color: '#06B6D4',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 8,
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  deckCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  deckLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  deckTitle: {
    color: '#EC4899',
    fontSize: 22,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#06B6D4',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 99,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  gameplayContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    padding: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    color: '#EC4899',
    fontSize: 28,
    fontWeight: '800',
  },
  pitchText: {
    color: '#64748B',
    fontSize: 14,
  },
  cardBox: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnPass: {
    backgroundColor: '#EF4444',
  },
  btnCorrect: {
    backgroundColor: '#22C55E',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  scoreText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
});
