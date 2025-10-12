import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://mewkuspabjwrzkbbyxrw.supabase.co';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params);
}

async function handleRequest(request: NextRequest, { path }: { path: string[] }) {
  try {
    // Reconstruct the path
    const pathString = path.join('/');
    const targetUrl = `${SUPABASE_URL}/${pathString}`;
    
    // Get the query string
    const url = new URL(request.url);
    const queryString = url.search;
    const fullTargetUrl = `${targetUrl}${queryString}`;
    
    console.log('Proxying request to:', fullTargetUrl);
    
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
    
    // Prepare the request options
    const requestOptions: RequestInit = {
      method: request.method,
      headers,
    };
    
    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }
    
    // Make the request to Supabase
    const response = await fetch(fullTargetUrl, requestOptions);
    
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
