import Config from "../model/config/Config"
import defaultGameRules from "./defaultGameRules"
import defaultPayoutTable from "./defaultPayoutTable"

const defaultConfig:Config = {
	gameRules: defaultGameRules,
	payoutTable: defaultPayoutTable,
	shouldDetectShoe: false,
	isTryrun: false,
	shouldCutShoe: true,
	shouldUseBlackCard: true,
	shouldBurnCard: true,
	shouldShuffle: true,
	shouldGenerateRoad: true,
	shouldGenerateSmallRoad: false,
	shouldGenerateOtherRoad: false,
	shouldShuffleWhileCollectBancoHand: true,
}

export default defaultConfig
