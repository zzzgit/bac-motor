import HandOutcome from "../result/HandOutcome"
import Settler from "./Settler"

class BancoSettler extends Settler {
	getPayout(wager: number, outcome: HandOutcome): number {
		// if (!this.getConfig().isHalfCommission) {
		// 	return wager * 0.95
		// }
		if (outcome.bancoHand.getPoint() === 6) {
			return wager / 2
		}
		return wager
	}
}

export default BancoSettler
