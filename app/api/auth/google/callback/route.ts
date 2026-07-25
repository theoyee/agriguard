import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  // Handle OAuth consent cancellations or Google-side errors
  if (errorParam || !code) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_FAILURE', 
                error: '${errorParam || "No authorization code received."}' 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication failed: ${errorParam || "Authorization cancelled."} Closing window...</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials are not fully configured on the server.");
    }

    // Dynamic redirect URI construction
    let baseUrl = process.env.APP_URL || "";
    if (!baseUrl) {
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      baseUrl = `${protocol}://${host}`;
    }
    
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo endpoint
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!userResponse.ok) {
      throw new Error("Failed to retrieve user info from Google.");
    }

    const googleUser = await userResponse.json();
    const email = googleUser.email;
    const name = googleUser.name || googleUser.given_name || "Google User";

    if (!email) {
      throw new Error("Email address was not provided by Google OAuth.");
    }

    // 3. Find or create user in the database
    let user = Database.findUserByEmail(email);
    if (!user) {
      user = Database.createUser({
        email,
        name,
        passwordHash: `google-oauth-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        role: 'USER' // default role
      });
    }

    // 4. Issue custom JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // 5. Construct success HTML that handles popup communication
    // Note: We set the cookie as SameSite=None and Secure=true because the app runs inside an iframe!
    const response = new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                token: '${token}',
                user: {
                  id: '${user.id}',
                  name: '${user.name.replace(/'/g, "\\'")}',
                  email: '${user.email}',
                  role: '${user.role}'
                }
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! Redirecting you now...</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

    // Set HttpOnly cookie with SameSite=None and Secure for iframe compliance
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=86400`);
    return response;

  } catch (error: any) {
    console.error("Google OAuth error:", error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_FAILURE', 
                error: '${error.message || "An unexpected error occurred during Google Sign-In."}' 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication error: ${error.message || "Unknown error."} Closing window...</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
