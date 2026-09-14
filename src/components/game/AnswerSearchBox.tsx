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
    if (!selectedSong || isSubmitting || disabled) return;
    onSelectAnswer(selectedSong.id);
    setSelectedSong(null);
    setQuery('');
    setCandidates([]);
  };

  return (
    <div ref={containerRef} className="w-full space-y-3">
      {/* Search Bar with Autocomplete Dropdown */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled || isSubmitting}
            placeholder="Search song title or artist..."
            onChange={(e) => {
              handleQueryChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (candidates.length > 0) setDropdownOpen(true);
            }}
            className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-white/10 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-sm font-medium transition-all"
            aria-label="Search song title or artist"
            aria-autocomplete="list"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 w-4 h-4 animate-spin text-cyan-400" />
          )}
        </div>

        {/* Dropdown Candidate list */}
        {dropdownOpen && candidates.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y divide-white/5"
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
                    isHighlighted ? 'bg-cyan-500/20 text-white' : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Music2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{song.canonicalTitle}</span>
                      <span className="text-xs text-slate-400">{song.primaryArtist}</span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {song.genre}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {dropdownOpen && !isSearching && query.trim().length > 1 && candidates.length === 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400 z-50">
            No matching songs found. Try a different title or artist name.
          </div>
        )}
      </div>

      {/* Action Buttons: Submit Guess & Skip */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled || isSubmitting}
          className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <FastForward className="w-4 h-4 text-slate-400" />
          <span>Skip (+0 pts)</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedSong || isSubmitting || disabled}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
            selectedSong && !disabled && !isSubmitting
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>Submit Answer</span>
        </button>
      </div>
    </div>
  );
}
