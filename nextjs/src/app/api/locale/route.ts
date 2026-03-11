import {NextRequest, NextResponse} from 'next/server';

const SUPPORTED_LOCALES = new Set(['en', 'fr']);

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const locale = searchParams.get('locale');
  const returnTo = searchParams.get('returnTo') || '/';

  const url = new URL(returnTo, request.url);
  const response = NextResponse.redirect(url);

  if (locale && SUPPORTED_LOCALES.has(locale)) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    });
  }

  return response;
}

