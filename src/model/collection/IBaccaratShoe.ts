import {BlackMarkerCard, IShoe} from "cardation"

interface IBaccaratShoe extends IShoe {
	burn(): void
	insertBlackCard(index: number, blackCard: BlackMarkerCard): void
	detect(): boolean
	getShoeIndex(): number
}

export default IBaccaratShoe
