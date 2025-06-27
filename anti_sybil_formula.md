# Sistema di Protezione Anti-Coalizione per Piattaforma Scommesse Blockchain

## Problema Identificato
Le malicious coalitions possono manipolare le quote puntando in massa su un outcome sfavorito per gonfiare artificialmente la quota dell'outcome favorito, per poi piazzare grosse puntate su quest'ultimo.

---

## Soluzione Multi-Layer

### 1. Formula Quote Dinamiche con Margine Fisso (3%)
Per mantenere sempre il 3% di margine:
\[
Quota_A = \frac{Pool_{Totale} \times 0.97}{Pool_A}
\]
\[
Quota_B = \frac{Pool_{Totale} \times 0.97}{Pool_B}
\]
Dove:
- \( Pool_A \) = somma puntate su outcome A
- \( Pool_B \) = somma puntate su outcome B
- \( Pool_{Totale} = Pool_A + Pool_B \)

---

### 2. Protezione Anti-Manipolazione Avanzata

#### A) Limite Dinamico per Puntata (Formula Base)
\[
P_{max}(n) = \min(\alpha \times T_{outcome},\; P_{abs},\; \beta \times Pool_{Totale})
\]
- \( \alpha = 0.05-0.15 \) (5-15% del pool sull'outcome)
- \( \beta = 0.02-0.05 \) (2-5% del pool totale)
- \( P_{abs} \) = limite assoluto fisso

#### B) Protezione Anti-Swing Quotes
\[
Impatto_{Max} = \gamma \times Quota_{Attuale}
\]
La puntata viene limitata se causerebbe un cambiamento di quota superiore a \( \gamma \) (es. 20-30%).

#### C) Velocity Limiting (Protezione Temporale)
\[
Limite_{Tempo} = \delta \times Pool_{Outcome} / Tempo_{Rimanente}
\]
Limiti più stringenti man mano che si avvicina l'evento.

---

### 3. Meccanismi Aggiuntivi di Protezione

- **Detection Pattern Sospetti**
  - Whale Detection: Puntate > 2-3 deviazioni standard dalla media
  - Coordination Detection: Più puntate simili nello stesso timeframe
  - Ratio Anomaly: Rapporto pool troppo sbilanciato (es. 95/5)
- **Commit-Reveal Schema**
  - Fase 1: Commit (hash della puntata)
    ```
    commit(keccak256(amount, outcome, nonce))
    ```
  - Fase 2: Reveal (dopo deadline)
    ```
    reveal(amount, outcome, nonce)
    ```
- **Progressive Bonding**
  - Prime N puntate: nessun limite speciale
  - Puntate successive: richiedono "bond" crescente
  - Bond restituito se non si verifica manipolazione

---

### 4. Implementazione Smart Contract (Esempio Solidity)

```solidity
struct Market {
    uint256 poolA;
    uint256 poolB;
    uint256 totalBets;
    uint256 maxBetRatio; // α parameter (es. 10 per 10%)
    uint256 maxImpactRatio; // γ parameter (es. 30 per 30%)
    mapping(address => uint256) userBets;
}

function validateBet(uint256 amount, uint8 outcome) internal view returns (bool) {
    uint256 currentPool = (outcome == 0) ? market.poolA : market.poolB;
    uint256 totalPool = market.poolA + market.poolB;

    // Limite dinamico base
    uint256 maxByPool = (currentPool * market.maxBetRatio) / 100;

    // Limite per impatto quota
    uint256 currentOdds = (totalPool * 97) / currentPool;
    uint256 newPool = currentPool + amount;
    uint256 newOdds = ((totalPool + amount) * 97) / newPool;
    uint256 oddsImpact = (currentOdds > newOdds)
        ? ((currentOdds - newOdds) * 100) / currentOdds
        : ((newOdds - currentOdds) * 100) / currentOdds;

    return amount <= maxByPool && oddsImpact <= market.maxImpactRatio;
}
```

---

### 5. Parametri Consigliati

| Parametro         | Valore    | Descrizione                      |
|-------------------|-----------|----------------------------------|
| α (maxBetRatio)   | 8-12%     | % max del pool per outcome       |
| β (totalPoolRatio)| 3-5%      | % max del pool totale            |
| γ (maxImpactRatio)| 25-35%    | Max variazione quota             |
| δ (velocityFactor)| 0.1-0.3   | Fattore riduzione temporale      |

---

### 6. Monitoraggio e Alert

- **Metriche da Tracciare**
  - Variazione quote per timeframe
  - Distribuzione size delle puntate
  - Pattern temporali di betting
  - Concentrazione per indirizzo/IP
- **Threshold di Alert**
  - Singola puntata > 15% pool outcome
  - Variazione quota > 40% in 10 minuti
  - Ratio pool > 90/10
  - Correlazione alta tra più indirizzi

---

### 7. Considerazioni Blockchain

- **Gas Optimization**
  - Calcoli quote in batch
  - Update periodici invece che real-time
  - Uso di oracle per dati esterni
- **Decentralizzazione vs Protezione**
  - Governance token per modificare parametri
  - Multi-sig per interventi emergenza
  - Timelock per modifiche critiche

---

## Conclusioni

Questo sistema multi-layer fornisce protezione robusta contro coalizioni malintenzionate mantenendo la decentralizzazione e l'efficienza del sistema blockchain. La chiave è bilanciare protezione e usabilità attraverso parametri ben calibrati e monitoraggio continuo.
