#!/usr/bin/env python3
"""
Track statistics utility for analyzing track metadata.

Usage: python trackstats.py <path_to_tracks.json>
"""

import json
import sys
import statistics
from pathlib import Path


def load_tracks(filepath: str) -> dict:
    """Load tracks from a JSON file."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {filepath}: {e}", file=sys.stderr)
        sys.exit(1)


def extract_durations(tracks: dict) -> list:
    """Extract duration values from tracks."""
    durations = []
    for track_id, track_data in tracks.items():
        if isinstance(track_data, dict) and 'duration' in track_data:
            duration = track_data['duration']
            if isinstance(duration, (int, float)):
                durations.append(duration)
    return durations


def print_stats(durations: list) -> None:
    """Print track statistics."""
    if not durations:
        print("No tracks with duration data found.")
        return

    mean = statistics.mean(durations)
    median = statistics.median(durations)

    print(f"Track Statistics ({len(durations)} tracks)")
    print(f"{'─' * 40}")
    print(f"Mean length:   {mean:>10.1f} seconds ({mean/60:>6.1f} minutes)")
    print(f"Median length: {median:>10.1f} seconds ({median/60:>6.1f} minutes)")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python trackstats.py <path_to_tracks.json>", file=sys.stderr)
        sys.exit(1)

    filepath = sys.argv[1]
    tracks = load_tracks(filepath)
    durations = extract_durations(tracks)
    print_stats(durations)


if __name__ == '__main__':
    main()
