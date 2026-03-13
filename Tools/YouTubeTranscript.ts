#!/usr/bin/env bun

/**
 * YouTubeTranscript.ts - Native YouTube transcript extraction (no Fabric dependency)
 *
 * Extracts YouTube video transcripts using yt-dlp for subtitle fetching.
 * No Fabric, no Python libraries — just yt-dlp (widely available via brew/pip/apt).
 *
 * Usage:
 *   bun YouTubeTranscript.ts <youtube-url>
 *   bun YouTubeTranscript.ts <youtube-url> --save <output-file>
 *
 * Can also be imported as a module:
 *   import { getTranscript, extractVideoId } from './YouTubeTranscript'
 *
 * Dependencies:
 *   - yt-dlp (install via: brew install yt-dlp)
 */

import { writeFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(input: string): string | null {
  // Already a video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);

    // youtube.com/watch?v=VIDEO_ID
    if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
      return url.searchParams.get('v');
    }

    // youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1).split('/')[0] || null;
    }

    // youtube.com/shorts/VIDEO_ID or /embed/VIDEO_ID or /live/VIDEO_ID
    const pathPatterns = ['/shorts/', '/embed/', '/live/'];
    for (const pattern of pathPatterns) {
      if (url.hostname.includes('youtube.com') && url.pathname.startsWith(pattern)) {
        return url.pathname.split('/')[2] || null;
      }
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

/**
 * Clean VTT subtitle text into plain transcript
 * Removes timestamps, formatting tags, and deduplicates lines
 */
function cleanVttToText(vtt: string): string {
  const lines = vtt.split('\n');
  const textLines: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    // Skip VTT headers, timestamps, and empty lines
    if (line.startsWith('WEBVTT') || line.startsWith('Kind:') || line.startsWith('Language:')) continue;
    if (/^\d{2}:\d{2}/.test(line)) continue; // Timestamp lines
    if (line.trim() === '') continue;

    // Remove VTT formatting tags like <00:00:04.799><c> text</c>
    let clean = line
      .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
      .replace(/<\/?c>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (!clean || clean === '[Music]' || clean === '[Applause]') continue;

    // Deduplicate (VTT repeats lines across timestamp boundaries)
    if (!seen.has(clean)) {
      seen.add(clean);
      textLines.push(clean);
    }
  }

  return textLines.join(' ');
}

const VTT_SUFFIXES = ['.en.vtt', '.en-orig.vtt'];

/**
 * Fetch transcript for a YouTube video using yt-dlp
 */
export async function getTranscript(videoId: string): Promise<string> {
  const tmpBase = join(tmpdir(), `yt-transcript-${videoId}-${crypto.randomUUID()}`);
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Single yt-dlp call: request both manual and auto subs, yt-dlp picks best available
    try {
      execSync(
        `yt-dlp --write-sub --write-auto-sub --sub-lang en,en-orig --sub-format vtt --skip-download -o "${tmpBase}" "${url}" 2>/dev/null`,
        { timeout: 120000, encoding: 'utf-8' }
      );
    } catch {
      throw new Error('yt-dlp failed. Is it installed? (brew install yt-dlp)');
    }

    // Find the generated VTT file (prefer manual .en.vtt over .en-orig.vtt)
    const vttFile = VTT_SUFFIXES.map(s => tmpBase + s).find(f => existsSync(f));

    if (!vttFile) {
      throw new Error('No English captions available for this video');
    }

    // Read and clean the VTT
    const vttContent = await readFile(vttFile, 'utf-8');
    const transcript = cleanVttToText(vttContent);

    if (!transcript.trim()) {
      throw new Error('Transcript is empty (video may have no spoken content)');
    }

    return transcript;

  } finally {
    // Cleanup all temp files matching the base path
    try {
      execSync(`rm -f "${tmpBase}"*`, { stdio: 'ignore' });
    } catch { /* ignore */ }
  }
}

// --- CLI ---
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
YouTubeTranscript - Native YouTube transcript extraction (no Fabric)

Usage:
  bun YouTubeTranscript.ts <youtube-url> [options]

Options:
  --save <file>    Save transcript to file
  --help           Show this help message

Dependencies:
  yt-dlp           Install via: brew install yt-dlp

Supported URL formats:
  - https://www.youtube.com/watch?v=VIDEO_ID
  - https://youtu.be/VIDEO_ID
  - https://youtube.com/shorts/VIDEO_ID
  - https://youtube.com/embed/VIDEO_ID
  - https://youtube.com/live/VIDEO_ID
  - VIDEO_ID (raw 11-character ID)
`);
    process.exit(0);
  }

  // Find URL/ID argument (first arg that isn't a flag or flag value)
  let input: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--save') { i++; continue; }
    if (args[i].startsWith('--')) continue;
    input = args[i];
    break;
  }
  if (!input) {
    console.error('Error: No YouTube URL or video ID provided');
    process.exit(1);
  }

  const videoId = extractVideoId(input);
  if (!videoId) {
    console.error(`Error: Could not extract video ID from: ${input}`);
    process.exit(1);
  }

  // Check for --save option
  const saveIndex = args.indexOf('--save');
  const outputFile = saveIndex !== -1 ? args[saveIndex + 1] : null;

  console.error(`Extracting transcript for video: ${videoId}`);

  try {
    const transcript = await getTranscript(videoId);
    console.error(`Transcript extracted: ${transcript.length} characters`);

    if (outputFile) {
      writeFileSync(outputFile, transcript, 'utf-8');
      console.error(`Saved to: ${outputFile}`);
    } else {
      // Output transcript to stdout (logs go to stderr)
      console.log(transcript);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
