import axios from 'axios';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished';
  score?: {
    home: number;
    away: number;
  };
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

interface Sport {
  id: string;
  name: string;
  icon: string;
}

class SportsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Replace with your actual API key and base URL
    this.apiKey = process.env.REACT_APP_SPORTRADAR_API_KEY || '';
    this.baseUrl = 'https://api.sportradar.com/v1';
  }

  async getMatches(sport: string): Promise<Match[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/matches`, {
        params: {
          sport,
          api_key: this.apiKey,
        },
      });

      return response.data.matches.map((match: any) => ({
        id: match.id,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        startTime: match.start_time,
        status: match.status,
        score: match.score,
        odds: match.odds,
      }));
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  async getMatchDetails(matchId: string): Promise<Match> {
    try {
      const response = await axios.get(`${this.baseUrl}/matches/${matchId}`, {
        params: {
          api_key: this.apiKey,
        },
      });

      const match = response.data;
      return {
        id: match.id,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        startTime: match.start_time,
        status: match.status,
        score: match.score,
        odds: match.odds,
      };
    } catch (error) {
      console.error('Error fetching match details:', error);
      throw error;
    }
  }

  async getSports(): Promise<Sport[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/sports`, {
        params: {
          api_key: this.apiKey,
        },
      });

      return response.data.sports.map((sport: any) => ({
        id: sport.id,
        name: sport.name,
        icon: sport.icon,
      }));
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw error;
    }
  }

  // Mock data for development
  getMockMatches(): Match[] {
    return [
      {
        id: '1',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        startTime: '2024-03-20T20:00:00Z',
        status: 'scheduled',
        odds: {
          home: 1.5,
          draw: 3.2,
          away: 4.0,
        },
      },
      {
        id: '2',
        homeTeam: 'Team C',
        awayTeam: 'Team D',
        startTime: '2024-03-20T21:00:00Z',
        status: 'live',
        score: {
          home: 2,
          away: 1,
        },
        odds: {
          home: 2.1,
          draw: 3.0,
          away: 3.5,
        },
      },
    ];
  }

  getMockSports(): Sport[] {
    return [
      {
        id: 'football',
        name: 'Football',
        icon: '⚽',
      },
      {
        id: 'basketball',
        name: 'Basketball',
        icon: '🏀',
      },
      {
        id: 'tennis',
        name: 'Tennis',
        icon: '🎾',
      },
    ];
  }
}

export const sportsService = new SportsService(); 