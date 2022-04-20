import {GreenBeadEntity, BlueBeadEntity, RedBeadEntity, BeadEntity, BeadRoad, BigRoad} from "marga"
import {Card, Hand, BlackMarkerCard} from "cardation"
import BankerNatural from "./model/result/tag/BankerNatural"
import PlayerNatural from "./model/result/tag/PlayerNatural"
import BaccaratDeck from "./model/collection/BaccaratDeck"
import BaccaratShoe from "./model/collection/BaccaratShoe"
import RecycleShoe from "./model/collection/RecycleShoe"
import BankerPair from "./model/result/tag/BankerPair"
import PlayerPair from "./model/result/tag/PlayerPair"
import HandOutcome from "./model/result/HandOutcome"
import ShoeOutcome from "./model/result/ShoeOutcome"
import PlayerGamer from "./model/gamer/PlayerGamer"
import BankerGamer from "./model/gamer/BankerGamer"
import defaultConfig from "./config/defaultConfig"
import SuperSix from "./model/result/tag/SuperSix"
import HandResult from "./model/result/HandResult"
import EngineError from "./error/EngineError"
import Config from "./model/config/Config"
import Free from "./model/mun/Free"
import Bet from "./model/bet/Bet"
import samael from "samael"

type BetPretreat = (prevBet: Bet | undefined, prevOutcome: HandOutcome | undefined) => Bet
type BetAftertreat = (hcome: HandOutcome) => void

// 抽象一個game，提出一些常用函數
class Engine {
	private _player: PlayerGamer = new PlayerGamer()

	private _banker: BankerGamer = new BankerGamer()

	private _totalGames : number = 0

	private _shoe: BaccaratShoe = new BaccaratShoe()

	private _prevHandOutcome: HandOutcome | undefined

	private _prevBet: Bet | undefined

	private _config: Config = defaultConfig

	private _handIndex:number = -1

	private _recycleShoe: RecycleShoe = new RecycleShoe()

	private _isExhausted: boolean = false

	private _hasShutdown: boolean = false

	private _hasShoeCustomised: boolean = false


	get isShoeExhausted(): boolean {
		return this._isExhausted
	}

	set isShoeExhausted(value: boolean) {
		this._isExhausted = value
	}

	shutdown(): void {
		console.log(`[baccarat-engine]: ${this._totalGames} games within ${this.getShoe().getShoeIndex() + 1} shoes have been played.`)
		this.isShoeExhausted = true
		this._hasShutdown = true
	}

	powerOn(config: Config = defaultConfig): void {
		this.config(config)
		// console.log("引擎啟動：", config)
		this._hasShutdown = false
		this.initializeDecks()
	}

	private config(config: Config):void {
		const mixin = Object.assign({}, this._config, config)
		this._config = mixin
	}

	initializeDecks():void {
		this._shoe.clear()
		if (this._config.customizedShoe) {
			if (!this._hasShoeCustomised) {
				this.getShoe().pushCard(...this._config.customizedShoe)
				this._hasShoeCustomised = true
			}
		} else {
			for (let i = 0; i < 8; i++) {
				// 沒有重複利用同一個deck,但是initialise也只是用一次
				this.getShoe().pushDeck(new BaccaratDeck())
			}
		}
	}

	playOneShoe(beforeBet: BetPretreat = ()=>{return new Bet(new Free(), 0)}, afterBet: BetAftertreat = ()=>{}):ShoeOutcome {
		if (this._hasShutdown) {
			throw new EngineError(`[Engine][playOneShoe]: the engine has been shutdown before some further invoking!`)
		}
		if (this._shoe.getDuplicatedCardArray().length < 6) {
			throw new EngineError(`[Engine][playOneShoe]: card left in the shoe should not be less than 6!`)
		}
		if (this._config.isTryrun) {
			// ////
		}
		this.prepareShoe()
		const hcomeoutMap = new Map<string|number, HandOutcome>()
		let houtcome: HandOutcome
		let firstcomeout: HandOutcome |undefined
		let totalBankker = 0
		let totalPlayer = 0
		let totalTie = 0
		const beadRoad = new BeadRoad(this.getShoe().getShoeIndex())
		do {
			const bet: Bet = beforeBet(this.getPreviousBet(), this.getPreviousHandOutcome())
			const mun = bet.getMun()
			if (!(mun instanceof Free)) {
				if (this._prevBet) {
					bet.setPreviousBet(this._prevBet)
				}
				this._prevBet = bet
			} else {
				// this._prevBet = bet
			}
			houtcome = this.playOneHand()
			if (this.getShoe().getDuplicatedCardArray().length < 6) {
				this.isShoeExhausted = true
			}
			hcomeoutMap.set(houtcome.handIndex, houtcome)
			if (!firstcomeout) {
				firstcomeout = houtcome
			}
			if (!(mun instanceof Free)) {
				bet.setOutcome(houtcome)
			}
			const payout = HandOutcome.getPayout(bet, houtcome, this._config)
			houtcome.setWager(bet.getWager())
			houtcome.setPayout(payout)
			if (houtcome.result === HandResult.BankerWins) {
				totalBankker++
			} else if (houtcome.result === HandResult.PlayerWins) {
				totalPlayer++
			} else {
				totalTie++
			}
			if (this._config.shouldGenerateRoad) {
				const beadEntity = this._parseComeout2BeadEntity(houtcome)
				beadRoad.addEntity(beadEntity)
			}
			afterBet?.(houtcome)
		} while (!this.isShoeExhausted)
		const result: ShoeOutcome = new ShoeOutcome(this.getShoe().getShoeIndex(), houtcome, 3)
		result.setStatisticInfo(totalBankker, totalPlayer, totalTie)
		result.setFirstHandOutcome(firstcomeout)
		if (this._config.shouldGenerateRoad) {
			result.setBeadRoad(beadRoad)
			result.setBigRoad(BigRoad.from(beadRoad))
		}
		result.setComeoutMap(hcomeoutMap)
		this.recycleCardToShoe()
		return result
	}

	private _parseComeout2BeadEntity(hcomeout: HandOutcome): BeadEntity {
		let bead: BeadEntity
		if (hcomeout.result === HandResult.BankerWins) {
			bead = new RedBeadEntity(hcomeout.handIndex)
		} else if (hcomeout.result === HandResult.PlayerWins) {
			bead = new BlueBeadEntity(hcomeout.handIndex)
		} else {
			bead = new GreenBeadEntity(hcomeout.handIndex)
		}
		return bead
	}

	/**
	 * 由收集箱放入shoe
	 */
	private recycleCardToShoe():void {
		// this.getRecycleShoe().pushCard(...this.getShoe().getDuplicatedCardArray())
		this.getShoe().pushCard(...this.getRecycleShoe().getDuplicatedCardArray())
		this.getRecycleShoe().clear()
	}

	private prepareShoe():void {
		const shoe = this.getShoe()
		this.resetGameIndex()
		this._prevHandOutcome = undefined
		if (this._config.shouldShuffle) {
			shoe.shuffle()
		}
		if (this._config.shouldDetectShoe) {
			shoe.detect()
		}
		if (this._config.shouldCutShoe) {
			shoe.cut(samael.randomInt(270))
		}
		if (this._config.shouldUseBlackCard) {
			this.insertBlackCard()
		}
		if (this._config.shouldUseBlackCard) {
			const burntCards: Card[] = shoe.burn()
			this.getRecycleShoe().collect(new Hand(burntCards), false)
		}
		this.isShoeExhausted = false
	}

	resetGameIndex():void {
		this._handIndex = -1
	}

	insertBlackCard():void {
		const shoe = this.getShoe()
		const cutPlace = samael.randomInt(280, 410)
		shoe.cut(cutPlace)
		const blackPlace: number = samael.randomInt(12, 20)
		shoe.insertBlackCard(blackPlace)
	}

	playOneHand(): HandOutcome {
		const banker = this.getBanker()
		const player = this.getPlayer()
		const shoe = this.getShoe()
		if (this._hasShutdown) {
			throw new EngineError(`[Engine][playOneHand]: the engine has been shutdown before some further invoking!`)
		}
		if (this.isShoeExhausted) {
			throw new EngineError(`[Engine][playOneHand]: method playOneHand could not be avoked when shoe is exhausted!`)
		}
		this.increaseGameIndex()
		this.playerDraw()
		this.bankerDraw()
		this.playerDraw()
		this.bankerDraw()
		let bankerScore_num = banker.getPoint()
		let playerScore_num = player.getPoint()
		if (playerScore_num < 8 && bankerScore_num < 8) { // 無天牌
			if (this.shouldPlayerDraw(playerScore_num)) {
				this.playerDraw()
			}
			const hasPlayerHit = player.getHand().getDuplicatedCardArray().length > 2	// 直接給一個函數，返回長度，為了效率
			if (this.shouldBankerDraw(hasPlayerHit, bankerScore_num, player.getLastCard().getPoint())) {
				this.bankerDraw()
			}
		}
		const bankerHand = banker.getHand()
		const playerHand = player.getHand()
		bankerScore_num = banker.getPoint()
		playerScore_num = player.getPoint()
		let winning
		if (bankerScore_num - playerScore_num > 0) {
			winning = HandResult.BankerWins
		} else if (bankerScore_num - playerScore_num === 0) {
			winning = HandResult.Tie
		} else {
			winning = HandResult.PlayerWins
		}
		const outcome = new HandOutcome(winning, 0, 0, bankerHand.getDuplicatedCardArray(),
			playerHand.getDuplicatedCardArray(), shoe.getShoeIndex(),
			this.getGameIndex())
		this._parseTage(outcome)
		this.getRecycleShoe().collect(banker.getHand(), this._config.shouldShuffleWhileCollectBankerHand)
		this.getRecycleShoe().collect(player.getHand(), false)
		if (this._prevHandOutcome && outcome.getShoeIndex() === this._prevHandOutcome.getShoeIndex()) {
			outcome.setPreviousHandOutcome(this._prevHandOutcome)
		}
		this._prevHandOutcome = outcome
		return outcome
	}

	private _parseTage(outcome: HandOutcome) :void {
		const {bankerHand} = outcome
		const {playerHand} = outcome
		const bankerArray = bankerHand.getDuplicatedCardArray()
		const playerArray = playerHand.getDuplicatedCardArray()
		if (bankerArray[0].equals(bankerArray[1])) {
			outcome.addTag(new BankerPair(bankerArray[0].getPoint(), bankerArray[0].getCardId()))
		}
		if (playerArray[0].equals(playerArray[1])) {
			outcome.addTag(new PlayerPair(playerArray[0].getPoint(), playerArray[0].getCardId()))
		}
		if (bankerHand.getPoint() > 7) {
			outcome.addTag(new BankerNatural(bankerHand.getPoint()))
		}
		if (playerHand.getPoint() > 7) {
			outcome.addTag(new PlayerNatural(playerHand.getPoint()))
		}
		if (outcome.result == HandResult.BankerWins) {
			if (bankerHand.getPoint() === 6) {
				outcome.addTag(new SuperSix(bankerArray.length))
			}
		}
	}

	getRecycleShoe(): RecycleShoe {
		return this._recycleShoe
	}

	// 黑卡不用理會，黑卡是跟BaccaratShoe綁定的，在class中定義
	playerDraw(): void {
		let [card] = this.getShoe().deal()
		if (card instanceof BlackMarkerCard) {
			this.isShoeExhausted = true
			;[card] = this.getShoe().deal()
		}
		this.getPlayer().acceptCard(card)
	}

	bankerDraw(): void {
		let [card] = this.getShoe().deal()
		if (card instanceof BlackMarkerCard) {
			this.isShoeExhausted = true
			;[card] = this.getShoe().deal()
		}
		this.getBanker().acceptCard(card)
	}

	getShoe(): BaccaratShoe {
		return this._shoe
	}

	getPreviousHandOutcome():HandOutcome | undefined {
		return this._prevHandOutcome
	}

	getPlayer(): PlayerGamer {
		return this._player
	}

	getBanker(): BankerGamer {
		return this._banker
	}

	shouldPlayerDraw(currentScore: number): boolean {
		if (currentScore < 6) {
			return true
		}
		return false
	}

	shouldBankerDraw(playerHit:boolean, bankerScore: number, playerLastScore: number): boolean {
		if (!playerHit) {
			if (bankerScore < 6) {
				return true
			}
			return false
		}
		if (bankerScore > 6) {
			return false
		}
		if (bankerScore < 3) {
			return true
		}
		if (bankerScore === 3) {
			if (playerLastScore === 8) {
				return false
			}
			return true
		}
		if (bankerScore === 4) {
			if (playerLastScore < 2 || playerLastScore > 7) {
				return false
			}
			return true
		}
		if (bankerScore === 5) {
			if (playerLastScore < 4 || playerLastScore > 7) {
				return false
			}
			return true
		}
		if (bankerScore === 6) {
			if (playerLastScore < 6 || playerLastScore > 7) {
				return false
			}
			return true
		}
		return false
	}

	getGameIndex():number {
		return this._handIndex
	}

	increaseGameIndex():number {
		this._handIndex++
		this._totalGames++
		return this._handIndex
	}

	getPreviousBet(): Bet | undefined {
		return this._prevBet
	}
}

export default Engine
