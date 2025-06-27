import { web3Service } from './web3Service';

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  competition: string;
  status: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface PlacedBet {
  id: string;
  matchId: number;
  prediction: 0 | 1 | 2; // 0 = Home, 1 = Draw, 2 = Away
  amount: string;
  status: 'pending' | 'won' | 'lost';
  odds: number;
  match?: Match;
}

class MatchService {
  private apiBaseUrl = '/api/football';
  private apiKey = '021e2a4d3c5d44e2a7451c637a951009';

  /**
   * Recupera le partite programmate dall'API di football-data.org
   */
  public async getScheduledMatches(): Promise<Match[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/matches?status=SCHEDULED&limit=10`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.matches || data.matches.length === 0) {
        throw new Error('No matches available');
      }
      
      // Trasforma i dati dell'API nel nostro formato
      return data.matches.slice(0, 9).map((match: any) => ({
        id: match.id,
        homeTeam: match.homeTeam.name || match.homeTeam.shortName || 'Unknown Team',
        awayTeam: match.awayTeam.name || match.awayTeam.shortName || 'Unknown Team',
        date: new Date(match.utcDate).toLocaleString(),
        competition: match.competition.name,
        status: match.status,
        odds: this.generateOdds(match)
      }));
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      
      // Prova con un endpoint alternativo
      try {
        const response = await fetch(`${this.apiBaseUrl}/competitions/PL/matches?status=SCHEDULED`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.matches && data.matches.length > 0) {
            // Trasforma i dati dell'API nel nostro formato
            return data.matches.slice(0, 9).map((match: any) => ({
              id: match.id,
              homeTeam: match.homeTeam.name || match.homeTeam.shortName || 'Unknown Team',
              awayTeam: match.awayTeam.name || match.awayTeam.shortName || 'Unknown Team',
              date: new Date(match.utcDate).toLocaleString(),
              competition: match.competition.name,
              status: match.status,
              odds: this.generateOdds(match)
            }));
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
      
      // Ritorna dati di esempio se tutte le API falliscono
      return this.getDemoMatches();
    }
  }

  /**
   * Genera quote realistiche per una partita (poiché l'API non fornisce quote)
   */
  private generateOdds(match: any): { home: number; draw: number; away: number } {
    // Genera quote basate sul ranking delle squadre, se disponibile
    let homeStrength = 5;
    let awayStrength = 5;
    
    // Se disponibili, usa i dati del ranking per generare quote più realistiche
    if (match.homeTeam.tla && match.awayTeam.tla) {
      // Mapping di alcune squadre note a valori di forza
      const teamStrength: {[key: string]: number} = {
        'BAR': 9, 'RMA': 9, 'MCI': 9, 'LIV': 8, 'BAY': 8, 'PSG': 8,
        'ARS': 7, 'ATM': 7, 'BVB': 7, 'CHE': 7, 'JUV': 7, 'INT': 7,
        'TOT': 6, 'MIL': 6, 'NAP': 6, 'LEI': 5
      };
      
      homeStrength = teamStrength[match.homeTeam.tla] || 5;
      awayStrength = teamStrength[match.awayTeam.tla] || 5;
    }
    
    // Calcola le quote basate sulla forza delle squadre
    // Le squadre di casa hanno un leggero vantaggio
    const homeAdvantage = 0.5;
    const homeFactor = 10 - homeStrength + 0.5;
    const drawFactor = 3.5 - (Math.abs(homeStrength - awayStrength) * 0.1);
    const awayFactor = 10 - awayStrength + 1.5;
    
    // Aggiungi un po' di casualità alle quote
    const randomFactor = () => (Math.random() * 0.4) - 0.2;
    
    return {
      home: parseFloat((homeFactor + randomFactor()).toFixed(2)),
      draw: parseFloat((drawFactor + randomFactor()).toFixed(2)),
      away: parseFloat((awayFactor + randomFactor()).toFixed(2))
    };
  }

  /**
   * Dati demo da utilizzare come fallback
   */
  private getDemoMatches(): Match[] {
    return [
      {
        id: 1,
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        date: "2024-04-03 20:45",
        competition: "La Liga",
        status: "SCHEDULED",
        odds: { home: 2.1, draw: 3.4, away: 2.8 }
      },
      {
        id: 2,
        homeTeam: "Manchester City",
        awayTeam: "Liverpool",
        date: "2024-04-04 18:30",
        competition: "Premier League",
        status: "SCHEDULED",
        odds: { home: 1.8, draw: 3.5, away: 3.2 }
      },
      {
        id: 3,
        homeTeam: "Bayern Munich",
        awayTeam: "Borussia Dortmund",
        date: "2024-04-05 20:30",
        competition: "Bundesliga",
        status: "SCHEDULED",
        odds: { home: 1.6, draw: 3.8, away: 4.2 }
      },
      {
        id: 4,
        homeTeam: "Inter",
        awayTeam: "Milan",
        date: "2024-04-06 20:45",
        competition: "Serie A",
        status: "SCHEDULED",
        odds: { home: 2.2, draw: 3.2, away: 2.9 }
      },
      {
        id: 5,
        homeTeam: "PSG",
        awayTeam: "Lyon",
        date: "2024-04-07 21:00",
        competition: "Ligue 1",
        status: "SCHEDULED",
        odds: { home: 1.5, draw: 4.1, away: 5.2 }
      },
      {
        id: 6,
        homeTeam: "Arsenal",
        awayTeam: "Tottenham",
        date: "2024-04-08 17:00",
        competition: "Premier League",
        status: "SCHEDULED",
        odds: { home: 1.9, draw: 3.5, away: 3.1 }
      }
    ];
  }

  /**
   * Piazza una scommessa per una partita
   */
  public async placeBet(matchId: number, prediction: 0 | 1 | 2, amount: number): Promise<boolean> {
    try {
      // Piazza la scommessa tramite lo smart contract
      return await web3Service.placeBet(matchId, prediction, amount);
    } catch (error) {
      console.error('Failed to place bet:', error);
      return false;
    }
  }

  /**
   * Recupera le scommesse dell'utente
   */
  public async getUserBets(address: string): Promise<PlacedBet[]> {
    try {
      const bets = await web3Service.getUserBets(address);
      
      // Trasforma i dati in un formato più utilizzabile
      return bets.map((bet: any, index: number) => ({
        id: `${bet.matchId.toString()}-${index}`,
        matchId: bet.matchId.toNumber(),
        prediction: bet.prediction as 0 | 1 | 2,
        amount: ethers.utils.formatUnits(bet.amount, 18),
        status: this.getBetStatus(bet.status),
        odds: 0 // Verrà aggiornato quando recupereremo i dettagli della partita
      }));
    } catch (error) {
      console.error('Failed to get user bets:', error);
      return [];
    }
  }

  /**
   * Converte lo stato numerico di una scommessa in un formato utilizzabile
   */
  private getBetStatus(status: number): 'pending' | 'won' | 'lost' {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'won';
      case 2: return 'lost';
      default: return 'pending';
    }
  }
}

// Esporta un'istanza singola del servizio
export const matchService = new MatchService(); 