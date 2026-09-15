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

    if (!selectedSong) {
      // Trigger warning shake if clicked without selecting a candidate
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 400);
      return;
    }

    onSelectAnswer(selectedSong.id);
    setSelectedSong(null);
    setQuery('');
    setCandidates([]);
  };

  return (
    <div ref={containerRef} className="w-full space-y-3.5">
      {/* Friendly Prominent Prompt */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <span>What song is this?</span>
          <span className="inline-block text-amber-500 font-black animate-bounce text-base">⚡</span>
        </h2>
        {selectedSong && (
          <span className="text-[11px] font-black text-amber-950 bg-amber-200 px-3 py-0.5 rounded-full border border-amber-300 shadow-2xs">
            Song selected
          </span>
        )}
      </div>

      {/* Search Bar with Autocomplete Dropdown */}
      <div className={`relative ${shakeInput ? 'animate-wrong-shake' : ''}`}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-amber-600 pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled || isSubmitting}
            placeholder="Type your guess..."
            onChange={(e) => {
              handleQueryChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (candidates.length > 0) setDropdownOpen(true);
            }}
            className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-amber-300 rounded-2xl text-slate-900 placeholder-slate-400 font-bold text-sm sm:text-base shadow-xs focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all"
            aria-label="Type your guess"
            aria-autocomplete="list"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 w-5 h-5 animate-spin text-amber-600" />
          )}
        </div>

        {/* Dropdown Candidate list */}
        {dropdownOpen && candidates.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-amber-300 rounded-2xl shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto divide-y divide-amber-100"
          >
            {candidates.map((song, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={song.id}
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handleSelect(song)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-amber-50/70 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-200 border border-amber-300 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-amber-900 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-slate-900">{song.canonicalTitle}</span>
                      <span className="text-xs text-slate-600 font-semibold">{song.primaryArtist}</span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-200">
                    {song.genre}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {dropdownOpen && !isSearching && query.trim().length > 1 && candidates.length === 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-amber-300 rounded-2xl p-4 text-center text-xs font-black text-slate-600 shadow-xl z-50">
            No matching songs found. Try a different title or artist name.
          </div>
        )}
      </div>

      {/* Action Buttons: GUESS & SKIP */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled || isSubmitting}
          className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 text-sm font-black flex items-center justify-center gap-2 btn-tactile disabled:opacity-50 shadow-2xs"
        >
          <FastForward className="w-4 h-4 text-amber-700 stroke-[2.5]" />
          <span>SKIP</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedSong || isSubmitting || disabled}
          className={`flex-1 py-3.5 px-4 rounded-2xl text-sm font-black tracking-wide flex items-center justify-center gap-2 btn-tactile shadow-md ${
            selectedSong && !disabled && !isSubmitting
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-2 border-amber-400 shadow-amber-400/30 hover:shadow-amber-400/50 hover:scale-[1.02]'
              : 'bg-amber-100/60 text-amber-900/40 border-2 border-amber-200 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
          <span>GUESS</span>
        </button>
      </div>
    </div>
  );
}
