;; Satoshi's Dungeon - Leaderboard Smart Contract
;; Stores high scores and player achievements on the Stacks blockchain

;; ============================================
;; DATA VARIABLES
;; ============================================

(define-data-var contract-owner principal tx-sender)
(define-data-var total-players uint u0)
(define-data-var total-games uint u0)

;; ============================================
;; DATA MAPS
;; ============================================

;; All-time leaderboard
(define-map leaderboard
  { player: principal }
  { 
    high-score: uint,
    total-games: uint,
    total-kills: uint,
    highest-level: uint,
    last-played: uint
  }
)

;; Daily leaderboard (resets every ~144 blocks ≈ 1 day)
(define-map daily-leaderboard
  { player: principal, day: uint }
  { score: uint, level: uint, kills: uint }
)

;; Achievement tracking
(define-map achievements
  { player: principal }
  {
    first-kill: bool,
    ten-kills: bool,
    fifty-kills: bool,
    hundred-kills: bool,
    first-boss: bool,
    level-10: bool,
    level-25: bool,
    master-miner: bool
  }
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-player-stats (player principal))
  (default-to 
    { high-score: u0, total-games: u0, total-kills: u0, highest-level: u0, last-played: u0 }
    (map-get? leaderboard { player: player })
  )
)

(define-read-only (get-daily-score (player principal) (day uint))
  (default-to 
    { score: u0, level: u0, kills: u0 }
    (map-get? daily-leaderboard { player: player, day: day })
  )
)

(define-read-only (get-player-achievements (player principal))
  (default-to
    {
      first-kill: false,
      ten-kills: false,
      fifty-kills: false,
      hundred-kills: false,
      first-boss: false,
      level-10: false,
      level-25: false,
      master-miner: false
    }
    (map-get? achievements { player: player })
  )
)

(define-read-only (get-total-players)
  (var-get total-players)
)

(define-read-only (get-total-games)
  (var-get total-games)
)

(define-read-only (get-current-day)
  (/ block-height u144)
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
      (current-block block-height)
      (current-day (/ block-height u144))
      (is-new-player (is-eq current-games u0))
    )
    (begin
      ;; Update all-time leaderboard
      (map-set leaderboard
        { player: player }
        {
          high-score: (if (> score current-high-score) score current-high-score),
          total-games: (+ current-games u1),
          total-kills: (+ current-total-kills kills),
          highest-level: (if (> level current-highest-level) level current-highest-level),
          last-played: current-block
        }
      )
      
      ;; Update daily leaderboard (only if better than today's score)
      (let
        (
          (daily-score (get score (get-daily-score player current-day)))
        )
        (if (> score daily-score)
          (map-set daily-leaderboard
            { player: player, day: current-day }
            { score: score, level: level, kills: kills }
          )
          false
        )
      )
      
      ;; Increment counters
      (if is-new-player
        (var-set total-players (+ (var-get total-players) u1))
        false
      )
      (var-set total-games (+ (var-get total-games) u1))
      
      (ok { 
        score: score, 
        new-high-score: (> score current-high-score),
        day: current-day,
        is-new-player: is-new-player
      })
    )
  )
)

(define-public (unlock-achievement (achievement-type (string-ascii 20)))
  (let
    (
      (player tx-sender)
      (current-achievements (get-player-achievements player))
    )
    (begin
      (map-set achievements
        { player: player }
        (merge current-achievements
          (if (is-eq achievement-type "first-kill")
            { first-kill: true }
            (if (is-eq achievement-type "ten-kills")
              { ten-kills: true }
              (if (is-eq achievement-type "fifty-kills")
                { fifty-kills: true }
                (if (is-eq achievement-type "hundred-kills")
                  { hundred-kills: true }
                  (if (is-eq achievement-type "first-boss")
                    { first-boss: true }
                    (if (is-eq achievement-type "level-10")
                      { level-10: true }
                      (if (is-eq achievement-type "level-25")
                        { level-25: true }
                        (if (is-eq achievement-type "master-miner")
                          { master-miner: true }
                          { first-kill: false } ;; default case
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
      (ok true)
    )
  )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

(define-public (update-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err u100))
    (var-set contract-owner new-owner)
    (ok true)
  )
)

;; ============================================
;; INITIALIZATION
;; ============================================

(begin
  (print "Satoshi's Dungeon Leaderboard Contract Deployed!")
  (print { contract-owner: (var-get contract-owner) })
)