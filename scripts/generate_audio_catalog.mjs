import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const DURATION_SEC = 12; // 12 seconds each
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;

function createWavHeader(numSamples, sampleRate = 44100, numChannels = 2, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44);

  // RIFF chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // audio format 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

// Synthesizer helper functions
function noteToFreq(note) {
  // A4 = 69 = 440Hz
  return 440 * Math.pow(2, (note - 69) / 12);
}

function generateTrack(generatorFn) {
  const samples = new Int16Array(TOTAL_SAMPLES * 2); // stereo
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const [left, right] = generatorFn(t, i);
    // clamp between -1.0 and 1.0
    const clampedL = Math.max(-1, Math.min(1, left));
    const clampedR = Math.max(-1, Math.min(1, right));
    samples[i * 2] = Math.floor(clampedL * 32767);
    samples[i * 2 + 1] = Math.floor(clampedR * 32767);
  }
  return Buffer.concat([createWavHeader(TOTAL_SAMPLES), Buffer.from(samples.buffer)]);
}

// Track 1: Synthwave "Neon Horizon" by CyberVibe (120 BPM)
function synthwave(t) {
  const bpm = 120;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;
  const bar = Math.floor(beat / 4);

  // Kick on every beat
  const kickEnv = Math.exp(-beatFrac * 25);
  const kickFreq = 150 * Math.exp(-beatFrac * 35) + 45;
  const kick = Math.sin(2 * Math.PI * kickFreq * beatFrac) * kickEnv * 0.7;

  // Snare on beats 2 & 4
  const snareBeat = (beat + 2) % 2;
  const snareEnv = Math.exp(-snareBeat * 18);
  const snareNoise = (Math.random() * 2 - 1) * snareEnv * 0.35;
  const snareTone = Math.sin(2 * Math.PI * 180 * snareBeat) * snareEnv * 0.2;
  const snare = Math.floor(beat % 2) === 1 ? (snareNoise + snareTone) : 0;

  // Bass arpeggio (16th notes)
  const sixteenth = Math.floor(beat * 4);
  const bassNotes = [36, 36, 48, 36, 43, 36, 41, 36]; // C1, C2, G1, F1...
  const bassNote = bassNotes[sixteenth % bassNotes.length];
  const bassFreq = noteToFreq(bassNote);
  const bassFrac = (beat * 4) % 1;
  const bassEnv = Math.exp(-bassFrac * 8);
  const bassSaw = (2 * ((t * bassFreq) % 1) - 1) * bassEnv * 0.4;

  // Lead synth melody (catchy hook starting right at 0s)
  const leadMelody = [60, 63, 67, 72, 70, 67, 63, 65]; // C, Eb, G, C, Bb, G, Eb, F
  const leadIdx = Math.floor(beat * 2) % leadMelody.length;
  const leadFreq = noteToFreq(leadMelody[leadIdx]);
  const leadPulse = Math.sin(2 * Math.PI * leadFreq * t) + 0.5 * Math.sin(4 * Math.PI * leadFreq * t);
  const leadEnv = 0.4 + 0.1 * Math.sin(2 * Math.PI * 4 * t);
  const lead = leadPulse * leadEnv * 0.35;

  const left = kick + snare * 0.9 + bassSaw * 0.8 + lead * 0.7;
  const right = kick + snare * 0.9 + bassSaw * 0.8 + lead * 0.9;
  return [left, right];
}

// Track 2: Pop / Dance "Midnight City Lights" by Luna Ray (128 BPM)
function popDance(t) {
  const bpm = 128;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;

  // Punchy pop kick
  const kick = Math.sin(2 * Math.PI * (160 * Math.exp(-beatFrac * 30) + 50) * beatFrac) * Math.exp(-beatFrac * 20) * 0.8;

  // Hi-hats on offbeats
  const offbeatFrac = (beat + 0.5) % 1;
  const hihat = (Math.random() * 2 - 1) * Math.exp(-offbeatFrac * 40) * 0.25;

  // Bright chord stabs (A minor, F, C, G)
  const chordRoots = [57, 53, 48, 55]; // Am, F, C, G
  const chordRoot = chordRoots[Math.floor(beat / 4) % 4];
  const chordFreqs = [noteToFreq(chordRoot), noteToFreq(chordRoot + 3), noteToFreq(chordRoot + 7)];
  let chord = 0;
  const chordFrac = (beat * 2) % 1;
  const chordEnv = Math.exp(-chordFrac * 5);
  for (const f of chordFreqs) {
    chord += Math.sin(2 * Math.PI * f * t) * chordEnv * 0.15;
  }

  // Pop vocal-like lead hook
  const leadNotes = [69, 72, 76, 74, 72, 69, 67, 69]; // A, C, E, D, C, A, G, A
  const leadFreq = noteToFreq(leadNotes[Math.floor(beat * 2) % leadNotes.length]);
  const lead = Math.sin(2 * Math.PI * leadFreq * t) * 0.3;

  return [kick + hihat + chord + lead * 0.8, kick + hihat + chord + lead * 0.9];
}

// Track 3: Hard Rock "Thunder Strike" by Iron Voltage (135 BPM)
function rock(t) {
  const bpm = 135;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;

  // Rock kick
  const kick = Math.sin(2 * Math.PI * (130 * Math.exp(-beatFrac * 25) + 55) * beatFrac) * Math.exp(-beatFrac * 15) * 0.7;

  // Snare crack
  const snareFrac = (beat + 1) % 2;
  const snare = Math.floor(beat % 2) === 1 ? (Math.random() * 2 - 1) * Math.exp(-snareFrac * 14) * 0.5 : 0;

  // Distorted guitar power chord riff (E5 -> G5 -> A5 -> E5)
  const riffs = [40, 43, 45, 40];
  const root = riffs[Math.floor(beat / 2) % riffs.length];
  const f1 = noteToFreq(root);
  const f2 = noteToFreq(root + 7);
  // Raw wave with harmonic overdrive distortion
  const rawGuitar = Math.sin(2 * Math.PI * f1 * t) + 0.8 * Math.sin(2 * Math.PI * f2 * t);
  const distortedGuitar = Math.tanh(rawGuitar * 3.5) * 0.4;

  return [kick + snare + distortedGuitar * 0.9, kick + snare + distortedGuitar * 0.95];
}

// Track 4: Cinematic Orchestra "Celestial Odyssey" by Aurelius Symphony (90 BPM)
function orchestral(t) {
  // Dramatic string ensemble chords + brass
  const chordRoots = [48, 44, 41, 43]; // C, Ab, F, G
  const root = chordRoots[Math.floor(t / 3) % chordRoots.length];
  const f1 = noteToFreq(root);
  const f2 = noteToFreq(root + 7);
  const f3 = noteToFreq(root + 12);
  const f4 = noteToFreq(root + 15);

  const strings = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) + Math.sin(2 * Math.PI * f3 * t) + Math.sin(2 * Math.PI * f4 * t)) * 0.18;
  // Brass horn stabs
  const hornFreq = noteToFreq(root + 19);
  const hornEnv = (Math.sin(t * 2) > 0 ? 0.25 : 0.05);
  const horn = (Math.sin(2 * Math.PI * hornFreq * t) + 0.5 * Math.sin(4 * Math.PI * hornFreq * t)) * hornEnv;

  // Timpani roll
  const timpani = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-(t % 2) * 4) * 0.4;

  return [strings + horn + timpani, strings + horn * 0.9 + timpani];
}

// Track 5: Lo-Fi Hip Hop "Coffee Shop Rain" by Lofi Dreamer (82 BPM)
function lofi(t) {
  const bpm = 82;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;

  // Soft thumpy kick
  const kick = Math.sin(2 * Math.PI * 60 * beatFrac) * Math.exp(-beatFrac * 12) * 0.5;

  // Soft snare/clap
  const snareFrac = (beat + 1) % 2;
  const snare = Math.floor(beat % 2) === 1 ? (Math.random() * 2 - 1) * Math.exp(-snareFrac * 10) * 0.25 : 0;

  // Warm Rhodes electric piano chords with slight detune/chorus
  const chordNotes = [60, 64, 67, 71]; // Cmaj7
  let rhodes = 0;
  for (const n of chordNotes) {
    const f = noteToFreq(n);
    const tremolo = 1 + 0.15 * Math.sin(2 * Math.PI * 4 * t);
    rhodes += Math.sin(2 * Math.PI * f * t) * tremolo * 0.08;
  }

  // Subtle vinyl crackle
  const crackle = (Math.random() > 0.98 ? (Math.random() * 2 - 1) * 0.08 : 0);

  return [kick + snare + rhodes + crackle, kick + snare + rhodes * 1.05 + crackle];
}

// Track 6: Nu-Disco "Starlight Disco" by Chrome Boulevard (124 BPM)
function nuDisco(t) {
  const bpm = 124;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;

  const kick = Math.sin(2 * Math.PI * (140 * Math.exp(-beatFrac * 28) + 48) * beatFrac) * Math.exp(-beatFrac * 18) * 0.75;
  const hatFrac = (beat + 0.5) % 1;
  const hat = (Math.random() * 2 - 1) * Math.exp(-hatFrac * 35) * 0.2;

  // Funky slap bass
  const bassNotes = [38, 41, 45, 48, 45, 41]; // D minor funk
  const bassStep = Math.floor(beat * 2) % bassNotes.length;
  const bassFreq = noteToFreq(bassNotes[bassStep]);
  const bass = (2 * ((t * bassFreq) % 1) - 1) * Math.exp(-((beat * 2) % 1) * 6) * 0.35;

  // Disco synth strings
  const stringChord = (Math.sin(2 * Math.PI * 587.33 * t) + Math.sin(2 * Math.PI * 698.46 * t)) * 0.15;

  return [kick + hat + bass + stringChord, kick + hat + bass * 0.95 + stringChord];
}

// Track 7: Cyberpunk "Shadow Runner" by NeuroDyne (140 BPM)
function cyberpunk(t) {
  const bpm = 140;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;

  const kick = Math.sin(2 * Math.PI * (160 * Math.exp(-beatFrac * 35) + 40) * beatFrac) * Math.exp(-beatFrac * 16) * 0.8;
  // Gritty reese/saw bassline
  const f = 55; // A1
  const detune1 = f * 1.01;
  const detune2 = f * 0.99;
  const saw1 = 2 * ((t * f) % 1) - 1;
  const saw2 = 2 * ((t * detune1) % 1) - 1;
  const saw3 = 2 * ((t * detune2) % 1) - 1;
  const reese = Math.tanh((saw1 + saw2 + saw3) * 1.5) * 0.35;

  // Arp lead
  const arpNotes = [69, 72, 76, 81];
  const arpFreq = noteToFreq(arpNotes[Math.floor(beat * 4) % arpNotes.length]);
  const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.2;

  return [kick + reese + arp, kick + reese + arp * 0.9];
}

// Track 8: Acoustic Folk "Summer Breeze" by Meadow & Pine (100 BPM)
function folk(t) {
  const bpm = 100;
  const beat = t * (bpm / 60);
  const strumFrac = (beat * 2) % 1;

  // Strummed acoustic pattern (G major, Em, C, D)
  const roots = [55, 52, 48, 50];
  const r = roots[Math.floor(beat / 4) % roots.length];
  const f1 = noteToFreq(r);
  const f2 = noteToFreq(r + 4);
  const f3 = noteToFreq(r + 7);
  const strum = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) + Math.sin(2 * Math.PI * f3 * t)) * Math.exp(-strumFrac * 4) * 0.25;

  // Whistle / flute lead
  const melodyNotes = [71, 74, 76, 79, 76, 74];
  const mFreq = noteToFreq(melodyNotes[Math.floor(beat) % melodyNotes.length]);
  const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 5 * t);
  const flute = Math.sin(2 * Math.PI * mFreq * vibrato * t) * 0.2;

  return [strum + flute, strum * 1.05 + flute * 0.95];
}

// Track 9: Latin Samba "Carnaval de Rio" by Sambafunk Allstars (130 BPM)
function samba(t) {
  const bpm = 130;
  const beat = t * (bpm / 60);
  // Surdo bass drum (accent on 2)
  const surdo = Math.sin(2 * Math.PI * 65 * (beat % 1)) * Math.exp(-(beat % 1) * 8) * 0.6;
  // Shaker syncopation
  const shaker = (Math.random() * 2 - 1) * Math.exp(-((beat * 4) % 1) * 20) * 0.25;
  // Trumpet brass riff
  const brassNotes = [65, 68, 72, 70, 68, 65]; // F minor samba
  const bFreq = noteToFreq(brassNotes[Math.floor(beat * 2) % brassNotes.length]);
  const brass = (Math.sin(2 * Math.PI * bFreq * t) + 0.6 * Math.sin(4 * Math.PI * bFreq * t)) * 0.25;

  return [surdo + shaker + brass, surdo + shaker * 0.9 + brass * 1.05];
}

// Track 10: Classical Piano "Moonlight Sonata (Trap Remix)" by Amadeus Beat (112 BPM)
function moonlight(t) {
  const bpm = 112;
  const beat = t * (bpm / 60);
  // 808 sub kick
  const subKick = Math.sin(2 * Math.PI * (120 * Math.exp(-(beat % 1) * 20) + 40) * (beat % 1)) * Math.exp(-(beat % 1) * 8) * 0.7;
  // Piano triplet arpeggio: C#3, E3, G#3 (Iconic Moonlight Sonata motif)
  const pianoArp = [49, 52, 56]; // C#m
  const pNote = pianoArp[Math.floor(beat * 3) % pianoArp.length];
  const pFreq = noteToFreq(pNote);
  const piano = Math.sin(2 * Math.PI * pFreq * t) * Math.exp(-((beat * 3) % 1) * 5) * 0.35;
  // Trap hi-hat roll
  const trapHihat = (Math.random() * 2 - 1) * Math.exp(-((beat * 6) % 1) * 35) * 0.2;

  return [subKick + piano + trapHihat, subKick + piano * 0.95 + trapHihat];
}

// Track 11: Ambient Chill "Deep Abyss" by Solar Echoes (70 BPM)
function ambient(t) {
  // Lush warm pads (Fmaj7 -> Bbmaj7)
  const roots = [53, 58];
  const root = roots[Math.floor(t / 5) % roots.length];
  const f1 = noteToFreq(root);
  const f2 = noteToFreq(root + 4);
  const f3 = noteToFreq(root + 7);
  const f4 = noteToFreq(root + 11);

  const pad = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) + Math.sin(2 * Math.PI * f3 * t) + Math.sin(2 * Math.PI * f4 * t)) * 0.15;
  // Shimmering celestial bell
  const bellNotes = [72, 76, 79, 84, 88];
  const bFreq = noteToFreq(bellNotes[Math.floor(t * 1.5) % bellNotes.length]);
  const bell = Math.sin(2 * Math.PI * bFreq * t) * Math.exp(-(t % 2) * 3) * 0.15;

  return [pad + bell, pad * 0.95 + bell * 1.05];
}

// Track 12: Drum & Bass "Velocity Rush" by SubSonic Force (174 BPM)
function dnb(t) {
  const bpm = 174;
  const beat = t * (bpm / 60);
  const beatFrac = beat % 1;

  // Fast DnB kick & snare breakbeat
  const kick = (Math.floor(beat % 4) === 0) ? Math.sin(2 * Math.PI * 70 * beatFrac) * Math.exp(-beatFrac * 15) * 0.8 : 0;
  const snare = (Math.floor(beat % 4) === 2) ? (Math.random() * 2 - 1) * Math.exp(-beatFrac * 18) * 0.6 : 0;
  const hihat = (Math.random() * 2 - 1) * Math.exp(-((beat * 2) % 1) * 30) * 0.2;

  // Sub bassline
  const bassNotes = [36, 39, 41, 44];
  const bFreq = noteToFreq(bassNotes[Math.floor(beat / 4) % bassNotes.length]);
  const sub = Math.sin(2 * Math.PI * bFreq * t) * 0.5;

  // Fast synth lead
  const leadFreq = noteToFreq(60 + (Math.floor(beat * 2) % 12));
  const lead = (2 * ((t * leadFreq) % 1) - 1) * 0.2;

  return [kick + snare + hihat + sub + lead, kick + snare + hihat + sub + lead * 0.9];
}

const tracks = [
  { id: 'track-01', filename: 'neon_horizon.wav', gen: synthwave },
  { id: 'track-02', filename: 'midnight_city_lights.wav', gen: popDance },
  { id: 'track-03', filename: 'thunder_strike.wav', gen: rock },
  { id: 'track-04', filename: 'celestial_odyssey.wav', gen: orchestral },
  { id: 'track-05', filename: 'coffee_shop_rain.wav', gen: lofi },
  { id: 'track-06', filename: 'starlight_disco.wav', gen: nuDisco },
  { id: 'track-07', filename: 'shadow_runner.wav', gen: cyberpunk },
  { id: 'track-08', filename: 'summer_breeze.wav', gen: folk },
  { id: 'track-09', filename: 'carnaval_de_rio.wav', gen: samba },
  { id: 'track-10', filename: 'moonlight_sonata_remix.wav', gen: moonlight },
  { id: 'track-11', filename: 'deep_abyss.wav', gen: ambient },
  { id: 'track-12', filename: 'velocity_rush.wav', gen: dnb }
];

const outDir = path.resolve('public/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Generating ${tracks.length} lawful, royalty-free audio tracks...`);
for (const track of tracks) {
  const buf = generateTrack(track.gen);
  const filePath = path.join(outDir, track.filename);
  fs.writeFileSync(filePath, buf);
  console.log(`  ✓ Generated ${track.filename} (${buf.length} bytes)`);
}
console.log('Audio catalog generation complete!');
