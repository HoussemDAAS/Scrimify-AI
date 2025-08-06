/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { gameConfigs } from "./game-configs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Rank utility functions for filtering and sorting
export function getRankIndex(game: string, rank: string): number {
  const gameConfig = gameConfigs[game as keyof typeof gameConfigs];
  if (!gameConfig || !rank) return -1;

  return gameConfig.ranks.findIndex((r) => r === rank);
}

export function isRankEqualOrHigher(
  game: string,
  userRank: string,
  requiredRank: string
): boolean {
  if (!userRank || !requiredRank) return true;

  const userRankIndex = getRankIndex(game, userRank);
  const requiredRankIndex = getRankIndex(game, requiredRank);

  // If either rank is not found, allow it
  if (userRankIndex === -1 || requiredRankIndex === -1) return true;

  // Higher index means higher rank, so user rank index should be >= required rank index
  return userRankIndex >= requiredRankIndex;
}

export function filterTeamsByMinimumRank(teams: any[], game: string, selectedRank: string) {
  if (!selectedRank) return teams;

  return teams.filter((team) => {
    // If team has no rank requirement, include it
    if (!team.rank_requirement) return true;

    // Check if the selected rank meets or exceeds the team's requirement
    return isRankEqualOrHigher(game, selectedRank, team.rank_requirement);
  });
}

export function sortTeamsByRank(teams: any[], game: string) {
  return teams.sort((a, b) => {
    // Teams without rank requirements go last
    if (!a.rank_requirement && !b.rank_requirement) return 0;
    if (!a.rank_requirement) return 1;
    if (!b.rank_requirement) return -1;

    // Sort by rank requirement (higher ranks first)
    const aRankIndex = getRankIndex(game, a.rank_requirement);
    const bRankIndex = getRankIndex(game, b.rank_requirement);

    return bRankIndex - aRankIndex;
  });
}
