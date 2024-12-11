import { Octokit } from 'octokit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

const SYNC_INTERVAL_HOURS = 4;

export async function syncGitHubData(userId: string, username: string) {
  try {
     const existingProfile = await prisma.gitHubProfile.findUnique({
      where: { userId },
      select: { lastSyncedAt: true }
    });
    
     if (existingProfile?.lastSyncedAt) {
      const hoursSinceLastSync = (Date.now() - existingProfile.lastSyncedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSync < SYNC_INTERVAL_HOURS) {
        return await getGitHubData(userId);
      }
    }

    // Log start of sync
    console.log(`Starting GitHub data sync for user: ${username}`);

    // Fetch GitHub data concurrently
    const [userResponse, reposResponse, contributionsResponse] = await Promise.all([
      octokit.request('GET /users/{username}', { username }),
      octokit.request('GET /users/{username}/repos', { 
        username, 
        sort: 'updated', 
        per_page: 100  // Increased to get more comprehensive repo data
      }),
      octokit.request('GET /users/{username}/events', { 
        username, 
        per_page: 50   // Increased to capture more events
      })
    ]);

    // Upsert GitHub Profile with lastSyncedAt
    const githubProfile = await prisma.gitHubProfile.upsert({
      where: { userId: userId },
      update: {
        username: userResponse.data.login,
        profileUrl: userResponse.data.html_url,
        avatarUrl: userResponse.data.avatar_url,
        name: userResponse.data.name,
        bio: userResponse.data.bio,
        publicRepos: userResponse.data.public_repos,
        followers: userResponse.data.followers,
        following: userResponse.data.following,
        lastSyncedAt: new Date()  // Update sync timestamp
      },
      create: {
        userId: userId,
        username: userResponse.data.login,
        profileUrl: userResponse.data.html_url,
        avatarUrl: userResponse.data.avatar_url,
        name: userResponse.data.name,
        bio: userResponse.data.bio,
        publicRepos: userResponse.data.public_repos,
        followers: userResponse.data.followers,
        following: userResponse.data.following,
        lastSyncedAt: new Date()
      }
    });

    // Sync Repositories
    await prisma.repository.deleteMany({
      where: { githubProfileId: githubProfile.id }
    });
    const repositoriesCreated = await prisma.repository.createMany({
      data: reposResponse.data.map((repo) => ({
        githubProfileId: githubProfile.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        isPrivate: repo.private,
        stargazersCount: repo.stargazers_count
      }))
    });

    // Sync Contributions
    await prisma.contribution.deleteMany({
      where: { githubProfileId: githubProfile.id }
    });
    const contributionsCreated = await prisma.contribution.createMany({
      data: contributionsResponse.data.map((event) => ({
        githubProfileId: githubProfile.id,
        type: event.type ?? 'unknown',
        repo: event.repo?.name ?? 'unknown',
        action: event.payload?.action ?? 'unknown'
      }))
    });

    // Log sync completion
    console.log(`GitHub sync completed for ${username}:
      - Repositories synced: ${repositoriesCreated.count}
      - Contributions synced: ${contributionsCreated.count}`);

    return await getGitHubData(userId);
  } catch (error) {
    console.error(`GitHub data sync error for user ${username}:`, error);
    throw new Error(`Failed to sync GitHub data for user ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getGitHubData(userId: string) {
  try {
    return await prisma.gitHubProfile.findUnique({
      where: { userId },
      include: {
        repositories: {
          orderBy: { stargazersCount: 'desc' },
          take: 6
        },
        contributions: {
          take: 10,
          orderBy: { id: 'desc' }
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching GitHub data for user ${userId}:`, error);
    throw new Error(`Failed to retrieve GitHub data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}