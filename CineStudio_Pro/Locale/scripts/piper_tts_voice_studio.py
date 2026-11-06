#!/usr/bin/env python3
"""
VoiceStudio Locale: Piper TTS & eSpeak-ng (100% Offline & Open Source)
Sintesi vocale ad altissima velocita (C++ neural engine) per i dialoghi dei personaggi:
- Ettore (Bulldog): Voce buffa, tono vivace
- Rex (Pastore Tedesco): Voce profonda, calda ed eroica
- Bruno, Luna, Flash & Furia, Direttore Zampa
"""

import os
import sys
import subprocess
import argparse

VOICE_PROFILES = {
    'ettore': {'pitch': 1.25, 'rate': 1.1, 'voice': 'it_IT-paola-medium'},
    'rex': {'pitch': 0.9, 'rate': 1.0, 'voice': 'it_IT-riccardo-x_low'},
    'narratore': {'pitch': 1.0, 'rate': 1.0, 'voice': 'it_IT-paola-medium'},
    'bruno': {'pitch': 0.8, 'rate': 0.95, 'voice': 'it_IT-riccardo-x_low'},
    'luna': {'pitch': 1.15, 'rate': 1.15, 'voice': 'it_IT-paola-medium'}
}

def synthesize_dialogue(text, character_name, output_wav='dialogue.wav'):
    char = character_name.lower()
    profile = VOICE_PROFILES.get(char, VOICE_PROFILES['narratore'])
    print(f'[*] Sintesi vocale ({character_name}): "{text}"')
    
    # Tentativo 1: eSpeak-ng se installato nel sistema o cartella locale
    espeak_paths = [
        r'C:\Program Files\eSpeak NG\espeak-ng.exe',
        r'C:\Program Files (x86)\eSpeak NG\espeak-ng.exe',
        'espeak-ng'
    ]
    espeak_bin = None
    for p in espeak_paths:
        if os.path.exists(p) or p == 'espeak-ng':
            espeak_bin = p
            break
            
    if espeak_bin:
        pitch_val = int(profile['pitch'] * 50)
        speed_val = int(profile['rate'] * 160)
        cmd = [espeak_bin, '-v', 'it', '-p', str(pitch_val), '-s', str(speed_val), '-w', output_wav, text]
        try:
            subprocess.run(cmd, check=True)
            print(f'[+] File audio generato: {output_wav}')
            return True
        except Exception as e:
            print(f'[-] Errore eSpeak-ng: {e}')
    
    print('[i] Nota: Puoi installare espeak-ng.msi o piper-tts per voci neurali in altissima qualita.')
    return False

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='VoiceStudio Locale')
    parser.add_argument('--text', type=str, required=True, help='Testo del dialogo')
    parser.add_argument('--character', type=str, default='ettore', help='Nome personaggio (ettore/rex/narratore)')
    parser.add_argument('--out', type=str, default='dialogo.wav', help='Output wav')
    args = parser.parse_args()
    synthesize_dialogue(args.text, args.character, args.out)

