import {
	GreenBeadEntity,
	BlueBeadEntity,
	RedBeadEntity,
	BeadEntity,
	BeadRoad,
	BigRoad,
} from "marga"
import {Card, Hand, BlackMarkerCard, Pair} from "cardation"
import BaccaratDeck from "./model/collection/BaccaratDeck"
import BaccaratShoe from "./model/collection/BaccaratShoe"
import RecycleShoe from "./model/collection/RecycleShoe"
import HandOutcome from "./model/result/HandOutcome"
import ShoeOutcome from "./model/result/ShoeOutcome"
import PuntoGamer from "./model/gamer/PuntoGamer"
import BancoGamer from "./model/gamer/BancoGamer"
import defaultConfig from "./config/defaultConfig"
import HandResult from "./model/result/HandResult"
import EngineError from "./error/EngineError"
import Config from "./model/config/Config"
import Free from "./model/mun/Free"
import Bet from "./model/bet/Bet"
import * as samael from "samael"

type BetPretreat = (
	prevBet: Bet | undefined,
	prevOutcome: HandOutcome | undefined
) => Bet
type BetAftertreat = (hcome: HandOutcome) => void
type ShoePretreat = (card: Card | undefined) => void

/**
 * Synchronous engine.
 */
class Engine {
	private _punto: PuntoGamer = new PuntoGamer()

	private _banco: BancoGamer = new BancoGamer()

	private _totalGames: number = 0

	private _shoe: BaccaratShoe = new BaccaratShoe()

	private _prevHandOutcome: HandOutcome | undefined

	private _prevBet: Bet | undefined

	private _config: Config = defaultConfig

	private _handIndex: number = -1

	private _recycleShoe: RecycleShoe = new RecycleShoe()

	private _isExhausted: boolean = false

	private _hasShutdown: boolean = true

	private _hasShoeCustomised: boolean = false

	get isShoeExhausted(): boolean {
		return this._isExhausted
	}

	set isShoeExhausted(value: boolean) {
		this._isExhausted = value
	}

	get isWorking(): boolean {
		return !this._hasShutdown
	}

	/**
	 * Shut down the engine.
	 */
	shutdown(): void {
		console.log(
			`[baccarat-engine]: ${this._totalGames} games within ${
				this.getShoe().getShoeIndex() + 1
			} shoes have been played.`
		)
		// this.isShoeExhausted = true
		this._hasShutdown = true
	}

	/**
	 * Power on the engine with a config, or use the default config.
	 * @param {Config} config
	 */
	powerOn(config: Config = defaultConfig): void {
		if (!this._hasShutdown) {
			throw new EngineError(
				`[Engine][powerOn]: the engine has already been powered on!`
			)
		}
		this._configEngine(config)
		// console.log("引擎啟動：", config)
		this._hasShutdown = false
		this.initializeDecks()
	}

	private _configEngine(config: Config): void {
		const mixin = Object.assign({}, this._config, config)
		this._config = mixin
	}

	/**
	 * Initialize the shoe with 8 decks, or with a customized shoe. This method only be invoked once in the engine's life cycle.
	 */
	private initializeDecks(): void {
		this._shoe.clear()
		if (this._config.customizedShoe) {
			if (this._hasShoeCustomised) {
				throw new EngineError(
					`[Engine][_initializeDecks]: the shoe has been customized before!`
				)
			}
			this.getShoe().pushCustomised(...this._config.customizedShoe)
			this._hasShoeCustomised = true
		} else {
			for (let i = 0; i < 8; i++) {
				// 沒有重複利用同一個deck,但是initialise也只是用一次
				this.getShoe().pushDeck(new BaccaratDeck())
			}
		}
	}

	/**
	 * Play one shoe.
	 * @param {BetPretreat} beforeBet - (prevBet: Bet | undefined, prevOutcome: HandOutcome | undefined) => Bet
	 * @param {BetAftertreat} afterBet - (hcome: HandOutcome) => void
	 * @param {ShoePretreat} beforeShoe - (card: Card | undefined) => void
	 * @return {ShoeOutcome}
	 */
	playOneShoe(
		beforeBet: BetPretreat = () => {
			return new Bet(new Free(), 0)
		},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		afterBet: BetAftertreat = () => {},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		beforeShoe: ShoePretreat = () => {}
	): ShoeOutcome {
		if (this._hasShutdown) {
			throw new EngineError(
				`[Engine][playOneShoe]: the engine has been shutdown before some further invoking!`
			)
		}
		if (this._shoe.getLength() < 6) {
			throw new EngineError(
				`[Engine][playOneShoe]: card left in the shoe should not be less than 6!`
			)
		}
		if (this._config.isTryrun) {
			// ////
		}
		const firstCard = this.prepareShoe()
		beforeShoe(firstCard)
		const hcomeoutMap = new Map<string | number, HandOutcome>()
		let houtcome: HandOutcome
		let firstcomeout: HandOutcome | undefined
		let totalBanco = 0
		let totalPunto = 0
		let totalTie = 0
		// both and any, not showed here, retrieve it from BeadRoad instead
		const pair = {
			banco: 0,
			punto: 0,
			total: 0,
		}
		const shoeIndex = this.getShoe().getShoeIndex()
		const beadRoad = new BeadRoad(shoeIndex)
		do {
			const bet: Bet = beforeBet(
				this.getPreviousBet(),
				this.getPreviousHandOutcome()
			)
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
			if (this.getShoe().getLength() < 6) {
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
			if (houtcome.result === HandResult.BancoWins) {
				totalBanco++
			} else if (houtcome.result === HandResult.PuntoWins) {
				totalPunto++
			} else {
				totalTie++
			}
			const phand = houtcome.puntoHand.getDuplicatedCardArray()
			const bhand = houtcome.bancoHand.getDuplicatedCardArray()
			phand.length = 2
			bhand.length = 2
			if (Pair.isPair(phand)) {
				pair.punto++
				pair.total++
			}
			if (Pair.isPair(bhand)) {
				pair.banco++
				pair.total++
			}
			if (this._config.shouldGenerateRoad) {
				const beadEntity = this._parseOutcome2BeadEntity(houtcome)
				beadRoad.addEntity(beadEntity)
			}
			afterBet?.(houtcome)
		} while (!this.isShoeExhausted)
		const result: ShoeOutcome = new ShoeOutcome(shoeIndex, houtcome)
		result.setStatisticInfo(totalBanco, totalPunto, totalTie, pair)
		result.setFirstHandOutcome(firstcomeout)
		if (this._config.shouldGenerateRoad) {
			result.setBeadRoad(beadRoad)
			result.setBigRoad(BigRoad.from(beadRoad))
		}
		result.setOutcomeMap(hcomeoutMap)
		this.recycleCardToShoe()
		return result
	}

	private _parseOutcome2BeadEntity(hcomeout: HandOutcome): BeadEntity {
		let bead: BeadEntity
		if (hcomeout.result === HandResult.BancoWins) {
			bead = new RedBeadEntity(hcomeout.handIndex)
		} else if (hcomeout.result === HandResult.PuntoWins) {
			bead = new BlueBeadEntity(hcomeout.handIndex)
		} else {
			bead = new GreenBeadEntity(hcomeout.handIndex)
		}
		return bead
	}

	/**
	 * 由收集箱放入 baccarat shoe
	 */
	private recycleCardToShoe(): void {
		this.getShoe().pushCard(...this.getRecycleShoe().getDuplicatedCardArray())
		this.getRecycleShoe().clear()
	}

	/**
	 * Reset, shuffle, cut, detect, burn, insert black card. These actions must be done to start a new shoe.
	 * @return {Card} The first card of the shoe.
	 */
	private prepareShoe(): Card | undefined {
		const shoe = this.getShoe()
		this.resetGameIndex()
		shoe.reBorn()
		this._prevHandOutcome = undefined
		if (this._config.shouldShuffle) {
			shoe.shuffle()
		}
		if (this._config.shouldDetectShoe) {
			shoe.detect()
		}
		if (this._config.shouldCutShoe) {
			shoe.cut(samael.range(280, 410))
		}
		if (this._config.shouldUseBlackCard) {
			this.insertBlackCard()
		}
		let burntCards: Card[] = []
		if (this._config.shouldBurnCard) {
			burntCards = shoe.burn()
		}
		this.getRecycleShoe().collect(new Hand(burntCards), false)
		this.isShoeExhausted = false
		return burntCards[0]
	}

	private resetGameIndex(): void {
		this._handIndex = -1
	}

	/**
	 * Insert a black card into the shoe by dealer.
	 */
	private insertBlackCard(): void {
		const shoe = this.getShoe()
		const blackPlace: number = samael.range(32, 50)
		shoe.insertBlackCard(blackPlace)
	}

	playOneHand(): HandOutcome {
		const banco = this.getBanco()
		const punto = this.getPunto()
		const shoe = this.getShoe()
		if (this._hasShutdown) {
			throw new EngineError(
				`[Engine][playOneHand]: the engine has been shutdown before some further invoking!`
			)
		}
		if (this.isShoeExhausted) {
			throw new EngineError(
				`[Engine][playOneHand]: method playOneHand could not be avoked when shoe is exhausted!`
			)
		}
		this.increaseGameIndex()
		this.puntoDraw()
		this.bancoDraw()
		this.puntoDraw()
		this.bancoDraw()
		let bancoScore_num = banco.getPoint()
		let puntoScore_num = punto.getPoint()
		if (puntoScore_num < 8 && bancoScore_num < 8) {
			// 無天牌
			if (this.shouldPuntoDraw(puntoScore_num)) {
				this.puntoDraw()
			}
			const hasPuntoHit = punto.getHand().getLength() > 2
			if (
				this.shouldBancoDraw(
					hasPuntoHit,
					bancoScore_num,
					punto.getLastCard().getPoint()
				)
			) {
				this.bancoDraw()
			}
		}
		const bancoHand = banco.getHand()
		const puntoHand = punto.getHand()
		bancoScore_num = banco.getPoint()
		puntoScore_num = punto.getPoint()
		let winning
		if (bancoScore_num - puntoScore_num > 0) {
			winning = HandResult.BancoWins
		} else if (bancoScore_num - puntoScore_num === 0) {
			winning = HandResult.Tie
		} else {
			winning = HandResult.PuntoWins
		}
		// bancoHand.getDuplicatedCardArray() 傳出
		const outcome = new HandOutcome(
			winning,
			0,
			0,
			bancoHand.getDuplicatedCardArray(),
			puntoHand.getDuplicatedCardArray(),
			shoe.getShoeIndex(),
			this.getGameIndex()
		)
		// bancoHand 會被銷毀
		this.getRecycleShoe().collect(
			bancoHand,
			this._config.shouldShuffleWhileCollectBancoHand
		)
		this.getRecycleShoe().collect(puntoHand, false)
		if (
			this._prevHandOutcome &&
			outcome.getShoeIndex() === this._prevHandOutcome.getShoeIndex()
		) {
			outcome.setPreviousHandOutcome(this._prevHandOutcome)
		}
		this._prevHandOutcome = outcome
		return outcome
	}

	private getRecycleShoe(): RecycleShoe {
		return this._recycleShoe
	}

	/**
	 * Draw a card for punto.
	 */
	private puntoDraw(): void {
		let [card] = this.getShoe().deal()
		if (card instanceof BlackMarkerCard) {
			this.isShoeExhausted = true
			;[card] = this.getShoe().deal()
		}
		this.getPunto().acceptCard(card)
	}

	/**
	 * Draw a card for banco.
	 */
	private bancoDraw(): void {
		let [card] = this.getShoe().deal()
		if (card instanceof BlackMarkerCard) {
			this.isShoeExhausted = true
			;[card] = this.getShoe().deal()
		}
		this.getBanco().acceptCard(card)
	}

	private getShoe(): BaccaratShoe {
		return this._shoe
	}

	private getPreviousHandOutcome(): HandOutcome | undefined {
		return this._prevHandOutcome
	}

	private getPunto(): PuntoGamer {
		return this._punto
	}

	private getBanco(): BancoGamer {
		return this._banco
	}

	/**
	 * Whether punto should draw a card.
	 * @param {number} currentScore the current points of the punto hand
	 * @return {boolean} whether punto should draw a card
	 */
	private shouldPuntoDraw(currentScore: number): boolean {
		if (currentScore < 6) {
			return true
		}
		return false
	}

	/**
	 * Whether banco should draw a card.
	 * @param {boolean} puntoHit did punto hit
	 * @param {number} bancoPoint banco point
	 * @param {number} puntoLastScore the point of the last card of punto
	 * @return {boolean} whether banco should draw a card
	 */
	private shouldBancoDraw(
		puntoHit: boolean,
		bancoPoint: number,
		puntoLastScore: number
	): boolean {
		if (!puntoHit) {
			if (bancoPoint < 6) {
				return true
			}
			return false
		}
		if (bancoPoint > 6) {
			return false
		}
		if (bancoPoint < 3) {
			return true
		}
		if (bancoPoint === 3) {
			if (puntoLastScore === 8) {
				return false
			}
			return true
		}
		if (bancoPoint === 4) {
			if (puntoLastScore < 2 || puntoLastScore > 7) {
				return false
			}
			return true
		}
		if (bancoPoint === 5) {
			if (puntoLastScore < 4 || puntoLastScore > 7) {
				return false
			}
			return true
		}
		if (bancoPoint === 6) {
			if (puntoLastScore < 6 || puntoLastScore > 7) {
				return false
			}
			return true
		}
		return false
	}

	/**
	 * The game ID inside the shoe.
	 * @return {number} the game index
	 */
	getGameIndex(): number {
		return this._handIndex
	}

	/**
	 * Increase the game index by 1, and return the new game index.
	 * @return {number} the new game index
	 */
	private increaseGameIndex(): number {
		this._handIndex++
		this._totalGames++
		return this._handIndex
	}

	/**
	 * The previous bet.
	 * @return {Bet} the previous bet
	 */
	private getPreviousBet(): Bet | undefined {
		return this._prevBet
	}
}

export default Engine
