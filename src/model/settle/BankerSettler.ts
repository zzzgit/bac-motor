import HandOutcome from "../result/HandOutcome"
import Settler from "./Settler"

class BankerSettler extends Settler {
	getPayout(wager: number, outcome:HandOutcome): number {
		// if (!this.getConfig().isHalfCommission) {
		// 	return wager * 0.95
		// }
		if (outcome.bankerHand.getScore() === 6) {
			return wager / 2
		}
		return wager
	}
}

export default BankerSettler
