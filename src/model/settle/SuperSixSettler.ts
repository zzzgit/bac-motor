import HandOutcome from "../result/HandOutcome"
import Settler from "./Settler"

class SuperSixSettler extends Settler {
	getPayout(wager: number, outcome: HandOutcome): number {
		if (outcome.bancoHand.getDuplicatedCardArray().length === 2) {
			return wager * 12
		}
		return wager * 20
	}
}

export default SuperSixSettler
