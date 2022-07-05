import {GreenBeadEntity, BlueBeadEntity, RedBeadEntity, BeadEntity, BeadRoad, BigRoad} from "marga"
import {Card, Hand, BlackMarkerCard} from "cardation"
import BancoNatural from "./model/result/tag/BancoNatural"
import PuntoNatural from "./model/result/tag/PuntoNatural"
import BaccaratDeck from "./model/collection/BaccaratDeck"
import BaccaratShoe from "./model/collection/BaccaratShoe"
import RecycleShoe from "./model/collection/RecycleShoe"
import BancoPair from "./model/result/tag/BancoPair"
import PuntoPair from "./model/result/tag/PuntoPair"
import HandOutcome from "./model/result/HandOutcome"
import ShoeOutcome from "./model/result/ShoeOutcome"
import PuntoGamer from "./model/gamer/PuntoGamer"
import BancoGamer from "./model/gamer/BancoGamer"
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
	private _punto: PuntoGamer = new PuntoGamer()

	private _banco: BancoGamer = new BancoGamer()

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
		let totalBanco = 0
		let totalPunto = 0
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
			if (houtcome.result === HandResult.BancoWins) {
				totalBanco++
			} else if (houtcome.result === HandResult.PuntoWins) {
				totalPunto++
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
		result.setStatisticInfo(totalBanco, totalPunto, totalTie)
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
		const burntCards: Card[] = shoe.burn()
		this.getRecycleShoe().collect(new Hand(burntCards), false)
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
		const banco = this.getBanco()
		const punto = this.getPunto()
		const shoe = this.getShoe()
		if (this._hasShutdown) {
			throw new EngineError(`[Engine][playOneHand]: the engine has been shutdown before some further invoking!`)
		}
		if (this.isShoeExhausted) {
			throw new EngineError(`[Engine][playOneHand]: method playOneHand could not be avoked when shoe is exhausted!`)
		}
		this.increaseGameIndex()
		this.puntoDraw()
		this.bancoDraw()
		this.puntoDraw()
		this.bancoDraw()
		let bancoScore_num = banco.getPoint()
		let puntoScore_num = punto.getPoint()
		if (puntoScore_num < 8 && bancoScore_num < 8) { // 無天牌
			if (this.shouldPuntoDraw(puntoScore_num)) {
				this.puntoDraw()
			}
			const hasPuntoHit = punto.getHand().getDuplicatedCardArray().length > 2	// 直接給一個函數，返回長度，為了效率
			if (this.shouldBancoDraw(hasPuntoHit, bancoScore_num, punto.getLastCard().getPoint())) {
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
		const outcome = new HandOutcome(winning, 0, 0, bancoHand.getDuplicatedCardArray(),
			puntoHand.getDuplicatedCardArray(), shoe.getShoeIndex(),
			this.getGameIndex())
		this._parseTage(outcome)
		this.getRecycleShoe().collect(banco.getHand(), this._config.shouldShuffleWhileCollectBancoHand)
		this.getRecycleShoe().collect(punto.getHand(), false)
		if (this._prevHandOutcome && outcome.getShoeIndex() === this._prevHandOutcome.getShoeIndex()) {
			outcome.setPreviousHandOutcome(this._prevHandOutcome)
		}
		this._prevHandOutcome = outcome
		return outcome
	}

	private _parseTage(outcome: HandOutcome) :void {
		const {bancoHand} = outcome
		const {puntoHand} = outcome
		const bancoArray = bancoHand.getDuplicatedCardArray()
		const puntoArray = puntoHand.getDuplicatedCardArray()
		if (bancoArray[0].equals(bancoArray[1])) {
			outcome.addTag(new BancoPair(bancoArray[0].getPoint(), bancoArray[0].getCardId()))
		}
		if (puntoArray[0].equals(puntoArray[1])) {
			outcome.addTag(new PuntoPair(puntoArray[0].getPoint(), puntoArray[0].getCardId()))
		}
		if (bancoHand.getPoint() > 7) {
			outcome.addTag(new BancoNatural(bancoHand.getPoint()))
		}
		if (puntoHand.getPoint() > 7) {
			outcome.addTag(new PuntoNatural(puntoHand.getPoint()))
		}
		if (outcome.result == HandResult.BancoWins) {
			if (bancoHand.getPoint() === 6) {
				outcome.addTag(new SuperSix(bancoArray.length))
			}
		}
	}

	getRecycleShoe(): RecycleShoe {
		return this._recycleShoe
	}

	// 黑卡不用理會，黑卡是跟BaccaratShoe綁定的，在class中定義
	puntoDraw(): void {
		let [card] = this.getShoe().deal()
		if (card instanceof BlackMarkerCard) {
			this.isShoeExhausted = true
			;[card] = this.getShoe().deal()
		}
		this.getPunto().acceptCard(card)
	}

	bancoDraw(): void {
		let [card] = this.getShoe().deal()
		if (card instanceof BlackMarkerCard) {
			this.isShoeExhausted = true
			;[card] = this.getShoe().deal()
		}
		this.getBanco().acceptCard(card)
	}

	getShoe(): BaccaratShoe {
		return this._shoe
	}

	getPreviousHandOutcome():HandOutcome | undefined {
		return this._prevHandOutcome
	}

	getPunto(): PuntoGamer {
		return this._punto
	}

	getBanco(): BancoGamer {
		return this._banco
	}

	shouldPuntoDraw(currentScore: number): boolean {
		if (currentScore < 6) {
			return true
		}
		return false
	}

	shouldBancoDraw(puntoHit:boolean, bancoPoint: number, puntoLastScore: number): boolean {
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
