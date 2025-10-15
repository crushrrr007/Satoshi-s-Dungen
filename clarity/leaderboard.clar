;; Satoshi's Dungeon - Leaderboard Smart Contract
;; Fixed for Clarity v3 - block-height removed

(define-data-var total-players uint u0)
(define-data-var total-games uint u0)

;; Player statistics
(define-map player-stats
  principal
  {
    high-score: uint,
    total-games: uint,
    total-kills: uint,
    highest-level: uint
  }
)

;; Achievement maps
(define-map achievement-first-kill principal bool)
(define-map achievement-ten-kills principal bool)
(define-map achievement-fifty-kills principal bool)
(define-map achievement-hundred-kills principal bool)
(define-map achievement-first-boss principal bool)
(define-map achievement-level-10 principal bool)
(define-map achievement-level-25 principal bool)
(define-map achievement-master-miner principal bool)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-player-stats (player principal))
  (default-to 
    { 
      high-score: u0, 
      total-games: u0, 
      total-kills: u0, 
      highest-level: u0
    }
    (map-get? player-stats player)
  )
)

(define-read-only (get-achievement-first-kill (player principal))
  (default-to false (map-get? achievement-first-kill player))
)

(define-read-only (get-achievement-ten-kills (player principal))
  (default-to false (map-get? achievement-ten-kills player))
)

(define-read-only (get-achievement-fifty-kills (player principal))
  (default-to false (map-get? achievement-fifty-kills player))
)

(define-read-only (get-achievement-hundred-kills (player principal))
  (default-to false (map-get? achievement-hundred-kills player))
)

(define-read-only (get-achievement-first-boss (player principal))
  (default-to false (map-get? achievement-first-boss player))
)

(define-read-only (get-achievement-level-10 (player principal))
  (default-to false (map-get? achievement-level-10 player))
)

(define-read-only (get-achievement-level-25 (player principal))
  (default-to false (map-get? achievement-level-25 player))
)

(define-read-only (get-achievement-master-miner (player principal))
  (default-to false (map-get? achievement-master-miner player))
)

(define-read-only (get-total-players)
  (var-get total-players)
)

(define-read-only (get-total-games)
  (var-get total-games)
)

;; ============================================
;; PUBLIC FUNCTIONS
;; ============================================

(define-public (submit-score (score uint) (level uint) (kills uint))
  (let
    (
      (player tx-sender)
      (current-stats (get-player-stats player))
      (current-high-score (get high-score current-stats))
      (current-games (get total-games current-stats))
      (current-total-kills (get total-kills current-stats))
      (current-highest-level (get highest-level current-stats))
      (is-new-player (is-eq current-games u0))
      (new-high-score (> score current-high-score))
      (new-highest-level (> level current-highest-level))
    )
    (begin
      ;; Update player stats
      (map-set player-stats
        player
        {
          high-score: (if new-high-score score current-high-score),
          total-games: (+ current-games u1),
          total-kills: (+ current-total-kills kills),
          highest-level: (if new-highest-level level current-highest-level)
        }
      )
      
      ;; Update counters
      (if is-new-player
        (var-set total-players (+ (var-get total-players) u1))
        true
      )
      (var-set total-games (+ (var-get total-games) u1))
      
      ;; Return success
      (ok { 
        score: score, 
        new-high-score: new-high-score,
        is-new-player: is-new-player
      })
    )
  )
)

;; Achievement unlock functions
(define-public (unlock-first-kill)
  (begin
    (map-set achievement-first-kill tx-sender true)
    (ok true)
  )
)

(define-public (unlock-ten-kills)
  (begin
    (map-set achievement-ten-kills tx-sender true)
    (ok true)
  )
)

(define-public (unlock-fifty-kills)
  (begin
    (map-set achievement-fifty-kills tx-sender true)
    (ok true)
  )
)

(define-public (unlock-hundred-kills)
  (begin
    (map-set achievement-hundred-kills tx-sender true)
    (ok true)
  )
)

(define-public (unlock-first-boss)
  (begin
    (map-set achievement-first-boss tx-sender true)
    (ok true)
  )
)

(define-public (unlock-level-10)
  (begin
    (map-set achievement-level-10 tx-sender true)
    (ok true)
  )
)

(define-public (unlock-level-25)
  (begin
    (map-set achievement-level-25 tx-sender true)
    (ok true)
  )
)

(define-public (unlock-master-miner)
  (begin
    (map-set achievement-master-miner tx-sender true)
    (ok true)
  )
)

;; Generic achievement unlock for compatibility
(define-public (unlock-achievement (achievement-type (string-ascii 20)))
  (ok true)
)
