export const gameConfigs = {
  'valorant': {
    name: 'VALORANT',
    maxMembers: 5,
    roles: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'],
    ranks: ['Iron 1', 'Iron 2', 'Iron 3', 'Bronze 1', 'Bronze 2', 'Bronze 3', 'Silver 1', 'Silver 2', 'Silver 3', 'Gold 1', 'Gold 2', 'Gold 3', 'Platinum 1', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 2', 'Diamond 3', 'Ascendant 1', 'Ascendant 2', 'Ascendant 3', 'Immortal 1', 'Immortal 2', 'Immortal 3', 'Radiant'],
    color: 'from-red-600 to-red-800',
    logo: '/logos/valorant-logo.png',
    formFields: {
      competitionLevel: ['Casual', 'Competitive', 'Semi-Professional', 'Professional'],
      playstyle: ['Aggressive', 'Tactical', 'Balanced', 'Defensive'],
      communicationStyle: ['Voice Chat Required', 'Voice Chat Preferred', 'Text Only'],
      primaryLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese'],
      ageRequirement: ['No Requirement', '16+', '18+', '21+'],
      practiceFrequency: ['Daily', '4-5 times/week', '2-3 times/week', 'Weekends only', 'Flexible'],
      tournamentFocus: ['Local Tournaments', 'Regional Tournaments', 'National Tournaments', 'International Tournaments', 'No Tournaments']
    }
  },
  'league-of-legends': {
    name: 'LEAGUE OF LEGENDS',
    maxMembers: 5,
    roles: ['Top Lane', 'Jungle', 'Mid Lane', 'Bot Lane (ADC)', 'Support'],
    ranks: ['Iron IV', 'Iron III', 'Iron II', 'Iron I', 'Bronze IV', 'Bronze III', 'Bronze II', 'Bronze I', 'Silver IV', 'Silver III', 'Silver II', 'Silver I', 'Gold IV', 'Gold III', 'Gold II', 'Gold I', 'Platinum IV', 'Platinum III', 'Platinum II', 'Platinum I', 'Diamond IV', 'Diamond III', 'Diamond II', 'Diamond I', 'Master', 'Grandmaster', 'Challenger'],
    color: 'from-red-500 to-red-700',
    logo: '/logos/lol-logo.png',
    formFields: {
      competitionLevel: ['Casual', 'Ranked', 'Clash', 'Amateur League', 'Semi-Pro'],
      playstyle: ['Early Game', 'Late Game', 'Team Fight', 'Split Push', 'Balanced'],
      server: ['NA', 'EUW', 'EUNE', 'KR', 'CN', 'JP', 'OCE', 'BR', 'LAS', 'LAN', 'RU', 'TR'],
      primaryLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Turkish'],
      ageRequirement: ['No Requirement', '16+', '18+', '21+'],
      practiceFrequency: ['Daily', '4-5 times/week', '2-3 times/week', 'Weekends only', 'Flexible'],
      teamGoals: ['Climb Ranked', 'Clash Tournaments', 'Amateur Leagues', 'Content Creation', 'Fun & Learning']
    }
  },
  'counter-strike-2': {
    name: 'COUNTER-STRIKE 2',
    maxMembers: 5,
    roles: ['IGL (In-Game Leader)', 'Entry Fragger', 'AWPer', 'Support', 'Lurker/Flanker'],
    ranks: ['Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master', 'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master', 'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite', 'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master', 'Supreme Master First Class', 'The Global Elite'],
    color: 'from-red-600 to-red-900',
    logo: '/logos/cs2-logo.png',
    formFields: {
      competitionLevel: ['Casual', 'Matchmaking', 'FACEIT', 'ESEA', 'Local Tournaments', 'Professional'],
      playstyle: ['Aggressive', 'Strategic', 'Anti-Strat', 'Aim-Heavy', 'Tactical'],
      primaryMaps: ['Dust2', 'Mirage', 'Inferno', 'Cache', 'Overpass', 'Vertigo', 'Ancient', 'Anubis', 'All Maps'],
      communicationStyle: ['Voice Chat Required', 'Discord Required', 'TeamSpeak', 'In-Game Only'],
      primaryLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Polish', 'Swedish'],
      ageRequirement: ['No Requirement', '16+', '18+', '21+'],
      practiceFrequency: ['Daily', '4-5 times/week', '2-3 times/week', 'Weekends only', 'Match days only'],
      tournamentAmbition: ['Local LANs', 'Online Leagues', 'Major Qualifiers', 'Professional Scene', 'Just for Fun']
    }
  },
  'overwatch-2': {
    name: 'OVERWATCH 2',
    maxMembers: 5,
    roles: ['Tank', 'Damage 1', 'Damage 2', 'Support 1', 'Support 2'],
    ranks: ['Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1', 'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1', 'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1', 'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1', 'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1', 'Master 5', 'Master 4', 'Master 3', 'Master 2', 'Master 1', 'Grandmaster 5', 'Grandmaster 4', 'Grandmaster 3', 'Grandmaster 2', 'Grandmaster 1', 'Top 500'],
    color: 'from-red-400 to-red-600',
    logo: '/logos/overwatch-logo.png',
    formFields: {
      competitionLevel: ['Quick Play', 'Competitive', 'Scrimmages', 'Open Division', 'Contenders'],
      playstyle: ['Rush/Dive', 'Poke/Shield', 'Brawl', 'Pick/Anti-Pick', 'Flexible'],
      heroPool: ['Meta Heroes Only', 'Flexible Pool', 'Off-Meta Specialists', 'One-Tricks Welcome'],
      communicationStyle: ['Voice Chat Required', 'Callouts Only', 'Full Comms', 'Ping System'],
      primaryLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese'],
      ageRequirement: ['No Requirement', '16+', '18+', '21+'],
      practiceFrequency: ['Daily', '4-5 times/week', '2-3 times/week', 'Weekends only', 'Flexible'],
      teamGoals: ['Climb Competitive', 'Open Division', 'Contenders Path', 'Scrimmage Focus', 'Casual Improvement']
    }
  },
  'rocket-league': {
    name: 'ROCKET LEAGUE',
    maxMembers: 3,
    roles: ['Player 1', 'Player 2', 'Player 3'],
    ranks: ['Bronze I', 'Bronze II', 'Bronze III', 'Silver I', 'Silver II', 'Silver III', 'Gold I', 'Gold II', 'Gold III', 'Platinum I', 'Platinum II', 'Platinum III', 'Diamond I', 'Diamond II', 'Diamond III', 'Champion I', 'Champion II', 'Champion III', 'Grand Champion I', 'Grand Champion II', 'Grand Champion III', 'Supersonic Legend'],
    color: 'from-red-700 to-red-900',
    logo: '/logos/rocket-league-logo.png',
    formFields: {
      competitionLevel: ['Casual', 'Competitive', 'Tournaments', 'RLCS Path', 'Professional'],
      playstyle: ['Mechanical', 'Rotational', 'Boost Starved', 'Ball Chase', 'Defensive', 'Balanced'],
      gameMode: ['3v3 Standard', '2v2 Doubles', '1v1 Duel', 'Extra Modes'],
      platform: ['PC (Steam)', 'PC (Epic)', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Cross-Platform'],
      primaryLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Japanese'],
      ageRequirement: ['No Requirement', '16+', '18+', '21+'],
      practiceFrequency: ['Daily', '4-5 times/week', '2-3 times/week', 'Weekends only', 'Flexible'],
      teamGoals: ['Rank Up', 'Local Tournaments', 'RLCS Path', 'Content Creation', 'Casual Fun']
    }
  }
}