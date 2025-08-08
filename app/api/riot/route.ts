import { NextRequest, NextResponse } from 'next/server'
import { upsertUserGameStatistics, getUserByClerkId } from '@/lib/supabase'

const RIOT_API_KEY = process.env.RIOT_API_KEY

// --- TypeScript Interfaces ---
// Enhanced interface to include profile information
interface GameStats {
  // Profile information
  profileIcon?: string
  summonerLevel?: number
  accountLevel?: number
  
  // Rank information
  rank: string
  rankIconUrl?: string // Added for Valorant rank icon
  rr?: string // Valorant Rank Rating
  lp?: string // League of Legends League Points
  
  // Performance statistics
  mainAgent?: string // Future implementation
  mainRole?: string // We can now calculate this
  winRate: string // We can now calculate this
  gamesPlayed?: number
  wins?: number
  losses?: number
  totalMatches?: number
  recentForm?: string
  topChampions?: Array<{
    name: string
    level: number
    points: number
  }>
  flexRank?: string
  averageKDA?: string
  lastPlayed: string
  error?: string
}

interface LoLQueueData {
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

// --- Riot API Configuration ---
// League of Legends Match History Endpoints
const RIOT_ENDPOINTS = {
  // Account API (Universal)
  accountByNameTag: (region: string, gameName: string, tagLine: string) => 
    `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
  
  // League of Legends API
  lolSummoner: (platform: string, puuid: string) => 
    `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
  
  lolRank: (platform: string, summonerId: string) => 
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,

  // Match History Endpoints
  lolMatchIds: (routingRegion: string, puuid: string, count: number = 20) =>
    `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
  
  lolMatchById: (routingRegion: string, matchId: string) =>
    `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`
}


async function riotApiCall(url: string) {
  if (!RIOT_API_KEY) {
    throw new Error('Riot API key not configured on the server.')
  }


  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },

    next: { revalidate: 600 } 
  })
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error body' }));
    console.error(`Riot API Error: ${response.status} on ${url}`, errorBody);
    
    switch (response.status) {
        case 400: throw new Error('Bad request. Check your parameters.');
        case 401: throw new Error('Unauthorized. Check your API key permissions.');
        case 403: throw new Error('Forbidden. Your API key may be invalid or expired.');
        case 404: throw new Error('Data not found. The player may be unranked or the Riot ID is incorrect.');
        case 429: throw new Error('Rate limit exceeded. Please wait before trying again.');
        default: throw new Error(`Riot API returned an error: ${response.status}`);
    }
  }
  
  return response.json()
}

/**
 * Provides routing values for League of Legends APIs
 * Returns the correct routing values for both Account API and LoL platform APIs
 */
function getRegionalRouting(region: string) {
  const r = region.toLowerCase();
  // Americas
  if (['na', 'br', 'lan', 'las', 'americas'].includes(r)) {
    return { account: 'americas', lolPlatform: 'na1', lolRouting: 'americas' };
  }
  // Europe
  if (['euw', 'eune', 'tr', 'ru', 'europe'].includes(r)) {
    return { account: 'europe', lolPlatform: 'euw1', lolRouting: 'europe' };
  }
  // Asia
  if (['kr', 'jp', 'asia'].includes(r)) {
    return { account: 'asia', lolPlatform: 'kr', lolRouting: 'asia' };
  }
  // Default to Americas
  return { account: 'americas', lolPlatform: 'na1', lolRouting: 'americas' };
}

/**
 * NEW: Enhanced match history analysis with rank estimation
 * This function analyzes match data to estimate player rank when summoner ID is unavailable
 */
async function getLolMatchHistoryStats(puuid: string, routingRegion: string) {
    try {
        
        
        // Fetch more matches for better analysis (up to 100)
        const matchIds: string[] = await riotApiCall(RIOT_ENDPOINTS.lolMatchIds(routingRegion, puuid, 100));

        if (matchIds.length === 0) {
            return {
                winRate: '0%',
                mainRole: 'Unknown',
                gamesPlayed: 0,
                lastRankedMatch: 'No matches found',
                estimatedRank: 'Unknown'
            };
        }

        let wins = 0;
        let losses = 0;
        const roleCounts: Record<string, number> = {};
        let rankedGamesAnalyzed = 0;
        let totalGamesAnalyzed = 0;
        let lastRankedMatch = 'No ranked games found';
        
        // For rank estimation
        const avgTeamRanks: number[] = [];
        let totalKDA = 0;
        let kdaCount = 0;

        

        // Process fewer matches and add longer delays to avoid rate limits
        const batchSize = 5; // Reduced batch size
        const maxMatches = 50; // Analyze fewer matches to avoid rate limits
        
        for (let batchStart = 0; batchStart < Math.min(maxMatches, matchIds.length); batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, Math.min(maxMatches, matchIds.length));
            const batchIds = matchIds.slice(batchStart, batchEnd);
            
            
            
            // Add longer delay between batches to respect rate limits
            if (batchStart > 0) {
                
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            }
            
            // Process matches one by one with delays to avoid rate limiting
            for (const matchId of batchIds) {
                try {
                    const match = await riotApiCall(RIOT_ENDPOINTS.lolMatchById(routingRegion, matchId));
                    const participant = match.info.participants.find((p: {puuid: string}) => p.puuid === puuid);
                    
                    if (!participant) continue;
                    
                    totalGamesAnalyzed++;
                    
                    // Check if this is a ranked game (queue ID filtering)
                    const isRankedSolo = match.info.queueId === 420; // Ranked Solo/Duo
                    const isRankedFlex = match.info.queueId === 440; // Ranked Flex
                    const isRanked = isRankedSolo || isRankedFlex;
                    
                    
                    
                    if (isRanked) {
                        rankedGamesAnalyzed++;
                        
                        // Update last ranked match timestamp
                        if (rankedGamesAnalyzed === 1) {
                            const matchDate = new Date(match.info.gameStartTimestamp);
                            lastRankedMatch = matchDate.toLocaleDateString();
                        }
                        
                        // Count wins/losses for ranked games only
                        if (participant.win) {
                            wins++;
                        } else {
                            losses++;
                        }
                        
                        // Count roles for ranked games only
                        const role = participant.teamPosition || participant.individualPosition || 'UNKNOWN';
                        if (role && role !== 'UNKNOWN') {
                            roleCounts[role] = (roleCounts[role] || 0) + 1;
                        }
                        
                        // Estimate rank from match performance indicators
                        const kda = (participant.kills + participant.assists) / Math.max(participant.deaths, 1);
                        totalKDA += kda;
                        kdaCount++;
                        
                        // Calculate average team rank based on match duration and game statistics
                        // Longer games typically indicate higher rank (more strategic play)
                        const gameDurationMinutes = match.info.gameDuration / 60;
                        const avgLevel = match.info.participants.reduce((sum: number, p: {champLevel: number}) => sum + p.champLevel, 0) / 10;
                        
                        // Simple heuristic: combine game duration, champion level, and KDA
                        let rankEstimate = 0;
                        if (gameDurationMinutes > 35 && avgLevel > 16) rankEstimate += 2; // Potentially Gold+
                        if (gameDurationMinutes > 40 && avgLevel > 17) rankEstimate += 2; // Potentially Plat+
                        if (kda > 2.0) rankEstimate += 1; // Good performance
                        if (participant.win && kda > 3.0) rankEstimate += 1; // Strong win
                        
                        avgTeamRanks.push(rankEstimate);
                    }
                    
               
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    
                     
                }
            }
        }

        

        const rankedWinRate = rankedGamesAnalyzed > 0 ? Math.round((wins / rankedGamesAnalyzed) * 100) : 0;
        
        // Find the most played role in ranked games
        let mainRole = 'Unknown';
        if (Object.keys(roleCounts).length > 0) {
            const topRole = Object.entries(roleCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            // Convert role names to readable format
            const roleMap: Record<string, string> = {
                'TOP': 'Top',
                'JUNGLE': 'Jungle', 
                'MIDDLE': 'Mid',
                'BOTTOM': 'ADC',
                'UTILITY': 'Support'
            };
            mainRole = roleMap[topRole] || topRole.charAt(0).toUpperCase() + topRole.slice(1).toLowerCase();
        }
        
        // Estimate rank based on performance
        let estimatedRank = 'Unranked';
        if (avgTeamRanks.length > 0) {
            const avgRankScore = avgTeamRanks.reduce((a, b) => a + b, 0) / avgTeamRanks.length;
            const avgKDA = kdaCount > 0 ? totalKDA / kdaCount : 0;
            
            
            
            // Rank estimation logic
            if (avgRankScore >= 4 && avgKDA >= 2.5 && rankedWinRate >= 60) {
                estimatedRank = 'Estimated: Diamond+';
            } else if (avgRankScore >= 3 && avgKDA >= 2.0 && rankedWinRate >= 55) {
                estimatedRank = 'Estimated: Platinum';
            } else if (avgRankScore >= 2 && avgKDA >= 1.5 && rankedWinRate >= 50) {
                estimatedRank = 'Estimated: Gold';
            } else if (avgRankScore >= 1 && avgKDA >= 1.0) {
                estimatedRank = 'Estimated: Silver';
            } else {
                estimatedRank = 'Estimated: Bronze-Iron';
            }
        }

        const result = {
            winRate: `${rankedWinRate}%`,
            mainRole: mainRole,
            gamesPlayed: rankedGamesAnalyzed,
            wins: wins,
            losses: losses,
            totalMatches: totalGamesAnalyzed,
            lastRankedMatch: lastRankedMatch,
            estimatedRank: estimatedRank
        };

        

        return result;
    } catch (error) {
        console.error('❌ Error analyzing match history:', error);
        return {
            winRate: 'Error',
            mainRole: 'Error',
            gamesPlayed: 0,
            lastRankedMatch: 'Error occurred',
            estimatedRank: 'Error'
        };
    }
}

// --- API Handlers ---

/**
 * GET /api/riot
 * Verifies a Riot account exists and returns its PUUID.
 * This is the first step in the account connection flow.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameName = searchParams.get('gameName')
    const tagLine = searchParams.get('tagLine')
    const region = searchParams.get('region') || 'americas'
    
    
    if (!gameName || !tagLine) {
      return NextResponse.json({ error: 'Game name and tag line are required' }, { status: 400 });
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json({ error: 'Riot API key not configured on the server.' }, { status: 500 });
    }

    const routing = getRegionalRouting(region);
    const accountData = await riotApiCall(
      RIOT_ENDPOINTS.accountByNameTag(routing.account, gameName, tagLine)
    );
    
    
    return NextResponse.json({
      success: true,
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      detectedRegion: region
    });
    
  } catch (error) {
    console.error('❌ Error verifying Riot account:', error)
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * UPDATED: The POST handler now calls our new match history function.
 * Takes a PUUID and fetches detailed stats for specified games.
 */
export async function POST(request: NextRequest) {
  try {
    const { puuid, games, region = 'americas' } = await request.json();
    
    
    
    if (!puuid || !Array.isArray(games)) {
      return NextResponse.json({ error: 'PUUID and a "games" array are required' }, { status: 400 });
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json({ error: 'Riot API key not configured on the server.' }, { status: 500 });
    }

    const routing = getRegionalRouting(region);
    const stats: Record<string, GameStats | null> = {};

    // --- Handle League of Legends (Now with real stats!) ---
    if (games.includes('league-of-legends')) {
      try {
        
        
        // First get the summoner data
        const summonerData = await riotApiCall(
          RIOT_ENDPOINTS.lolSummoner(routing.lolPlatform, puuid)
        );

        
        
        // The summoner response should have an 'id' field, but let's check all available fields
        
        
        // Try to find the summoner ID field (could be 'id', 'summonerId', or 'accountId')
        const summonerId = summonerData.id || summonerData.summonerId || summonerData.accountId;
        
        if (!summonerId) {
          console.error('❌ No summoner ID found in any expected field:', summonerData)
          // Try to continue with match history only
          
          
          const historyStats = await getLolMatchHistoryStats(puuid, routing.lolRouting);
          
          stats['league-of-legends'] = { 
            // Profile information from summoner data
            profileIcon: `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/profileicon/${summonerData.profileIconId}.png`,
            summonerLevel: summonerData.summonerLevel,
            // Performance data from match history
            rank: historyStats.estimatedRank,
            winRate: historyStats.winRate, 
            mainRole: historyStats.mainRole,
            gamesPlayed: historyStats.gamesPlayed,
          // Added wins, losses, and totalMatches to the League stats when summoner ID is not found
            wins: 'wins' in historyStats ? historyStats.wins : undefined,
            losses: 'losses' in historyStats ? historyStats.losses : undefined,
            totalMatches: 'totalMatches' in historyStats ? historyStats.totalMatches : undefined,
            lastPlayed: historyStats.lastRankedMatch
          };
          
          
        } else {
          console.log('✅ Found summoner ID:', summonerId)
          
          // Get match history stats with better rate limiting
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const historyStats = await getLolMatchHistoryStats(puuid, routing.lolRouting);
          
          
          // Get rank data with delay to avoid rate limiting
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const rankData: LoLQueueData[] = await riotApiCall(
            RIOT_ENDPOINTS.lolRank(routing.lolPlatform, summonerId)
          );
          
          
          
          const soloQueue = rankData.find(q => q.queueType === 'RANKED_SOLO_5x5');
          
          
          if (soloQueue) {
            stats['league-of-legends'] = {
              // Profile information from summoner data
              profileIcon: `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/profileicon/${summonerData.profileIconId}.png`,
              summonerLevel: summonerData.summonerLevel,
              // Rank information from API
              rank: `${soloQueue.tier} ${soloQueue.rank}`,
              lp: `${soloQueue.leaguePoints} LP`,
              // Performance data from match history analysis
              winRate: historyStats.winRate,
              mainRole: historyStats.mainRole,
              gamesPlayed: historyStats.gamesPlayed,
              wins: 'wins' in historyStats ? historyStats.wins : undefined,
              losses: 'losses' in historyStats ? historyStats.losses : undefined,
              totalMatches: 'totalMatches' in historyStats ? historyStats.totalMatches : undefined,
              lastPlayed: historyStats.lastRankedMatch,
            };
            
          } else {
            
            stats['league-of-legends'] = { 
              // Profile information from summoner data
              profileIcon: `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/profileicon/${summonerData.profileIconId}.png`,
              summonerLevel: summonerData.summonerLevel,
              // Performance data from match history
              rank: historyStats.estimatedRank,
              winRate: historyStats.winRate, 
              mainRole: historyStats.mainRole,
              gamesPlayed: historyStats.gamesPlayed,
              wins: 'wins' in historyStats ? historyStats.wins : undefined,
              losses: 'losses' in historyStats ? historyStats.losses : undefined,
              totalMatches: 'totalMatches' in historyStats ? historyStats.totalMatches : undefined,
              lastPlayed: historyStats.lastRankedMatch
            };
            
          }
        }
      } catch (error) {
        console.error('❌ Could not fetch League of Legends stats:', error);
        stats['league-of-legends'] = { rank: 'Unranked', winRate: '0%', mainRole: 'Unknown', lastPlayed: 'N/A' };
      }
    }
    
    
    
    // Store statistics persistently if user ID is provided
    const clerkUserId = request.nextUrl.searchParams.get('userId')
    if (clerkUserId) {
      try {
        
        
        // Get the internal database user ID from Clerk ID
        const userData = await getUserByClerkId(clerkUserId)
        if (!userData) {
          
        } else {
          
          
          // Store League of Legends statistics
          if (stats['league-of-legends'] && !stats['league-of-legends'].error) {
            const lolStats = stats['league-of-legends']
            await upsertUserGameStatistics(userData.id, 'league-of-legends', {
              profile_icon_url: lolStats.profileIcon,
              summoner_level: lolStats.summonerLevel,
              current_rank: lolStats.rank,
              rank_points: lolStats.lp,
              flex_rank: lolStats.flexRank,
              main_role: lolStats.mainRole,
              win_rate: parseFloat(lolStats.winRate?.replace('%', '') || '0'),
              games_played: lolStats.gamesPlayed,
              wins: lolStats.wins,
              losses: lolStats.losses,
              total_matches: lolStats.totalMatches,
              average_kda: parseFloat(lolStats.averageKDA || '0'),
              last_played: lolStats.lastPlayed,
              recent_form: lolStats.recentForm,
              additional_stats: {
                topChampions: JSON.stringify(lolStats.topChampions || [])
              }
            })
            
          }
        }
        
      } catch (storageError) {
        console.error('❌ Error storing game statistics:', storageError)
        // Don't fail the request if storage fails
      }
    }
    
    return NextResponse.json({ success: true, stats });
    
  } catch (error) {
    console.error('❌ Error fetching enhanced game statistics:', error)
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}