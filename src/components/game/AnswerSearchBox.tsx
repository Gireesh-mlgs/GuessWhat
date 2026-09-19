'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, FastForward, Check, Music2, Loader2 } from 'lucide-react';

interface CandidateSong {
  id: string;
  canonicalTitle: string;
  primaryArtist: string;
  genre: string;
}

interface AnswerSearchBoxProps {
  sessionId: string;
  onSelectAnswer: (songId: string) => void;
  onSkip: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function AnswerSearchBox({
  sessionId,
  onSelectAnswer,
  onSkip,
  isSubmitting,
  disabled = false,
}: AnswerSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<CandidateSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSong, setSelectedSong] = useState<CandidateSong | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [shakeInput, setShakeInput] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 1) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/sessions/${sessionId}/search?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json?.success) {
          setCandidates(json.data || []);
          setDropdownOpen(true);
          setHighlightedIndex(-1);
        }
      } catch {
        setCandidates([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, sessionId]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedSong(null);
    const isQueryPresent = Boolean(value.trim());
    setIsSearching(isQueryPresent);
    if (!isQueryPresent) {
      setCandidates([]);
      setDropdownOpen(false);
      setIsSearching(false);
    }
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (song: CandidateSong) => {
    setSelectedSong(song);
    setQuery(`${song.canonicalTitle} - ${song.primaryArtist}`);
    setDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || candidates.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : candidates.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < candidates.length) {
        handleSelect(candidates[highlightedIndex]);
      } else if (candidates.length > 0) {
        handleSelect(candidates[0]);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleSubmit = () => {
    if (disabled || isSubmitting) return;

    let toSubmit = selectedSong;
    if (!toSubmit && candidates.length > 0) {
      toSubmit = candidates[highlightedIndex >= 0 ? highlightedIndex : 0];
    }

    if (!toSubmit) {
      // Trigger warning shake if clicked without selecting a candidate
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 400);
      return;
    }

    onSelectAnswer(toSubmit.id);
    setSelectedSong(null);
    setQuery('');
    setCandidates([]);
  };

  const isGuessReady = Boolean(selectedSong || candidates.length > 0);

  return (
    <div ref={containerRef} className="w-full space-y-3.5">
      {/* Friendly Prominent Prompt with visible Artist support */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-base sm:text-lg text-[#A8FF3E] flex items-center gap-2 tracking-wide uppercase">
            <span>&gt; WHAT SONG IS THIS?</span>
            <span className="inline-block text-[#d7ff75] animate-pulse">_</span>
          </h2>
          {selectedSong && (
            <span className="font-pixel text-[11px] text-[#06080d] bg-[#A8FF3E] px-2.5 py-0.5 rounded-md border border-[#d7ff75] shadow-[0_0_8px_rgba(168,255,62,0.5)] font-bold uppercase tracking-wider">
              READY
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-[#102417] text-[#A8FF3E] px-2 py-0.5 rounded-md border border-[#22c55e]/50 font-pixel text-[11px]">
            <span>[MIC]</span> TRACK OR ARTIST NAME
          </span>
          <span className="text-slate-400 text-[11px]">Type either song name or artist</span>
        </div>
      </div>

      {/* Search Bar with Autocomplete Dropdown */}
      <div className={`relative ${shakeInput ? 'animate-wrong-shake' : ''}`}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#A8FF3E] pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled || isSubmitting}
            placeholder="Type song title or artist name..."
            onChange={(e) => {
              handleQueryChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (candidates.length > 0) setDropdownOpen(true);
            }}
            className="w-full pl-12 pr-10 py-3.5 bg-[#0a120e] border-2 border-[#22c55e] rounded-xl text-white placeholder-slate-500 font-bold text-sm sm:text-base shadow-[0_4px_0_#14532d,inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus:border-[#A8FF3E] focus:ring-4 focus:ring-[#A8FF3E]/20 transition-all"
            aria-label="Guess by song title or artist name"
            aria-autocomplete="list"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 w-5 h-5 animate-spin text-[#A8FF3E]" />
          )}
        </div>

        {/* Dropdown Candidate list */}
        {dropdownOpen && candidates.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 bg-[#090f0c] border-2 border-[#22c55e] rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto divide-y divide-[#172e20]"
          >
            {candidates.map((song, idx) => {
              const isHighlighted = idx === highlightedIndex;
              const isArtistMatch =
                query.trim().length > 1 &&
                song.primaryArtist.toLowerCase().includes(query.trim().toLowerCase());

              return (
                <li
                  key={song.id}
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handleSelect(song)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-[#153320] text-white' : 'hover:bg-[#0e2115] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#14281c] border border-[#22c55e]/60 flex items-center justify-center shrink-0">
                      <Music2 className="w-4 h-4 text-[#A8FF3E] stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-sm text-white truncate">{song.canonicalTitle}</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] uppercase font-pixel px-1.5 py-0.2 rounded bg-[#22c55e]/20 text-[#A8FF3E] border border-[#22c55e]/40">
                          ARTIST
                        </span>
                        <span className={`truncate ${isArtistMatch ? 'font-black text-[#A8FF3E] underline decoration-[#A8FF3E] decoration-2' : 'font-semibold text-slate-400'}`}>
                          {song.primaryArtist}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#102417] text-[#A8FF3E] font-pixel border border-[#22c55e]/40 shrink-0 ml-2 uppercase">
                    {song.genre}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Action Buttons: GUESS & SKIP */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled || isSubmitting}
          className="flex-1 py-3.5 px-4 arcade-btn-dark text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FastForward className="w-4 h-4 text-[#A8FF3E] stroke-[2.5]" />
          <span>SKIP &gt;&gt;</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isGuessReady || isSubmitting || disabled}
          className={`flex-1 py-3.5 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 ${
            isGuessReady && !disabled && !isSubmitting
              ? 'arcade-btn-green'
              : 'bg-[#121c15] text-slate-600 border-2 border-[#1e3325] rounded-xl cursor-not-allowed font-pixel'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#06080d]" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
          <span>GUESS [ENTER]</span>
        </button>
      </div>
    </div>
  );
}
