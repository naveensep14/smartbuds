import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://mewkuspabjwrzkbbyxrw.supabase.co';

export async function GET(request: NextRequest) {
  try {
    // Get the query string
    const url = new URL(request.url);
    const queryString = url.search;
    const targetUrl = `${SUPABASE_URL}/auth/v1/callback${queryString}`;
    
    console.log('Proxying auth callback to:', targetUrl);
    
    // Prepare headers for the proxy request
    const headers = new Headers();
    
    // Copy important headers from the original request
    const headersToForward = [
      'authorization',
      'content-type',
      'user-agent',
      'accept',
      'accept-language',
      'cache-control',
      'x-forwarded-for',
      'x-forwarded-proto',
      'x-forwarded-host'
    ];
    
    headersToForward.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });
    
    // Set the host header to the Supabase domain
    headers.set('host', 'mewkuspabjwrzkbbyxrw.supabase.co');
    
    // Make the request to Supabase
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });
    
    console.log('Supabase response status:', response.status);
    
    // Prepare the response
    const responseHeaders = new Headers();
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    
    // Set CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Get the response body
    const responseBody = await response.text();
    
    console.log('Response body length:', responseBody.length);
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the query string
    const url = new URL(request.url);
    const queryString = url.search;
    const targetUrl = `${SUPABASE_URL}/auth/v1/callback${queryString}`;
    
    console.log('Proxying auth callback POST to:', targetUrl);
    
    // Prepare headers for the proxy request
    const headers = new Headers();
    
    // Copy important headers from the original request
    const headersToForward = [
      'authorization',
      'content-type',
      'user-agent',
      'accept',
      'accept-language',
      'cache-control',
      'x-forwarded-for',
      'x-forwarded-proto',
      'x-forwarded-host'
    ];
    
    headersToForward.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });
    
    // Set the host header to the Supabase domain
    headers.set('host', 'mewkuspabjwrzkbbyxrw.supabase.co');
    
    // Get the request body
    const body = await request.text();
    
    // Make the request to Supabase
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: body || undefined,
    });
    
    console.log('Supabase POST response status:', response.status);
    
    // Prepare the response
    const responseHeaders = new Headers();
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    
    // Set CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Get the response body
    const responseBody = await response.text();
    
    console.log('POST Response body length:', responseBody.length);
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Proxy POST error:', error);
    return new NextResponse('Proxy Error', { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
