import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { useGameStore } from './src/store/gameStore';
import { SensorManager } from './src/sensors/SensorManager';
import { rondaPlayApi } from './src/services/RondaPlayApi';
import { i18n } from './src/i18n';
import defaultDecks from './src/data/decks.json';
import { GAMES_CATALOG, MobileGame } from './src/data/gamesCatalog';
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

  const [activeTab, setActiveTab] = useState<'hub' | 'library' | 'leaderboard' | 'profile'>('hub');
  const [selectedGame, setSelectedGame] = useState<MobileGame>(GAMES_CATALOG[0]);
  const [currentPitch, setCurrentPitch] = useState(0);

  // Initialize Default Deck
  useEffect(() => {
    if (!selectedDeck && defaultDecks.length > 0) {
      selectDeck(defaultDecks[0] as Deck);
    }
  }, [selectedDeck, selectDeck]);

  // Manage Orientation & Sensor Lifecycle during ¿Quién Soy? active gameplay
  useEffect(() => {
    if (gameState === 'PLAYING' && selectedGame.id === 'quien-soy') {
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
  }, [gameState, selectedGame, hapticsEnabled, registerWordResult]);

  // Active Gameplay Timer Tick
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. ACTIVE GAMEPLAY SCREEN (FOREHEAD / TILT)                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {gameState === 'PLAYING' && (
        <View style={styles.gameplayContainer}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerText}>{timeRemainingSeconds}s</Text>
            <Text style={styles.pitchText}>Inclinación: {currentPitch}°</Text>
          </View>

          <View style={styles.cardBox}>
            <Text style={styles.wordText}>{wordText || '¡Juego terminado!'}</Text>
          </View>

          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPass]}
              onPress={() => {
                if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                registerWordResult('pass');
              }}
            >
              <Text style={styles.btnText}>❌ PASAR (Tilt Up)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnCorrect]}
              onPress={() => {
                if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                registerWordResult('correct');
              }}
            >
              <Text style={styles.btnText}>✅ CORRECTO (Tilt Down)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. GAME OVER SUMMARY SCOREBOARD                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {gameState === 'GAME_OVER' && (
        <View style={styles.menuContainer}>
          <Text style={styles.brandSubtitle}>Partida Finalizada</Text>
          <Text style={styles.titleText}>¡Tiempo Agotado!</Text>
          
          <View style={styles.scoreBoardBox}>
            <Text style={styles.scoreText}>✅ Correctas: {correctCount}</Text>
            <Text style={styles.scoreText}>❌ Pasadas: {passCount}</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              const { matchHistory } = useGameStore.getState();
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
                username: 'SpeedyCat99',
              });

              resetGame();
            }}
          >
            <Text style={styles.primaryBtnText}>Volver al Catálogo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. MULTI-GAME HUB MAIN SCREEN                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {gameState === 'IDLE' && (
        <View style={styles.hubContainer}>
          {/* Header */}
          <View style={styles.headerBar}>
            <Text style={styles.headerLogo}>RondaPlay</Text>
            <View style={styles.userBadge}>
              <Text style={styles.userName}>@SpeedyCat99</Text>
            </View>
          </View>

          {/* Hub Content */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {activeTab === 'hub' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Catálogo de Juegos Party</Text>
                
                {GAMES_CATALOG.map((game) => (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.gameCard, { borderColor: game.color }]}
                    onPress={() => {
                      setSelectedGame(game);
                      if (game.id === 'quien-soy') {
                        startGame();
                      }
                    }}
                  >
                    <View style={styles.gameCardHeader}>
                      <Text style={styles.gameEmoji}>{game.emoji}</Text>
                      <View style={styles.gameTitleBox}>
                        <Text style={styles.gameTitle}>{game.title}</Text>
                        <Text style={styles.gamePlayers}>{game.minPlayers}-{game.maxPlayers} Jugadores</Text>
                      </View>
                    </View>
                    <Text style={styles.gameDesc}>{game.description}</Text>
                    
                    <TouchableOpacity
                      style={[styles.playBadge, { backgroundColor: game.color }]}
                      onPress={() => {
                        setSelectedGame(game);
                        if (game.id === 'quien-soy') {
                          startGame();
                        }
                      }}
                    >
                      <Text style={styles.playBadgeText}>Jugar Ahora →</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'library' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Biblioteca de Mazos y Roles</Text>
                {defaultDecks.map((deck) => (
                  <TouchableOpacity
                    key={deck.id}
                    style={styles.libraryCard}
                    onPress={() => {
                      selectDeck(deck as Deck);
                      setActiveTab('hub');
                    }}
                  >
                    <Text style={styles.deckName}>{deck.titleEs}</Text>
                    <Text style={styles.deckWordsCount}>{deck.words.length} Cartas</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'leaderboard' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tabla de Clasificación Global</Text>
                <View style={styles.rankRow}>
                  <Text style={styles.rankNum}>#1</Text>
                  <Text style={styles.rankUser}>@SpeedyCat99</Text>
                  <Text style={styles.rankPts}>1,240 pts</Text>
                </View>
                <View style={styles.rankRow}>
                  <Text style={styles.rankNum}>#2</Text>
                  <Text style={styles.rankUser}>@PartyMaster</Text>
                  <Text style={styles.rankPts}>980 pts</Text>
                </View>
              </View>
            )}

            {activeTab === 'profile' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mi Perfil RondaPlay</Text>
                <Text style={styles.profileHandle}>@SpeedyCat99</Text>
                <Text style={styles.profileSub}>RondaPlay Player Level 12</Text>
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Navigation Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'hub' && styles.tabItemActive]}
              onPress={() => setActiveTab('hub')}
            >
              <Text style={styles.tabText}>🎮 Juegos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'library' && styles.tabItemActive]}
              onPress={() => setActiveTab('library')}
            >
              <Text style={styles.tabText}>📚 Biblioteca</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'leaderboard' && styles.tabItemActive]}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Text style={styles.tabText}>🏆 Tabla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={styles.tabText}>👤 Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7fc',
  },
  hubContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0e7',
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2c0247',
  },
  userBadge: {
    backgroundColor: '#f4ebf2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2c0247',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2c0247',
    marginBottom: 8,
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#2c0247',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  gameEmoji: {
    fontSize: 36,
  },
  gameTitleBox: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2c0247',
  },
  gamePlayers: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7d747f',
  },
  gameDesc: {
    fontSize: 13,
    color: '#4c444e',
    lineHeight: 18,
    marginBottom: 16,
  },
  playBadge: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  playBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  libraryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e0e7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2c0247',
  },
  deckWordsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006a61',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e0e7',
    marginBottom: 10,
  },
  rankNum: {
    fontWeight: '900',
    color: '#d95a82',
  },
  rankUser: {
    fontWeight: '800',
    color: '#2c0247',
  },
  rankPts: {
    fontWeight: '900',
    color: '#006a61',
  },
  profileHandle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2c0247',
  },
  profileSub: {
    fontSize: 14,
    color: '#7d747f',
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e8e0e7',
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  tabItemActive: {
    backgroundColor: '#72f5e3',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2c0247',
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandSubtitle: {
    color: '#006a61',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleText: {
    color: '#2c0247',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
  },
  scoreBoardBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e8e0e7',
    gap: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2c0247',
  },
  primaryBtn: {
    backgroundColor: '#006a61',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 99,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  gameplayContainer: {
    flex: 1,
    backgroundColor: '#2c0247',
    justifyContent: 'space-between',
    padding: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    color: '#72f5e3',
    fontSize: 32,
    fontWeight: '900',
  },
  pitchText: {
    color: '#cec3d0',
    fontSize: 14,
    fontWeight: '700',
  },
  cardBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#72f5e3',
  },
  wordText: {
    color: '#2c0247',
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  btnPass: {
    backgroundColor: '#ba1a1a',
  },
  btnCorrect: {
    backgroundColor: '#006a61',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
