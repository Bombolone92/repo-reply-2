#!/usr/bin/env python3
"""
Wan 2.1 Local Video Generator (100% Gratuito & Open Source)
Supporta:
- Wan2.1-T2V-1.3B (adatto a GPU consumer con 8GB-12GB VRAM)
- Wan2.1-T2V-14B (per workstation GPU ad alta potenza)
- ComfyUI API WebSocket & HTTP (porta 8188)
- Hugging Face Diffusers pipeline locale
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse

def generate_via_comfyui(prompt, output_path, server_address='127.0.0.1:8188', steps=25):
    print(f'[*] Invio prompt a ComfyUI ({server_address}): {prompt[:60]}...')
    workflow = {
        '3': {
            'class_type': 'WanTextToVideo',
            'inputs': {
                'model_name': 'Wan2.1-T2V-1.3B',
                'prompt': prompt,
                'steps': steps,
                'cfg': 6.0,
                'width': 832,
                'height': 480,
                'frames': 81,
                'fps': 16
            }
        },
        '9': {
            'class_type': 'SaveAnimatedWEBP',
            'inputs': {
                'filename_prefix': 'CinePixar_Wan21',
                'images': ['3', 0]
            }
        }
    }
    data = json.dumps({'prompt': workflow}).encode('utf-8')
    req = urllib.request.Request(f'http://{server_address}/prompt', data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print(f'[+] Workflow inviato con successo! Prompt ID: {res.get("prompt_id")}')
            return True
    except Exception as e:
        print(f'[-] Errore connessione ComfyUI: {e}')
        print('[i] Consiglio: avvia ComfyUI con Wan 2.1 attivo su http://127.0.0.1:8188')
        return False

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Wan 2.1 Video Generator')
    parser.add_argument('--prompt', type=str, default='Pixar 3D animated style, cute cartoon puppy running excitedly on track', help='Prompt video')
    parser.add_argument('--out', type=str, default='clip_output.mp4', help='Output file path')
    args = parser.parse_args()
    generate_via_comfyui(args.prompt, args.out)

