import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return NextResponse.json(
      { error: 'GitHub username is required' },
      { status: 400 }
    );
  }

  try {
    const octokit = new Octokit({ auth: token });

    // Fetch user profile
    const userResponse = await octokit.request('GET /users/{username}', {
      username: username,
    });

    // Fetch user repositories
    const reposResponse = await octokit.request('GET /users/{username}/repos', {
      username: username,
      per_page: 6,
    });

    // Fetch user contributions/events
    const contributionsResponse = await octokit.request('GET /users/{username}/events', {
      username: username,
      per_page: 10,
    });

    // Language breakdown (same as previous implementation)
    const reposForLanguages = await octokit.request('GET /users/{username}/repos', {
      username: username,
      per_page: 100,
    });

    const languages: Record<string, number> = {};
    let totalBytes = 0;

    for (const repo of reposForLanguages.data) {
      const languageResponse = await octokit.request('GET /repos/{owner}/{repo}/languages', {
        owner: username,
        repo: repo.name,
      });

      Object.entries(languageResponse.data).forEach(([lang, bytes]) => {
        const byteValue = typeof bytes === 'number' ? bytes : Number(bytes);
        if (!isNaN(byteValue) && byteValue > 0) {
          languages[lang] = (languages[lang] || 0) + byteValue;
          totalBytes += byteValue;
        }
      });
    }

    if (totalBytes === 0) {
      return NextResponse.json(
        { error: 'No language data found for the specified user' },
        { status: 400 }
      );
    }

    // Convert to percentages
    const languagePercentages = Object.fromEntries(
      Object.entries(languages).map(([lang, bytes]) => [
        lang,
        Number(((bytes / totalBytes) * 100).toFixed(2)),
      ])
    );

    // Process contributions
    const contributions = contributionsResponse.data.map((event: any) => ({
      type: event.type,
      repo: event.repo.name,
      action: event.payload?.action || 'unknown',
    }));

    return NextResponse.json({
      profile: userResponse.data,
      repositories: reposResponse.data,
      languages: languagePercentages,
      contributions: contributions,
    });
  } catch (error) {
    console.error('GitHub data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}