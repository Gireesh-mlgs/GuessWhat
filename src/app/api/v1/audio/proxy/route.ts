import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'audio-ssl.itunes.apple.com',
  'itunes.apple.com',
  'audio.itunes.apple.com',
  'mzstatic.com',
  'dzcdn.net',
];

export async function GET(req: NextRequest) {
  try {
    const rawUrl = req.nextUrl.searchParams.get('url');
    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing audio url parameter' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
    if (!isAllowed) {
      return NextResponse.json({ error: 'Host not allowed for proxying' }, { status: 403 });
    }

    // Forward range header if present for audio seek/buffering
    const rangeHeader = req.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'SongSprint/1.0',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const upstreamRes = await fetch(parsedUrl.toString(), {
      headers: fetchHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return NextResponse.json(
        { error: `Upstream audio provider returned ${upstreamRes.status}` },
        { status: upstreamRes.status }
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstreamRes.headers.get('Content-Type') || 'audio/mp4');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');

    const contentLength = upstreamRes.headers.get('Content-Length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstreamRes.headers.get('Content-Range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    const acceptRanges = upstreamRes.headers.get('Accept-Ranges');
    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Audio proxy failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
