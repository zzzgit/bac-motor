import {BlackMarkerCard, Card, Shoe} from "cardation"
import IBaccaratShoe from "./IBaccaratShoe"


/**
 * 同一時間，只能有一局牌一手牌，可以調用shoe
 * 這個shoe，生成牌，洗牌，檢測牌，三個功能合一，而且牌可以重複利用，只用生成一次而已，每次只需要重新洗牌
 * shoe 只維持自己的index，不維護遊戲的index，因為shoe不知道遊戲規則
 */
class BaccaratShoe extends Shoe implements IBaccaratShoe {
	private _isBurnt: boolean = false

	private _index: number = -1

	private increaseShoeIndex(): void {
		this._index++
	}

	// 未實現
	detect(): boolean {
		return true
	}

	burn(): Card[] {
		// 同一輪，只能burn一次
		if (this._isBurnt) {
			// throw new EngineError(`[BaccaratShoe][burn]: a shoe could not burn more than once!`)
		}
		this._isBurnt = true
		const [firstCard] = this.deal()
		const score = firstCard.getPoint() || 10
		const burntCards = this.deal(score)
		burntCards.unshift(firstCard)
		return burntCards
	}

	insertBlackCard(place:number):void {
		this.insertCard(place, blackCard)
	}

	getShoeIndex(): number {
		return this._index
	}


	resetShoeIndex():void {
		this._index = -1
	}

	shuffle():void {
		super.shuffle()
		// 這一行，或者放在detect下面
		this.increaseShoeIndex()
	}
}

const blackCard = new BlackMarkerCard()

export default BaccaratShoe
